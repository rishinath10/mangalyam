/**
 * The font-pairing shortlist (CLAUDE.md Section 5, post-pivot).
 *
 * A customer picks a pairing, not a font — layout and type scale stay locked
 * to the template family, and there is no way to reach an arbitrary Google
 * font from the builder. Each pairing names two CSS variables that
 * app/layout.tsx defines with next/font, so the faces are self-hosted and
 * subset rather than fetched per invitation.
 */
export interface FontPairing {
  name: string;
  /** What it reads like, in the customer's words — shown under the name. */
  note: string;
  display: string;
  body: string;
}

export const FONT_PAIRINGS = {
  classic: {
    name: "Classic",
    note: "High-contrast serif, quiet sans",
    display: "var(--font-serif)",
    body: "var(--font-ui)",
  },
  inscribed: {
    name: "Inscribed",
    note: "Roman capitals, like temple stone",
    display: "var(--font-marcellus)",
    body: "var(--font-karla)",
  },
  fine: {
    name: "Fine",
    note: "Delicate, formal, a printed card",
    display: "var(--font-gilda)",
    body: "var(--font-ui)",
  },
} as const satisfies Record<string, FontPairing>;

export type FontPairingKey = keyof typeof FONT_PAIRINGS;

export const FONT_PAIRING_KEYS = Object.keys(FONT_PAIRINGS) as [
  FontPairingKey,
  ...FontPairingKey[],
];

export function isFontPairingKey(value: string): value is FontPairingKey {
  return value in FONT_PAIRINGS;
}
