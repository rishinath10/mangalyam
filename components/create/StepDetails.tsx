"use client";

import type { CeremonyType } from "@prisma/client";
import { Input, Textarea } from "@/components/ui/Field";
import { CEREMONY_BLURBS, CEREMONY_LABELS, CEREMONY_TYPES } from "@/lib/ceremonies";
import { accentFromManifest } from "@/lib/templates/registry";
import { useManifest } from "@/components/templates/DesignsProvider";
import type { InvitationDraft } from "@/lib/draft";

export function StepDetails({
  draft,
  onDraft,
}: {
  draft: InvitationDraft;
  onDraft: (draft: InvitationDraft) => void;
}) {
  const wedding = draft.eventType === "wedding";
  // The ceremony swatches have to come from the chosen design's own palette,
  // which for a custom design is not in the registry at all.
  const manifest = useManifest(draft.templateId);
  const set = (patch: Partial<InvitationDraft>) => onDraft({ ...draft, ...patch });

  return (
    <div className="wz-fields">
      {wedding && (
        <div>
          <span className="field-label">Which ceremony</span>
          <p className="dim wz-hint" style={{ marginTop: "-.2rem", marginBottom: ".7rem" }}>
            One invitation per ceremony. Start with the one you are sending first —
            the rest can follow later.
          </p>
          <div className="cer-grid">
            {CEREMONY_TYPES.map((type: CeremonyType) => (
              <button
                key={type}
                type="button"
                className="cer"
                aria-pressed={draft.ceremonyType === type}
                onClick={() =>
                  set({
                    ceremonyType: type,
                    ...(type !== "custom" ? { customCeremonyName: null } : {}),
                  })
                }
              >
                {/* each day in the colour it is actually dressed in, so the
                    palette is visible while choosing rather than afterwards */}
                <i style={{ background: accentFromManifest(manifest, type, null) }} />
                <b>{CEREMONY_LABELS[type]}</b>
                <span>{CEREMONY_BLURBS[type]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {wedding && draft.ceremonyType === "custom" && (
        <Input
          id="customCeremonyName"
          label="Ceremony name"
          placeholder="Mappillai Azhaippu"
          maxLength={60}
          value={draft.customCeremonyName ?? ""}
          onChange={(e) => set({ customCeremonyName: e.target.value || null })}
        />
      )}

      <div className="form-grid three">
        <Input
          id="date"
          label="Date"
          type="date"
          value={draft.date ?? ""}
          onChange={(e) => set({ date: e.target.value || null })}
        />
        <Input
          id="startTime"
          label="Starts"
          type="time"
          value={draft.startTime ?? ""}
          onChange={(e) => set({ startTime: e.target.value || null })}
        />
        <Input
          id="endTime"
          label="Ends"
          type="time"
          value={draft.endTime ?? ""}
          onChange={(e) => set({ endTime: e.target.value || null })}
        />
      </div>

      <Input
        id="venueName"
        label="Venue"
        placeholder="Wisma Tamil Bell Club"
        maxLength={120}
        value={draft.venueName ?? ""}
        onChange={(e) => set({ venueName: e.target.value || null })}
      />

      <Textarea
        id="address"
        label="Address"
        rows={3}
        maxLength={400}
        placeholder="Jalan Scott, Brickfields, 50470 Kuala Lumpur"
        value={draft.address ?? ""}
        onChange={(e) => set({ address: e.target.value || null })}
      />

      <Input
        id="mapLink"
        label="Map link"
        type="url"
        inputMode="url"
        placeholder="https://maps.app.goo.gl/…"
        value={draft.mapLink ?? ""}
        onChange={(e) => set({ mapLink: e.target.value || null })}
        hint="Optional. Guests get a “Get directions” button when there is one."
      />

      <Textarea
        id="description"
        label="A message to your guests"
        rows={4}
        maxLength={1200}
        placeholder="Turmeric, laughter and a little chaos. Come hungry."
        value={draft.description ?? ""}
        onChange={(e) => set({ description: e.target.value || null })}
      />
    </div>
  );
}
