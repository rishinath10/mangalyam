"use client";

import type { CeremonyType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { CEREMONY_LABELS, CEREMONY_TYPES } from "@/lib/ceremonies";
import { isWeddingEvent } from "@/lib/events";
import { BUILT_TEMPLATES, resolveAccentColor } from "@/lib/templates/registry";
import type { InvitationSource } from "@/lib/invitation/compose";

type Patch = Partial<InvitationSource>;

export function DetailsPanel({
  source,
  onChange,
  onCoverUpload,
  onCoverRemove,
  coverBusy,
}: {
  source: InvitationSource;
  onChange: (patch: Patch) => void;
  onCoverUpload: (file: File) => void;
  onCoverRemove: () => void;
  coverBusy: boolean;
}) {
  // The colour with no override — the ceremony default from the design
  // manifest (CLAUDE.md Sections 4.4 and 7).
  const ceremonyDefault = resolveAccentColor(source.templateId, source.ceremonyType);
  const usingDefault = source.accentColorOverride === null;
  const wedding = isWeddingEvent(source.eventType);

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {wedding && (
        <>
          <div>
            <span className="field-label">Ceremony</span>
            <div className="chiprow">
              {CEREMONY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="chip"
                  aria-pressed={source.ceremonyType === type}
                  onClick={() =>
                    onChange({
                      ceremonyType: type as CeremonyType,
                      ...(type !== "custom" ? { customCeremonyName: null } : {}),
                    })
                  }
                >
                  {/* each ceremony in its own accent, so the colour system is
                      visible while choosing rather than a surprise afterwards */}
                  <i style={{ background: resolveAccentColor(source.templateId, type) }} />
                  {CEREMONY_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {source.ceremonyType === "custom" && (
            <Input
              id="customCeremonyName"
              label="Ceremony name"
              placeholder="Mappillai Azhaippu"
              maxLength={60}
              value={source.customCeremonyName ?? ""}
              onChange={(e) => onChange({ customCeremonyName: e.target.value || null })}
            />
          )}
        </>
      )}

      {BUILT_TEMPLATES.length > 1 && (
        <div>
          <span className="field-label">Design</span>
          <div className="chiprow">
            {BUILT_TEMPLATES.map((t) => (
              <button
                key={t.templateId}
                type="button"
                className="chip"
                aria-pressed={source.templateId === t.templateId}
                onClick={() => onChange({ templateId: t.templateId })}
              >
                <i style={{ background: t.silk.field }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="field-label">Accent colour</span>
        <div className="swatch-row">
          <input
            type="color"
            aria-label="Accent colour"
            value={source.accentColorOverride ?? ceremonyDefault}
            onChange={(e) => onChange({ accentColorOverride: e.target.value })}
          />
          <span className="muted" style={{ fontSize: "var(--t-sm)" }}>
            {usingDefault
              ? `Using the ${
                  source.ceremonyType && source.ceremonyType !== "custom"
                    ? CEREMONY_LABELS[source.ceremonyType].toLowerCase()
                    : "design"
                } default`
              : "Custom colour"}
          </span>
          {!usingDefault && (
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => onChange({ accentColorOverride: null })}
            >
              Reset to default
            </Button>
          )}
        </div>
      </div>

      <div className="form-grid three">
        <Input
          id="date"
          label="Date"
          type="date"
          value={source.date ?? ""}
          onChange={(e) => onChange({ date: e.target.value || null })}
        />
        <Input
          id="startTime"
          label="Starts"
          type="time"
          value={source.startTime ?? ""}
          onChange={(e) => onChange({ startTime: e.target.value || null })}
        />
        <Input
          id="endTime"
          label="Ends"
          type="time"
          value={source.endTime ?? ""}
          onChange={(e) => onChange({ endTime: e.target.value || null })}
        />
      </div>

      <Input
        id="venueName"
        label="Venue"
        placeholder="Wisma Tamil Bell Club"
        maxLength={120}
        value={source.venueName ?? ""}
        onChange={(e) => onChange({ venueName: e.target.value || null })}
      />

      <Textarea
        id="address"
        label="Address"
        rows={3}
        maxLength={400}
        value={source.address ?? ""}
        onChange={(e) => onChange({ address: e.target.value || null })}
      />

      <Input
        id="mapLink"
        label="Map link"
        type="url"
        placeholder="https://maps.app.goo.gl/…"
        value={source.mapLink ?? ""}
        onChange={(e) => onChange({ mapLink: e.target.value || null })}
      />

      <Textarea
        id="description"
        label="Message to your guests"
        rows={4}
        maxLength={1200}
        placeholder="Turmeric, laughter and a little chaos."
        value={source.description ?? ""}
        onChange={(e) => onChange({ description: e.target.value || null })}
      />

      <div>
        <span className="field-label">Cover photo</span>
        {source.coverPhotoUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={source.coverPhotoUrl}
              alt="Current cover"
              style={{ height: 96, width: 78, objectFit: "cover", borderRadius: 10, border: "1px solid var(--edge)" }}
            />
            <Button type="button" variant="danger" size="sm" disabled={coverBusy} onClick={onCoverRemove}>
              Remove
            </Button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            disabled={coverBusy}
            className="filedrop"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onCoverUpload(file);
              e.target.value = "";
            }}
          />
        )}
        {coverBusy && <p className="dim" style={{ fontSize: "var(--t-xs)", marginTop: ".5rem" }}>Uploading…</p>}
      </div>
    </div>
  );
}
