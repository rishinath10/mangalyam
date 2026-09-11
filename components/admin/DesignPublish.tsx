"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * The switch that decides whether customers can choose this design, and the
 * only place it can be deleted.
 *
 * Both are stated in terms of consequence rather than state. "Published" on
 * its own does not tell an operator that publishing puts this in front of
 * every customer picking a design tomorrow morning, and deleting is refused
 * outright once anyone is using it — an invitation quietly becoming a
 * different card is not a thing to offer as an option.
 */
export function DesignPublish({
  templateId,
  published,
  hasArt,
  inUse,
}: {
  templateId: string;
  published: boolean;
  hasArt: boolean;
  inUse: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function setPublished(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/designs/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "That did not go through.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/designs/${templateId}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "That design could not be deleted.");
        return;
      }
      router.push("/admin/designs");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      {error && <p className="notice notice-bad" role="alert">{error}</p>}

      <div className="panel-head">
        <div>
          <h2>{published ? "Live for customers" : "Not yet offered"}</h2>
          <p className="muted">
            {published
              ? "Anyone starting an invitation can pick this design."
              : hasArt
                ? "Ready when you are. Nothing shows it to a customer until you publish."
                : "Upload the artwork first — without it this is a blank card."}
          </p>
        </div>
        <div className="r">
          <Button
            type="button"
            variant={published ? "line" : "gold"}
            disabled={busy || (!published && !hasArt)}
            onClick={() => setPublished(!published)}
          >
            {published ? "Take it out of the picker" : "Publish it"}
          </Button>
        </div>
      </div>

      {inUse > 0 && (
        <p className="dim" style={{ fontSize: "var(--t-sm)" }}>
          {inUse} invitation{inUse === 1 ? "" : "s"} already on this design.
          Editing its colours or artwork changes {inUse === 1 ? "it" : "them"}{" "}
          too, published ones included.
        </p>
      )}

      <div style={{ marginTop: "1.2rem" }}>
        {confirming ? (
          <div className="r" style={{ gap: ".8rem", alignItems: "center" }}>
            <span className="dim" style={{ fontSize: "var(--t-sm)" }}>
              Delete this design and its artwork for good?
            </span>
            <Button type="button" variant="danger" size="sm" disabled={busy} onClick={remove}>
              Delete it
            </Button>
            <Button type="button" variant="quiet" size="sm" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="quiet"
            size="sm"
            disabled={busy || inUse > 0}
            onClick={() => setConfirming(true)}
          >
            {inUse > 0 ? "In use — cannot be deleted" : "Delete this design"}
          </Button>
        )}
      </div>
    </section>
  );
}
