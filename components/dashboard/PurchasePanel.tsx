"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Tick } from "@/components/site/Icons";

const INCLUDED = [
  "Any of our designs",
  "Unlimited RSVPs",
  "Gallery, timeline and countdown",
  "WhatsApp sharing",
];

/**
 * One flat price, one invitation, no tiers (CLAUDE.md Section 8 pivot).
 * Anything beyond this — a second ceremony, bespoke work — is a direct
 * conversation, not a second card on this panel.
 */
export function PurchasePanel({ eventId, purchasable }: { eventId: string; purchasable: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok || !body.url) {
      setError(body.error ?? "Could not start checkout. Please try again.");
      setBusy(false);
      return;
    }

    // hand over to the gateway; the webhook settles the purchase
    location.href = body.url;
  }

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      {error && (
        <p role="alert" className="notice notice-bad">
          {error}
        </p>
      )}

      <div className="t t--2 t--lit tier" style={{ maxWidth: "26rem" }}>
        <h3>One invitation</h3>
        <p className="inc">One payment. No subscription.</p>
        <ul>
          {INCLUDED.map((item) => (
            <li key={item}>
              <Tick />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Button type="button" variant="gold" onClick={buy} disabled={busy || !purchasable}>
          {busy ? "Opening checkout…" : purchasable ? "Pay and publish" : "Not on sale yet"}
        </Button>
      </div>

      {!purchasable && (
        <p className="dim" style={{ fontSize: "var(--t-xs)" }}>
          Checkout shows as not on sale until the price is configured. The price is
          set in the environment, never in the code.
        </p>
      )}
    </div>
  );
}
