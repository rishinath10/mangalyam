"use client";

import { Input, Label } from "@/components/ui/Field";
import type { InvitationSource } from "@/lib/invitation/compose";

type Settings = InvitationSource["settings"];

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#8A1C1C]"
      />
      <span>
        <span className="block text-sm font-medium text-neutral-900">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-neutral-500">{hint}</span>}
      </span>
    </label>
  );
}

export function SettingsPanel({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}) {
  return (
    <div className="space-y-4">
      <Toggle
        label="Countdown"
        hint="Counts down to the ceremony start time."
        checked={settings.countdownEnabled}
        onChange={(countdownEnabled) => onChange({ countdownEnabled })}
      />

      <Toggle
        label="Photo gallery"
        hint="Turning this off hides the gallery without deleting the photos."
        checked={settings.galleryEnabled}
        onChange={(galleryEnabled) => onChange({ galleryEnabled })}
      />

      <Toggle
        label="Background music"
        hint="Guests choose to play it — browsers block music that starts on its own."
        checked={settings.musicEnabled}
        onChange={(musicEnabled) => onChange({ musicEnabled })}
      />

      {settings.musicEnabled && (
        <Input
          id="musicUrl"
          label="Music URL"
          type="url"
          placeholder="https://…/song.mp3"
          value={settings.musicUrl ?? ""}
          onChange={(e) => onChange({ musicUrl: e.target.value || null })}
        />
      )}

      <Toggle
        label="RSVP"
        hint="Each ceremony collects its own responses."
        checked={settings.rsvpEnabled}
        onChange={(rsvpEnabled) => onChange({ rsvpEnabled })}
      />

      {settings.rsvpEnabled && (
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
          <Toggle
            label="Ask for meal preference"
            checked={settings.askMealPreference}
            onChange={(askMealPreference) => onChange({ askMealPreference })}
          />
          <Input
            id="rsvpCloseDate"
            label="RSVP closes"
            type="date"
            value={settings.rsvpCloseDate ?? ""}
            onChange={(e) => onChange({ rsvpCloseDate: e.target.value || null })}
          />
          <div>
            <Label>Note</Label>
            <p className="text-xs text-neutral-500">
              Guests can see the RSVP section now; submissions go live in Phase 5.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
