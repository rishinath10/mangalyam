"use client";

import { FONT_PAIRINGS, isFontPairingKey } from "@/lib/templates/fonts";
import { getManifest, resolveAccentColor, templatesForEvent } from "@/lib/templates/registry";
import type { InvitationDraft } from "@/lib/draft";

/**
 * Family, swatch, letterforms — the whole of the design choice, in the order
 * that matters. Nothing here reaches an arbitrary hex or an arbitrary
 * typeface: a family owns its palette and its shortlist, and the customer
 * picks from inside it (CLAUDE.md Section 5).
 */
export function StepDesign({
  draft,
  onDraft,
}: {
  draft: InvitationDraft;
  onDraft: (draft: InvitationDraft) => void;
}) {
  const families = templatesForEvent(draft.eventType);
  const manifest = getManifest(draft.templateId);
  const inherited = resolveAccentColor(draft.templateId, draft.ceremonyType, null);
  const pairing =
    draft.fontPairing && isFontPairingKey(draft.fontPairing)
      ? draft.fontPairing
      : manifest.defaultFontPairing;

  return (
    <div className="wz-fields">
      {families.length > 1 ? (
        <div>
          <span className="field-label">Design family</span>
          <div className="fam-grid">
            {families.map((family) => (
              <button
                key={family.templateId}
                type="button"
                className="fam"
                aria-pressed={draft.templateId === family.templateId}
                // Palettes differ between families, so a swatch and a pairing
                // chosen in one are dropped rather than silently resolving to
                // something the customer never picked.
                onClick={() =>
                  onDraft({
                    ...draft,
                    templateId: family.templateId,
                    accentKey: null,
                    fontPairing: null,
                  })
                }
              >
                <span className="fam-swatches" aria-hidden="true">
                  {family.accents.slice(0, 4).map((swatch) => (
                    <i key={swatch.key} style={{ background: swatch.hex }} />
                  ))}
                </span>
                <b>{family.name}</b>
                <span>{family.tagline}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="dim wz-note">
          <b>{manifest.name}</b> — {manifest.tagline}. It is the family this
          occasion is set in.
        </p>
      )}

      <div>
        <span className="field-label">Accent colour</span>
        <div className="chiprow">
          <button
            type="button"
            className="chip"
            aria-pressed={draft.accentKey === null}
            onClick={() => onDraft({ ...draft, accentKey: null })}
          >
            <i style={{ background: inherited }} />
            Suggested
          </button>
          {manifest.accents.map((swatch) => (
            <button
              key={swatch.key}
              type="button"
              className="chip"
              aria-pressed={draft.accentKey === swatch.key}
              onClick={() => onDraft({ ...draft, accentKey: swatch.key })}
            >
              <i style={{ background: swatch.hex }} />
              {swatch.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="field-label">Lettering</span>
        <div className="chiprow">
          {manifest.fontPairings.map((key) => (
            <button
              key={key}
              type="button"
              className="chip chip-type"
              aria-pressed={pairing === key}
              onClick={() =>
                onDraft({
                  ...draft,
                  fontPairing: key === manifest.defaultFontPairing ? null : key,
                })
              }
            >
              <span style={{ fontFamily: FONT_PAIRINGS[key].display }}>
                {FONT_PAIRINGS[key].name}
              </span>
            </button>
          ))}
        </div>
        <p className="dim wz-hint">{FONT_PAIRINGS[pairing].note}</p>
      </div>
    </div>
  );
}
