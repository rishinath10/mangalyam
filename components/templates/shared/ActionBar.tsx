"use client";

import type { InvitationJson } from "@/lib/invitation/types";

/**
 * The bar a guest keeps within thumb reach after the invitation opens: ring
 * the family, message them, find the hall, reply, and mute the music.
 *
 * It is `position: sticky` rather than `fixed` so it behaves identically in
 * the builder's phone frame and on the published page — a fixed bar escapes
 * the preview's scroll container and lands on the builder chrome.
 */

/**
 * Malaysian numbers as families type them ("012-345 6789") into the form
 * wa.me wants. The product is Malaysia-only (CLAUDE.md Section 1), so a bare
 * leading zero means +60; anything already in international form is left be.
 */
export function whatsappNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return `60${digits.slice(1)}`;
  return digits;
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS = {
  phone:
    "M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z",
  chat: "M20.5 12a8.5 8.5 0 1 1-4.2-7.3M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.1-4.4",
  pin: "M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  reply: "M3.5 6.5h17v11h-17z M3.5 7l8.5 6 8.5-6",
  music: "M9 18V5l10-2v13 M6.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z M16.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  mute: "M9 18V5l10-2v13 M6.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z M3 3l18 18",
} as const;

export function ActionBar({
  invitation,
  musicAvailable,
  playing,
  onToggleMusic,
}: {
  invitation: InvitationJson;
  musicAvailable: boolean;
  playing: boolean;
  onToggleMusic: () => void;
}) {
  const { contact, event, rsvp } = invitation;
  const wa = contact.phone ? whatsappNumber(contact.phone) : null;
  const who = contact.name ? ` ${contact.name}` : "";

  return (
    <div className="inv-bar">
      <nav className="inv-bar-inner" aria-label="Invitation actions">
        {contact.phone && (
          <a className="inv-bar-btn" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
            <Icon path={ICONS.phone} />
            <span>Call{who}</span>
          </a>
        )}
        {wa && (
          <a
            className="inv-bar-btn"
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon path={ICONS.chat} />
            <span>WhatsApp</span>
          </a>
        )}
        {event.mapLink && (
          <a
            className="inv-bar-btn"
            href={event.mapLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon path={ICONS.pin} />
            <span>Directions</span>
          </a>
        )}
        {rsvp.enabled && (
          <a className="inv-bar-btn" href="#rsvp">
            <Icon path={ICONS.reply} />
            <span>Reply</span>
          </a>
        )}
        {musicAvailable && (
          <button
            type="button"
            className="inv-bar-btn"
            onClick={onToggleMusic}
            aria-pressed={playing}
          >
            <Icon path={playing ? ICONS.music : ICONS.mute} />
            <span>{playing ? "Music" : "Muted"}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
