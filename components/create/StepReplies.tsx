"use client";

import type { OpeningStyle } from "@prisma/client";
import { Input } from "@/components/ui/Field";
import type { InvitationDraft } from "@/lib/draft";

type Settings = InvitationDraft["settings"];

const OPENINGS: { value: OpeningStyle; name: string; hint: string }[] = [
  { value: "doors", name: "Temple doors", hint: "Two leaves swing apart." },
  { value: "envelope", name: "Envelope", hint: "A flap folds back, the card slides away." },
  { value: "veil", name: "Veil", hint: "A soft blur lifts. The quietest of the three." },
];

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

export function StepReplies({
  draft,
  onDraft,
}: {
  draft: InvitationDraft;
  onDraft: (draft: InvitationDraft) => void;
}) {
  const settings = draft.settings;
  const set = (patch: Partial<Settings>) =>
    onDraft({ ...draft, settings: { ...settings, ...patch } });

  return (
    <div className="wz-fields">
      <fieldset className="opening-pick">
        <legend>How it opens</legend>
        <div>
          {OPENINGS.map((option) => (
            <label key={option.value} data-on={settings.openingStyle === option.value || undefined}>
              <input
                type="radio"
                name="openingStyle"
                value={option.value}
                checked={settings.openingStyle === option.value}
                onChange={() => set({ openingStyle: option.value })}
              />
              <b>{option.name}</b>
              <span>{option.hint}</span>
            </label>
          ))}
        </div>
        <p className="dim wz-hint">
          Tap the seal in the preview to watch it. It replays every time.
        </p>
      </fieldset>

      <Input
        id="openingText"
        label="Words on the seal"
        placeholder="Open"
        maxLength={24}
        value={settings.openingText ?? ""}
        onChange={(e) => set({ openingText: e.target.value || null })}
      />

      <Toggle
        label="Drift down the page"
        hint="After the opening the invitation scrolls itself slowly. A guest's first touch stops it."
        checked={settings.autoScroll}
        onChange={(autoScroll) => set({ autoScroll })}
      />
      <Toggle
        label="Countdown"
        hint="Counts down to the start time."
        checked={settings.countdownEnabled}
        onChange={(countdownEnabled) => set({ countdownEnabled })}
      />
      <Toggle
        label="Background music"
        hint="Guests choose to play it — browsers block music that starts on its own."
        checked={settings.musicEnabled}
        onChange={(musicEnabled) => set({ musicEnabled })}
      />

      {settings.musicEnabled && (
        <Input
          id="musicUrl"
          label="Music link"
          type="url"
          inputMode="url"
          placeholder="https://…/song.mp3"
          value={settings.musicUrl ?? ""}
          onChange={(e) => set({ musicUrl: e.target.value || null })}
        />
      )}

      <Toggle
        label="Collect RSVPs"
        hint="Replies land in your dashboard and export to a spreadsheet."
        checked={settings.rsvpEnabled}
        onChange={(rsvpEnabled) => set({ rsvpEnabled })}
      />

      {settings.rsvpEnabled && (
        <div className="wz-inset">
          <Toggle
            label="Ask for meal preference"
            hint="Vegetarian or not, for the caterer."
            checked={settings.askMealPreference}
            onChange={(askMealPreference) => set({ askMealPreference })}
          />
          <Input
            id="rsvpCloseDate"
            label="Replies close"
            type="date"
            value={settings.rsvpCloseDate ?? ""}
            onChange={(e) => set({ rsvpCloseDate: e.target.value || null })}
          />
        </div>
      )}

      <div className="form-grid two">
        <Input
          id="contactName"
          label="Who guests should call"
          placeholder="Rishi"
          maxLength={60}
          value={settings.contactName ?? ""}
          onChange={(e) => set({ contactName: e.target.value || null })}
        />
        <Input
          id="contactPhone"
          label="Contact number"
          type="tel"
          inputMode="tel"
          placeholder="012-345 6789"
          maxLength={24}
          value={settings.contactPhone ?? ""}
          onChange={(e) => set({ contactPhone: e.target.value || null })}
        />
      </div>
    </div>
  );
}
