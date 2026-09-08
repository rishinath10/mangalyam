"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * The support action for an event: set its invitation allowance.
 *
 * This is the fix for a payment that succeeded at the gateway but never
 * produced an Entitlement row — the customer has been charged and cannot
 * publish. It is also how a custom job is fulfilled once it is paid for
 * outside the self-serve flow.
 */
export function EventActions({
  eventId,
  invitationLimit,
  hasEntitlement,
}: {
  eventId: string;
  invitationLimit: number;
  hasEntitlement: boolean;
}) {
  const router = useRouter();
  const [limit, setLimit] = useState(String(invitationLimit));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = limit !== String(invitationLimit);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/entitlements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, invitationLimit: Number(limit) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not save");
      setMsg({ ok: true, text: `Allowance set to ${body.invitationLimit}.` });
      // The page is a server component; refresh so the header count and the
      // rest of the event reflect the new allowance.
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not save" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-actions">
      <label htmlFor={`limit-${eventId}`}>Invitation allowance</label>
      <input
        id={`limit-${eventId}`}
        type="number"
        min={0}
        max={20}
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        className="admin-num"
      />
      <Button type="button" size="sm" disabled={busy || !dirty} onClick={save}>
        {busy ? "Saving…" : hasEntitlement ? "Update" : "Grant"}
      </Button>
      {!hasEntitlement && (
        <span className="dim" style={{ fontSize: "var(--t-xs)" }}>
          No entitlement — this event has not been paid for.
        </span>
      )}
      {msg && (
        <span className={`notice ${msg.ok ? "notice-good" : "notice-bad"} admin-inline-note`}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
