"use client";

import type { EventType } from "@prisma/client";
import { Input } from "@/components/ui/Field";
import { EventIcon } from "@/components/site/EventIcon";
import { EVENT_TYPE_BLURBS, EVENT_TYPE_LABELS, EVENT_TYPES } from "@/lib/events";
import { withEventType, type InvitationDraft } from "@/lib/draft";

/**
 * The first choice, and the only one that changes what the rest of the wizard
 * even asks. Occasions are picked as tiles rather than from a select: eight
 * options with a glyph each is a gallery, and the glyph is how someone
 * recognises their own day before they have read the label.
 */
export function StepOccasion({
  draft,
  onDraft,
}: {
  draft: InvitationDraft;
  onDraft: (draft: InvitationDraft) => void;
}) {
  const wedding = draft.eventType === "wedding";

  return (
    <div className="wz-fields">
      <div>
        <span className="field-label">The occasion</span>
        <div className="occ-grid">
          {EVENT_TYPES.map((type: EventType) => (
            <button
              key={type}
              type="button"
              className="occ"
              aria-pressed={draft.eventType === type}
              onClick={() => onDraft(withEventType(draft, type))}
            >
              <EventIcon eventType={type} className="occ-ic" />
              <b>{EVENT_TYPE_LABELS[type]}</b>
              <span>{EVENT_TYPE_BLURBS[type]}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        id="hostNames"
        label={wedding ? "The couple" : "Who it is for"}
        placeholder={wedding ? "Rishi & Gaayathri" : "The Kumar Family"}
        maxLength={120}
        autoComplete="off"
        value={draft.hostNames}
        onChange={(e) => onDraft({ ...draft, hostNames: e.target.value })}
        hint={
          wedding
            ? "Two names either side of an “&” are set as a pair on the cover."
            : "A family, a committee or a single name — it is printed as you write it."
        }
      />
    </div>
  );
}
