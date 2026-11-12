"use client";

import { useEffect, useState } from "react";
import type { InvitationStatus } from "@prisma/client";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { LiveMoment } from "@/components/share/LiveMoment";

export function SharePanel({
  eventId,
  invitationId,
  slug,
  status,
  canPublish,
  coupleLine,
  ceremonyLabel,
  onSlugChange,
  onStatusChange,
}: {
  eventId: string;
  invitationId: string;
  slug: string;
  status: InvitationStatus;
  /**
   * Whether the publish route will actually accept this — an entitlement on the
   * event, or an admin account. Purely so the panel offers the right button;
   * the refusal itself lives server-side in assertCanPublish.
   */
  canPublish: boolean;
  coupleLine: string;
  ceremonyLabel: string;
  onSlugChange: (slug: string) => void;
  onStatusChange: (status: InvitationStatus) => void;
}) {
  const [draftSlug, setDraftSlug] = useState(slug);
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState<null | "slug" | "publish">(null);
  const [error, setError] = useState<string | null>(null);
  // True only for a publish that happened in this sitting, so the seal plays
  // when someone goes live and not every time they open the tab afterwards.
  const [justPublished, setJustPublished] = useState(false);

  // the real origin is only knowable in the browser, and it differs between
  // local, preview and mangalyam.my
  useEffect(() => {
    setOrigin(location.origin);
  }, []);

  useEffect(() => setDraftSlug(slug), [slug]);

  const url = `${origin}/i/${slug}`;
  const published = status === "published";
  const message = `${coupleLine} invite you to their ${ceremonyLabel}.`;

  async function saveSlug() {
    setBusy("slug");
    setError(null);
    const res = await fetch(`/api/invitations/${invitationId}/slug`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: draftSlug }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Could not change the link.");
    } else {
      onSlugChange(body.slug);
      setDraftSlug(body.slug);
    }
    setBusy(null);
  }

  async function togglePublish() {
    setBusy("publish");
    setError(null);
    const res = await fetch(`/api/invitations/${invitationId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !published }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Could not change the status.");
    } else {
      onStatusChange(body.status);
      setJustPublished(body.status === "published");
    }
    setBusy(null);
  }

  return (
    <div style={{ display: "grid", gap: "1.4rem" }}>
      <div>
        <span className="field-label">Status</span>
        <div style={{ display: "flex", alignItems: "center", gap: ".8rem", flexWrap: "wrap" }}>
          <span className={`pill ${published ? "pill-live" : "pill-draft"}`}>
            {published ? "Published" : "Draft"}
          </span>
          {/* Unpaid, the button becomes the way to pay: hiding it would leave
              the customer looking for the thing they already decided to do. */}
          {!published && !canPublish ? (
            <ButtonLink variant="gold" href={`/dashboard/events/${eventId}`}>
              Pay to publish
            </ButtonLink>
          ) : (
            <Button
              type="button"
              variant={published ? "line" : "gold"}
              onClick={togglePublish}
              disabled={busy !== null}
            >
              {busy === "publish"
                ? "Working…"
                : published
                  ? "Unpublish"
                  : "Publish this invitation"}
            </Button>
          )}
        </div>
        <p className="dim" style={{ fontSize: "var(--t-xs)", marginTop: ".7rem" }}>
          {published
            ? "Guests can open this link and reply. Edits you save appear immediately — the link never changes."
            : canPublish
              ? "Drafts are private. Publishing needs a date and a venue."
              : "Drafts are private, and stay editable for as long as you like. One payment is what puts this link in front of your guests."}
        </p>
      </div>

      <div>
        <Input
          id="slug"
          label="Link"
          value={draftSlug}
          maxLength={60}
          onChange={(e) => setDraftSlug(e.target.value)}
          hint={`mangalyam.my/i/${draftSlug || "…"}`}
        />
        <div style={{ marginTop: ".7rem" }}>
          <Button
            type="button"
            variant="line"
            size="sm"
            onClick={saveSlug}
            disabled={busy !== null || draftSlug === slug || draftSlug.trim().length < 3}
          >
            {busy === "slug" ? "Saving…" : "Change link"}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="notice notice-bad">
          {error}
        </p>
      )}

      {/* A phone frame in the editor is not the thing itself. This is the real
          page at the real address — it just 404s for everyone but you until it
          is published, which is what keeps it from being a free way to reach
          guests. */}
      {!published && (
        <div className="try-strip">
          <div>
            <b>Try it on your phone</b>
            <span>
              Opens the real invitation, full screen, at the link above. Only you
              can see it while it is a draft — anyone else gets a not-found page.
            </span>
          </div>
          <a className="btn btn-line btn-sm" href={`/i/${slug}`} target="_blank" rel="noopener noreferrer">
            Open the draft
          </a>
        </div>
      )}

      {published && origin ? (
        <LiveMoment url={url} title={coupleLine} message={message} celebrate={justPublished}>
          <a className="btn btn-quiet" href={`/i/${slug}`} target="_blank" rel="noopener noreferrer">
            Open it
          </a>
        </LiveMoment>
      ) : (
        <p className="dim" style={{ fontSize: "var(--t-xs)" }}>
          Publish first — until then this link shows a not-found page to everyone
          except you. Sharing, the QR code and the WhatsApp button appear here once
          it is live.
        </p>
      )}
    </div>
  );
}
