"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { InvitationStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { composeInvitationJson, type InvitationSource } from "@/lib/invitation/compose";
import { DetailsPanel } from "./DetailsPanel";
import { SchedulePanel } from "./SchedulePanel";
import { GalleryPanel, type GalleryPhoto } from "./GalleryPanel";
import { SettingsPanel } from "./SettingsPanel";
import { RsvpPanel } from "./RsvpPanel";
import { SharePanel } from "./SharePanel";
import { PreviewPane } from "./PreviewPane";

const TABS = ["Details", "Timeline", "Gallery", "Settings", "Share", "Replies"] as const;
type Tab = (typeof TABS)[number];

export function InvitationBuilder({
  initialSource,
  initialPhotos,
  status: initialStatus,
}: {
  initialSource: InvitationSource;
  initialPhotos: GalleryPhoto[];
  status: InvitationStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Details");
  const [source, setSource] = useState(initialSource);
  const [photos, setPhotos] = useState(initialPhotos);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);

  /**
   * The preview is derived from local state through the same composer the
   * server uses, so it reflects unsaved edits without a round trip and still
   * cannot diverge from what gets published (rule #3).
   */
  const previewJson = useMemo(
    () => composeInvitationJson({ ...source, photos }),
    [source, photos],
  );

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

  async function save() {
    setSaving(true);
    setError(null);

    const id = source.invitationId;
    const responses = await Promise.all([
      fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ceremonyType: source.ceremonyType,
          customCeremonyName: source.customCeremonyName,
          accentColorOverride: source.accentColorOverride,
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
      setSaving(false);
      return;
    }

    setDirty(false);
    setSaving(false);
    router.refresh();
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
        <div className="builder-actions">
          {dirty && <span style={{ fontSize: "var(--t-xs)", color: "var(--accent)" }}>Unsaved changes</span>}
          <Button type="button" onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save changes"}
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
                invitationId={source.invitationId}
                slug={source.slug}
                status={status}
                coupleLine={`${source.coupleName1} & ${source.coupleName2}`}
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

        <div className="builder-preview">
          <PreviewPane invitation={previewJson} slug={source.slug} />
        </div>
      </div>
    </div>
  );
}
