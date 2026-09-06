"use client";

import { useState } from "react";
import type { Package } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Tick } from "@/components/site/Icons";
import { withFigures } from "@/lib/typography";

interface Tier {
  pkg: Package;
  name: string;
  inc: string;
  items: string[];
  feature: boolean;
  purchasable: boolean;
}

export function PurchasePanel({
  weddingId,
  tiers,
}: {
  weddingId: string;
  tiers: Tier[];
}) {
  const [busy, setBusy] = useState<Package | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(pkg: Package) {
    setBusy(pkg);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId, pkg }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok || !body.url) {
      setError(body.error ?? "Could not start checkout. Please try again.");
      setBusy(null);
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

      <div className="bento">
        {tiers.map((t) => (
          <div key={t.pkg} className={`t c4 tier ${t.feature ? "t--2 t--lit" : ""}`}>
            {t.feature && <span className="flag">Most weddings</span>}
            <h3>{t.name}</h3>
            <p className="inc">{withFigures(t.inc)}</p>
            <ul>
              {t.items.map((i) => (
                <li key={i}>
                  <Tick />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant={t.feature ? "gold" : "line"}
              onClick={() => buy(t.pkg)}
              disabled={busy !== null || !t.purchasable}
            >
              {busy === t.pkg
                ? "Opening checkout…"
                : t.purchasable
                  ? `Choose ${t.name}`
                  : "Not on sale yet"}
            </Button>
          </div>
        ))}
      </div>

      {tiers.some((t) => !t.purchasable) && (
        <p className="dim" style={{ fontSize: "var(--t-xs)" }}>
          A package shows as not on sale until its price is configured. Prices are
          set in the environment, never in the code.
        </p>
      )}
    </div>
  );
}
