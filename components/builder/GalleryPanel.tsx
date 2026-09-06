"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

/**
 * Photos are the one part of the builder that save immediately rather than on
 * the Save button: an upload is a file already sitting in object storage, so
 * holding it in local state until save would leave orphans whenever the
 * customer navigates away.
 */
export function GalleryPanel({
  invitationId,
  photos,
  onPhotosChange,
}: {
  invitationId: string;
  photos: GalleryPhoto[];
  onPhotosChange: (photos: GalleryPhoto[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);

    const res = await fetch(`/api/invitations/${invitationId}/photos`, { method: "POST", body });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? "Upload failed.");
      setBusy(false);
      return;
    }
    onPhotosChange([...photos, await res.json()]);
    setBusy(false);
  }

  async function remove(id: string) {
    setError(null);
    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not remove that photo.");
      return;
    }
    onPhotosChange(photos.filter((p) => p.id !== id));
  }

  async function saveCaption(id: string, caption: string) {
    await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: caption || null }),
    });
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((p, i) => ({ ...p, sortOrder: i }));
    onPhotosChange(reordered);

    await fetch(`/api/invitations/${invitationId}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
    });
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <p className="muted" style={{ fontSize: "var(--t-sm)" }}>
        Images are resized and converted to WebP on upload, so guests on slow
        connections still load the page quickly.
      </p>

      {error && (
        <p role="alert" className="notice notice-bad">
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div key={photo.id} className="photo-cell">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption ?? ""} />
              <Input
                aria-label="Caption"
                placeholder="Caption (optional)"
                maxLength={120}
                defaultValue={photo.caption ?? ""}
                onBlur={(e) => saveCaption(photo.id, e.target.value.trim())}
              />
              <div className="acts">
                <Button type="button" variant="quiet" size="sm" disabled={index === 0} onClick={() => move(index, -1)}>
                  ←
                </Button>
                <Button
                  type="button"
                  variant="quiet"
                  size="sm"
                  disabled={index === photos.length - 1}
                  onClick={() => move(index, 1)}
                >
                  →
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  style={{ marginLeft: "auto" }}
                  onClick={() => remove(photo.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        disabled={busy}
        className="filedrop"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          // reset so re-picking the same file fires change again
          e.target.value = "";
        }}
      />
      {busy && <p className="dim" style={{ fontSize: "var(--t-xs)" }}>Uploading…</p>}
    </div>
  );
}
