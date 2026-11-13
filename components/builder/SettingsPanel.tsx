"use client";

import { Input } from "@/components/ui/Field";
import { StarPicker } from "@/components/builder/StarPicker";
import { splitHostNames } from "@/lib/format";
import type { InvitationSource } from "@/lib/invitation/compose";
import type { OpeningStyle } from "@prisma/client";

type Settings = InvitationSource["settings"];

/** What each opening does, in the words a customer would use. */
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

export function SettingsPanel({
  settings,
  hostNames,
  onChange,
}: {
  settings: Settings;
  /** "Ashwin & Kalyani" or "The Kumar Family" — decides one star field or two. */
  hostNames: string;
  onChange: (patch: Partial<Settings>) => void;
}) {
  const [firstName, secondName] = splitHostNames(hostNames);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <fieldset className="opening-pick">
        <legend>How the invitation opens</legend>
        <div>
          {OPENINGS.map((option) => (
            <label key={option.value} data-on={settings.openingStyle === option.value || undefined}>
              <input
                type="radio"
                name="openingStyle"
                value={option.value}
                checked={settings.openingStyle === option.value}
                onChange={() => onChange({ openingStyle: option.value })}
              />
              <b>{option.name}</b>
              <span>{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Input
        id="openingText"
        label="Words on the seal"
        placeholder="Open"
        maxLength={24}
        value={settings.openingText ?? ""}
        onChange={(e) => onChange({ openingText: e.target.value || null })}
      />

      <Toggle
        label="Drift down the page"
        hint="After the opening, the invitation scrolls itself slowly. A guest's first touch stops it."
        checked={settings.autoScroll}
        onChange={(autoScroll) => onChange({ autoScroll })}
      />

      <Toggle
        label="Let Little Aiyer greet your guests"
        hint="Our mascot pops up with a vanakkam after the opening and cheers when someone replies. Leave it off for a formal invitation."
        checked={Boolean(settings.greeter)}
        onChange={(greeter) => onChange({ greeter })}
      />

      <fieldset className="starpick-set">
        <legend>Birth stars</legend>
        <p className="dim">
          Optional. Guests see each natchathiram drawn as its constellation
          {secondName ? ", and the two joined." : "."}
        </p>
        <StarPicker
          id="starOne"
          label={secondName ? `${firstName}’s star` : "Birth star"}
          star={settings.starOne ?? null}
          raasi={settings.raasiOne ?? null}
          onChange={({ star, raasi }) => onChange({ starOne: star, raasiOne: raasi })}
        />
        {secondName && (
          <StarPicker
            id="starTwo"
            label={`${secondName}’s star`}
            star={settings.starTwo ?? null}
            raasi={settings.raasiTwo ?? null}
            onChange={({ star, raasi }) => onChange({ starTwo: star, raasiTwo: raasi })}
          />
        )}
      </fieldset>

      <Input
        id="contactName"
        label="Who guests should contact"
        placeholder="Ashwin"
        value={settings.contactName ?? ""}
        onChange={(e) => onChange({ contactName: e.target.value || null })}
      />
      <Input
        id="contactPhone"
        label="Contact number"
        type="tel"
        placeholder="012-345 6789"
        value={settings.contactPhone ?? ""}
        onChange={(e) => onChange({ contactPhone: e.target.value || null })}
      />

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
