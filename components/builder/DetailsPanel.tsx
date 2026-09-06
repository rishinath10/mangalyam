"use client";

import type { CeremonyType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { CEREMONY_LABELS, CEREMONY_TYPES } from "@/lib/ceremonies";
import { resolveAccentColor } from "@/lib/templates/registry";
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
  // The colour the invitation gets with no override — the ceremony-type
  // default from the template manifest (Sections 4.4 and 7).
  const ceremonyDefault = resolveAccentColor(source.templateId, source.ceremonyType);
  const usingDefault = source.accentColorOverride === null;

  return (
    <div className="space-y-6">
      <div>
        <Label>Ceremony</Label>
        <div className="flex flex-wrap gap-2">
          {CEREMONY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={source.ceremonyType === type}
              onClick={() =>
                onChange({
                  ceremonyType: type as CeremonyType,
                  ...(type !== "custom" ? { customCeremonyName: null } : {}),
                })
              }
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                source.ceremonyType === type
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: resolveAccentColor(source.templateId, type) }}
                aria-hidden="true"
              />
              {type === "custom" ? "Custom" : CEREMONY_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {source.ceremonyType === "custom" && (
        <Input
          id="customCeremonyName"
          label="Ceremony name"
          placeholder="Nalangu"
          maxLength={60}
          value={source.customCeremonyName ?? ""}
          onChange={(e) => onChange({ customCeremonyName: e.target.value || null })}
        />
      )}

      <div>
        <Label>Accent colour</Label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="color"
            aria-label="Accent colour"
            value={source.accentColorOverride ?? ceremonyDefault}
            onChange={(e) => onChange({ accentColorOverride: e.target.value })}
            className="h-10 w-14 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
          />
          <span className="text-sm text-neutral-600">
            {usingDefault
              ? `Using the ${source.ceremonyType === "custom" ? "template" : CEREMONY_LABELS[source.ceremonyType].toLowerCase()} default`
              : "Custom colour"}
          </span>
          {!usingDefault && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange({ accentColorOverride: null })}
              className="!px-2.5 !py-1.5 text-xs"
            >
              Reset to default
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
        placeholder="Sri Maha Mariamman Temple"
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
        placeholder="Join us as we celebrate the Haldi ceremony."
        value={source.description ?? ""}
        onChange={(e) => onChange({ description: e.target.value || null })}
      />

      <div>
        <Label>Cover photo</Label>
        {source.coverPhotoUrl ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={source.coverPhotoUrl}
              alt="Current cover"
              className="h-24 w-20 rounded-lg border border-neutral-200 object-cover"
            />
            <Button
              type="button"
              variant="danger"
              disabled={coverBusy}
              onClick={onCoverRemove}
            >
              Remove
            </Button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            disabled={coverBusy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onCoverUpload(file);
              // Reset so re-picking the same file fires change again.
              e.target.value = "";
            }}
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-neutral-700"
          />
        )}
        {coverBusy && <p className="mt-2 text-xs text-neutral-500">Uploading…</p>}
      </div>
    </div>
  );
}
