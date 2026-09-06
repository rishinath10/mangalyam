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
 * Photos are the one part of the builder that saves immediately rather than on
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

    const res = await fetch(`/api/invitations/${invitationId}/photos`, {
      method: "POST",
      body,
    });

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
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Images are resized and converted to WebP on upload, so guests on slow
        connections still load the page quickly.
      </p>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className="rounded-xl border border-neutral-200 bg-white p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption ?? ""}
              className="aspect-square w-full rounded-lg object-cover"
            />
            <div className="mt-3">
              <Input
                aria-label="Caption"
                placeholder="Caption (optional)"
                maxLength={120}
                defaultValue={photo.caption ?? ""}
                onBlur={(e) => saveCaption(photo.id, e.target.value.trim())}
              />
            </div>
            <div className="mt-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                className="!px-2 !py-1 text-xs"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ←
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="!px-2 !py-1 text-xs"
                disabled={index === photos.length - 1}
                onClick={() => move(index, 1)}
              >
                →
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="!ml-auto !px-2.5 !py-1 text-xs !text-red-700 hover:!bg-red-50"
                onClick={() => remove(photo.id)}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
        className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-50"
      />
      {busy && <p className="text-xs text-neutral-500">Uploading…</p>}
    </div>
  );
}
