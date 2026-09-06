"use client";

import type { InvitationJson } from "@/lib/invitation/types";

/**
 * The three cover openings.
 *
 * Each one is markup plus a `data-open` flag; every transition lives in
 * globals.css so the animation can be tuned without touching component logic.
 * They are presentational only — InvitationShell owns the state, the audio and
 * the scroll, so adding a fourth opening never means touching those.
 */

export interface OpeningProps {
  invitation: InvitationJson;
  open: boolean;
  onOpen: () => void;
}

function Seal({ invitation, onOpen, open }: OpeningProps) {
  const { couple, opening } = invitation;
  return (
    <button
      type="button"
      className="inv-seal"
      data-open={open || undefined}
      onClick={onOpen}
      disabled={open}
      aria-label={`Open the invitation for ${couple.name1} and ${couple.name2}`}
    >
      <span className="inv-seal-pulse" aria-hidden="true" />
      <span className="inv-seal-face">
        <span className="inv-seal-names">
          {couple.name1}
          <i aria-hidden="true">&amp;</i>
          {couple.name2}
        </span>
        <span className="inv-seal-cta">{opening.text?.trim() || "Open"}</span>
      </span>
    </button>
  );
}

/**
 * Temple doors. The cover photo, when there is one, is split across the two
 * leaves so the seam falls down the middle of the picture; without one the
 * leaves carry the design system's own field.
 */
function Doors(props: OpeningProps) {
  // Cover URLs are validated as http(s) on the way in (lib/validation.ts) and
  // are served from our own storage, so they are safe to interpolate here.
  const photo = props.invitation.couple.coverPhoto;
  const leaf = photo ? { backgroundImage: `url("${photo}")` } : undefined;

  return (
    <div className="inv-cover inv-doors" data-open={props.open || undefined}>
      <div className="inv-door inv-door-l" style={leaf} aria-hidden="true">
        <span className="inv-door-scrim" />
      </div>
      <div className="inv-door inv-door-r" style={leaf} aria-hidden="true">
        <span className="inv-door-scrim" />
      </div>
      <Seal {...props} />
    </div>
  );
}

/** A flap folds back and the envelope drops away, seal and all. */
function Envelope(props: OpeningProps) {
  return (
    <div className="inv-cover inv-envelope" data-open={props.open || undefined}>
      <div className="inv-env-shell" aria-hidden="true">
        <div className="inv-env-pocket" />
        <div className="inv-env-flap" />
      </div>
      <Seal {...props} />
    </div>
  );
}

/** A blurred veil lifts — the quietest of the three, and the fastest. */
function Veil(props: OpeningProps) {
  return (
    <div className="inv-cover inv-veil" data-open={props.open || undefined}>
      <div className="inv-veil-sheet" aria-hidden="true" />
      <Seal {...props} />
    </div>
  );
}

const OPENINGS = { doors: Doors, envelope: Envelope, veil: Veil } as const;

/**
 * An unknown style falls back to the doors rather than rendering nothing: a
 * new enum value shipped ahead of its animation must not leave a guest
 * looking at a bare invitation with no way to open it.
 */
export function Opening(props: OpeningProps) {
  const Component = OPENINGS[props.invitation.opening.style] ?? Doors;
  return <Component {...props} />;
}
