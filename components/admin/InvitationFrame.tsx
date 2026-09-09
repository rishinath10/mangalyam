"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Fits commissioned border artwork to one invitation.
 *
 * This is the only door to a frame now: the self-serve builder no longer
 * offers the upload, because a customer's own PNG competes with the design's
 * own border instead of finishing it. Bespoke work still needs it, and this is
 * where it happens — on the support side, for one invitation at a time.
 */
export function InvitationFrame({
  invitationId,
  frameUrl,
}: {
  invitationId: string;
  frameUrl: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`/api/admin/invitations/${invitationId}/frame`, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? "Could not upload that frame.");
    } else {
      router.refresh();
    }
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    setError(null);
    await fetch(`/api/admin/invitations/${invitationId}/frame`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  if (frameUrl) {
    return (
      <div className="frame-cell">
        {/* Checkerboard behind it: a frame is mostly transparent, and on a flat
            panel there is no way to see what it actually covers. */}
        <span className="frame-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frameUrl} alt="Fitted frame" />
        </span>
        <Button type="button" variant="danger" size="sm" disabled={busy} onClick={remove}>
          Remove
        </Button>
        {error && <span className="dim">{error}</span>}
      </div>
    );
  }

  return (
    <div className="frame-cell">
      <input
        type="file"
        accept="image/png,image/webp"
        disabled={busy}
        className="filedrop filedrop-sm"
        aria-label="Fit frame artwork"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      {busy && <span className="dim">Uploading…</span>}
      {error && <span className="dim">{error}</span>}
    </div>
  );
}
