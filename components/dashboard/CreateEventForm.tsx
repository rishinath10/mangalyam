"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { EVENT_TYPE_LABELS, EVENT_TYPES } from "@/lib/events";

export function CreateEventForm() {
  const router = useRouter();
  const [hostNames, setHostNames] = useState("");
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostNames, eventType }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create the event.");
      setPending(false);
      return;
    }

    const event = await res.json();
    router.push(`/dashboard/events/${event.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: "1.2rem" }}>
      <div>
        <span className="field-label">Occasion</span>
        <div className="chiprow">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="chip"
              aria-pressed={eventType === type}
              onClick={() => setEventType(type)}
            >
              {EVENT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <Input
        id="hostNames"
        label={eventType === "wedding" ? "Couple's names" : "Who is this for"}
        placeholder={eventType === "wedding" ? "Rishi & Gaayathri" : "The Kumar Family"}
        required
        maxLength={120}
        value={hostNames}
        onChange={(e) => setHostNames(e.target.value)}
      />

      {error && (
        <p role="alert" className="notice notice-bad">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create event"}
      </Button>
    </form>
  );
}
