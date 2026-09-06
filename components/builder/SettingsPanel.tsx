"use client";

import { Input } from "@/components/ui/Field";
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
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <b>{label}</b>
        {hint && <span>{hint}</span>}
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
    <div style={{ display: "grid", gap: "1rem" }}>
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
        <div className="t" style={{ display: "grid", gap: "1rem" }}>
          <Toggle
            label="Ask for meal preference"
            hint="Vegetarian or not, for the caterer."
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
        </div>
      )}
    </div>
  );
}
