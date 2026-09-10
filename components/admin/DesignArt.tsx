"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * One artwork slot for one family.
 *
 * Shows what is live now — the upload if there is one, otherwise whatever the
 * code ships — over a checkerboard, because these files are mostly transparent
 * and on a flat panel an empty centre and a white centre look identical. That
 * distinction is the single most common mistake in generated artwork, so the
 * admin surface has to make it visible.
 */
export function DesignArt({
  templateId,
  piece,
  label,
  blurb,
  url,
  fromUpload,
}: {
  templateId: string;
  piece: string;
  label: string;
  blurb: string;
  url?: string;
  /** True when this came from an upload rather than from the manifest. */
  fromUpload: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(file: File) {
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`/api/admin/templates/${templateId}/${piece}`, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? "That upload did not go through.");
    } else {
      router.refresh();
    }
    setBusy(false);
  }

  async function revert() {
    setBusy(true);
    setError(null);
    await fetch(`/api/admin/templates/${templateId}/${piece}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="art-slot">
      <span className="art-chip" data-wide={piece === "divider" ? "" : undefined}>
        {url ? <img src={url} alt={`${label} artwork`} /> : <i>none</i>}
      </span>

      <div className="art-body">
        <b>{label}</b>
        <span className="dim">{blurb}</span>

        <div className="art-acts">
          <input
            type="file"
            accept="image/png,image/webp"
            disabled={busy}
            className="filedrop filedrop-sm"
            aria-label={`Upload ${label} artwork`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) send(file);
              e.target.value = "";
            }}
          />
          {fromUpload && (
            <Button type="button" variant="danger" size="sm" disabled={busy} onClick={revert}>
              Revert to shipped
            </Button>
          )}
          {busy && <span className="dim">Working…</span>}
          {error && <span className="art-err">{error}</span>}
        </div>

        <span className="art-src">
          {fromUpload ? "Uploaded" : url ? "Shipped with the code" : "Not set — falls back"}
        </span>
      </div>
    </div>
  );
}
