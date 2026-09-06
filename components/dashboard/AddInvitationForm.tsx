"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CeremonyType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { CEREMONY_LABELS, CEREMONY_TYPES } from "@/lib/ceremonies";
import { DEFAULT_TEMPLATE_ID, resolveAccentColor } from "@/lib/templates/registry";

export function AddInvitationForm({ weddingId }: { weddingId: string }) {
  const router = useRouter();
  const [ceremonyType, setCeremonyType] = useState<CeremonyType>("haldi");
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch(`/api/weddings/${weddingId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ceremonyType,
        ...(ceremonyType === "custom" ? { customCeremonyName: customName } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not add the ceremony.");
      setPending(false);
      return;
    }

    const invitation = await res.json();
    router.push(`/dashboard/invitations/${invitation.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-600">
          Ceremony
        </span>
        <div className="flex flex-wrap gap-2">
          {CEREMONY_TYPES.map((type) => {
            // Show each ceremony in its own accent so the colour system is
            // visible at the point of choosing, not a surprise afterwards.
            const accent = resolveAccentColor(DEFAULT_TEMPLATE_ID, type);
            const selected = ceremonyType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setCeremonyType(type)}
                aria-pressed={selected}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition ${
                  selected
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden="true"
                />
                {type === "custom" ? "Custom" : CEREMONY_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {ceremonyType === "custom" && (
        <Input
          id="customName"
          label="Ceremony name"
          placeholder="Nalangu"
          required
          maxLength={60}
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
        />
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add ceremony invitation"}
      </Button>
    </form>
  );
}
