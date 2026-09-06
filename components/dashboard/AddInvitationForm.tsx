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
    <form onSubmit={onSubmit} style={{ display: "grid", gap: "1.2rem" }}>
      <div>
        <span className="field-label">Ceremony</span>
        <div className="chiprow">
          {CEREMONY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="chip"
              aria-pressed={ceremonyType === type}
              onClick={() => setCeremonyType(type)}
            >
              <i style={{ background: resolveAccentColor(DEFAULT_TEMPLATE_ID, type) }} />
              {CEREMONY_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {ceremonyType === "custom" && (
        <Input
          id="customName"
          label="Ceremony name"
          placeholder="Mappillai Azhaippu"
          required
          maxLength={60}
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
        />
      )}

      {error && (
        <p role="alert" className="notice notice-bad">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add ceremony invitation"}
        </Button>
      </div>
    </form>
  );
}
