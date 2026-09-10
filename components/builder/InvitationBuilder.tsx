"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { InvitationStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { composeInvitationJson, type InvitationSource } from "@/lib/invitation/compose";
import { DetailsPanel } from "./DetailsPanel";
import { SchedulePanel } from "./SchedulePanel";
import { GalleryPanel, type GalleryPhoto } from "./GalleryPanel";
import { SettingsPanel } from "./SettingsPanel";
import { BlessingsPanel } from "./BlessingsPanel";
import { RsvpPanel } from "./RsvpPanel";
import { SharePanel } from "./SharePanel";
import { PreviewPane } from "./PreviewPane";

const TABS = ["Details", "Timeline", "Gallery", "Blessings", "Settings", "Share", "Replies"] as const;
type Tab = (typeof TABS)[number];

export function InvitationBuilder({
  initialSource,
  initialPhotos,
  status: initialStatus,
  canPublish,
}: {
  initialSource: InvitationSource;
  initialPhotos: GalleryPhoto[];
  status: InvitationStatus;
  /** Whether the publish route will accept this invitation: paid, or admin. */
  canPublish: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Details");
  const [source, setSource] = useState(initialSource);
  const [photos, setPhotos] = useState(initialPhotos);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [qrBusy, setQrBusy] = useState(false);
  // On a phone the preview is a sheet rather than a column beside the fields.
  const [previewOpen, setPreviewOpen] = useState(false);

  /**
   * The preview is derived from local state through the same composer the
   * server uses, so it reflects unsaved edits without a round trip and still
   * cannot diverge from what gets published (rule #3).
   */
  const previewJson = useMemo(
    () => composeInvitationJson({ ...source, photos }),
    [source, photos],
  );

  // A sheet that covers the page must not leave the page scrolling behind it.
  useEffect(() => {
    if (!previewOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [previewOpen]);

  function patch(next: Partial<InvitationSource>) {
    setSource((s) => ({ ...s, ...next }));
    setDirty(true);
  }

  async function uploadCover(file: File) {
    setCoverBusy(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`/api/invitations/${source.invitationId}/cover`, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? "Could not upload the cover photo.");
    } else {
      const updated = await res.json();
      setSource((s) => ({ ...s, coverPhotoUrl: updated.coverPhotoUrl }));
    }
    setCoverBusy(false);
  }

  async function removeCover() {
    setCoverBusy(true);
    await fetch(`/api/invitations/${source.invitationId}/cover`, { method: "DELETE" });
    setSource((s) => ({ ...s, coverPhotoUrl: null }));
    setCoverBusy(false);
  }

  /**
   * The payment QR, like the cover, is stored the moment it is chosen rather
   * than waiting for Save — an upload that silently depends on a later button
   * press is an upload people lose.
   */
  async function uploadGiftQr(file: File) {
    setQrBusy(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch(`/api/invitations/${source.invitationId}/gift-qr`, {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not upload the QR image.");
        return;
      }
      const updated = await res.json();
      setSource((s) => ({
        ...s,
        settings: { ...s.settings, giftQrUrl: updated.giftQrUrl },
      }));
    } catch {
      setError("The QR image did not reach us — check your connection and try again.");
    } finally {
      setQrBusy(false);
    }
  }

  async function removeGiftQr() {
    setQrBusy(true);
    try {
      await fetch(`/api/invitations/${source.invitationId}/gift-qr`, { method: "DELETE" });
      setSource((s) => ({ ...s, settings: { ...s.settings, giftQrUrl: null } }));
    } finally {
      setQrBusy(false);
    }
  }

  /**
   * Three writes, one button.
   *
   * Everything inside is wrapped: a rejected fetch — a phone stepping between
   * cells, the container restarting mid-request — used to escape this function
   * through the rejected Promise.all, leaving `saving` true forever. The button
   * then read "Saving…" for the rest of the session with nothing to click and
   * nothing said, which is the worst failure a save can have: it looks like it
   * is still working.
   */
  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const id = source.invitationId;
    try {
      const responses = await Promise.all([
        fetch(`/api/invitations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ceremonyType: source.ceremonyType,
            customCeremonyName: source.customCeremonyName,
            templateId: source.templateId,
            accentKey: source.accentKey,
            fontPairing: source.fontPairing,
            date: source.date,
            startTime: source.startTime,
            endTime: source.endTime,
            venueName: source.venueName,
            address: source.address,
            mapLink: source.mapLink,
            description: source.description,
          }),
        }),
        fetch(`/api/invitations/${id}/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(source.settings),
        }),
        fetch(`/api/invitations/${id}/schedule`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Drop half-typed rows rather than failing the whole save on them.
            items: source.schedule.filter((item) => item.title.trim() && item.time),
          }),
        }),
      ]);

      const failed = responses.find((res) => !res.ok);
      if (failed) {
        const payload = await failed.json().catch(() => ({}));
        const detail = payload.details
          ? Object.values(payload.details as Record<string, string[]>)
              .flat()
              .join(" ")
          : null;
        setError(detail || payload.error || "Some changes could not be saved.");
        return;
      }

      setDirty(false);
      // Said out loud, and briefly. Without it the save bar simply vanishes on a
      // phone — the bar only exists while there are unsaved changes — and a
      // control that disappears is not the same as a job confirmed done.
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
      router.refresh();
    } catch {
      setError("Your changes did not reach us — check your connection and try again. Nothing you typed has been lost.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="builder-head">
        <div>
          <h1>{previewJson.ceremonyLabel}</h1>
          <div className="meta">
            <span className={`pill ${status === "published" ? "pill-live" : "pill-draft"}`}>
              {status === "published" ? "Published" : "Draft"}
            </span>
            <span>/i/{source.slug}</span>
          </div>
        </div>
        <div className="builder-actions" data-dirty={dirty || saving || saved || error ? "" : undefined}>
          <span className="save-state" data-tone={error ? "bad" : saved ? "good" : undefined}>
            {error ? error : saved ? "Saved" : dirty ? "Unsaved changes" : ""}
          </span>
          <Button type="button" onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : error ? "Try again" : "Save changes"}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="notice notice-bad" style={{ marginBottom: "1.2rem" }}>
          {error}
        </p>
      )}

      <div className="builder-grid">
        <div className="t">
          <div role="tablist" className="tabs">
            {TABS.map((name) => (
              <button
                key={name}
                role="tab"
                type="button"
                aria-selected={tab === name}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <div>
            {tab === "Details" && (
              <DetailsPanel
                source={source}
                onChange={patch}
                onCoverUpload={uploadCover}
                onCoverRemove={removeCover}
                coverBusy={coverBusy}
              />
            )}
            {tab === "Timeline" && (
              <SchedulePanel
                schedule={source.schedule}
                onChange={(schedule) => patch({ schedule })}
              />
            )}
            {tab === "Gallery" && (
              <GalleryPanel
                invitationId={source.invitationId}
                photos={photos}
                onPhotosChange={setPhotos}
              />
            )}
            {tab === "Blessings" && (
              <BlessingsPanel
                settings={source.settings}
                onChange={(next) => patch({ settings: { ...source.settings, ...next } })}
                onQrUpload={uploadGiftQr}
                onQrRemove={removeGiftQr}
                qrBusy={qrBusy}
              />
            )}
            {tab === "Settings" && (
              <SettingsPanel
                settings={source.settings}
                onChange={(next) =>
                  patch({ settings: { ...source.settings, ...next } })
                }
              />
            )}
            {tab === "Share" && (
              <SharePanel
                eventId={source.eventId}
                invitationId={source.invitationId}
                canPublish={canPublish}
                slug={source.slug}
                status={status}
                coupleLine={source.hostNames}
                ceremonyLabel={previewJson.ceremonyLabel}
                onSlugChange={(slug) => setSource((s) => ({ ...s, slug }))}
                onStatusChange={(next) => {
                  setStatus(next);
                  router.refresh();
                }}
              />
            )}
            {tab === "Replies" && (
              <RsvpPanel
                invitationId={source.invitationId}
                enabled={source.settings.rsvpEnabled}
                published={status === "published"}
              />
            )}
          </div>
        </div>

        <div className="builder-preview" data-open={previewOpen ? "" : undefined}>
          <PreviewPane invitation={previewJson} slug={source.slug} />
        </div>
      </div>

      <button
        type="button"
        className="builder-peek"
        onClick={() => setPreviewOpen((open) => !open)}
        aria-expanded={previewOpen}
      >
        <span>{previewOpen ? "Back to the editor" : "Preview my invitation"}</span>
      </button>
    </div>
  );
}
