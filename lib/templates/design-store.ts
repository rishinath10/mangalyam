import "server-only";
import { z } from "zod";
import type { EventType } from "@prisma/client";
import { db } from "@/lib/db";
import { FONT_PAIRING_KEYS, isFontPairingKey } from "@/lib/templates/fonts";
import { getManifest, TEMPLATE_MANIFESTS } from "@/lib/templates/registry";
import type { TemplateArt, TemplateManifest } from "@/lib/templates/types";
import { ART_COLUMN, ART_PIECES } from "@/lib/templates/art-store";

/**
 * Every design the product knows about — the ones written into the registry
 * and the ones an operator added through /admin/designs.
 *
 * This is the server half. The registry stays synchronous and code-only,
 * because it is imported by browser modules that cannot wait on a database;
 * a custom design reaches those through props instead (DesignsProvider for the
 * pickers, the invitation JSON for the renderer), which is the same route the
 * artwork already takes.
 *
 * server-only, so an accidental client import fails the build.
 */

/** A custom design carries no component, so its shape is fixed except here. */
const CUSTOM_SECTIONS = [
  "cover",
  "couple",
  "event",
  "schedule",
  "gallery",
  "greetings",
  "rsvp",
  "blessings",
] as const;

/**
 * The JSON columns, checked on the way out.
 *
 * These rows are written by an admin form rather than by a customer, so this
 * is not a security boundary — it is a blast radius. A row with a missing
 * token would otherwise throw inside `designSystemStyle` on every page that
 * lists designs, including the one you would go to in order to fix it.
 */
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const accentsSchema = z
  .array(z.object({ key: z.string().min(1).max(40), name: z.string().min(1).max(40), hex }))
  .min(1)
  .max(8);

const tokensSchema = z.object({
  surface: hex,
  surfaceAlt: hex,
  ink: hex,
  inkMuted: hex,
  rule: hex,
  brand: hex,
  brandDeep: hex,
  gold: hex,
  radius: z.string().max(12),
  motionIntensity: z.number().min(0).max(2),
});

export type CustomAccents = z.infer<typeof accentsSchema>;
export type CustomTokens = z.infer<typeof tokensSchema>;

export const DEFAULT_TOKENS: CustomTokens = {
  surface: "#FDFBF5",
  surfaceAlt: "#F4EFE2",
  ink: "#241E14",
  inkMuted: "#6F6553",
  rule: "#DED5C0",
  brand: "#8A6B14",
  brandDeep: "#5E480C",
  gold: "#B8912F",
  radius: "6px",
  motionIntensity: 0.9,
};

type CustomRow = {
  templateId: string;
  name: string;
  tagline: string;
  eventTypes: EventType[];
  accents: unknown;
  fontPairing: string;
  tokens: unknown;
  groundFit: string | null;
  groundVeil: number | null;
  published: boolean;
};

type ArtRow = {
  templateId: string;
  groundUrl: string | null;
  frameUrl: string | null;
  crestUrl: string | null;
  dividerUrl: string | null;
};

function artFromRow(row: ArtRow | undefined, groundFit: string | null, groundVeil: number | null) {
  if (!row) return undefined;
  const art: TemplateArt = {};
  for (const piece of ART_PIECES) {
    const url = row[ART_COLUMN[piece]];
    if (url) art[piece] = url;
  }
  if (!Object.keys(art).length) return undefined;
  art.groundFit = groundFit === "cover" ? "cover" : "tile";
  if (groundVeil !== null) art.groundVeil = groundVeil;
  return art;
}

/**
 * A row becomes a manifest, or it does not become anything.
 *
 * Returning null for an unreadable row is deliberate: the design disappears
 * from the pickers and any invitation already on it falls back to the default
 * family, which still renders. The alternative — throwing — takes down the
 * customer's published invitation as well as the admin screen.
 */
export function customDesignToManifest(
  row: CustomRow,
  artRow?: ArtRow,
): TemplateManifest | null {
  const accents = accentsSchema.safeParse(row.accents);
  const tokens = tokensSchema.safeParse(row.tokens);
  if (!accents.success || !tokens.success) {
    console.error(`Custom design ${row.templateId} has an unreadable row; skipping it.`);
    return null;
  }

  const pairing = isFontPairingKey(row.fontPairing) ? row.fontPairing : "classic";

  return {
    templateId: row.templateId,
    name: row.name,
    tagline: row.tagline,
    eventTypes: row.eventTypes,
    sections: [...CUSTOM_SECTIONS],
    features: { music: true, countdown: true },
    accents: accents.data,
    defaultAccentKey: accents.data[0].key,
    // A custom design has one palette for every occasion: per-ceremony
    // starting colours are a judgement about a specific family's artwork, and
    // asking for eight of them through a form is how a form becomes a chore.
    ceremonyAccentKeys: {},
    fontPairings: [...FONT_PAIRING_KEYS],
    defaultFontPairing: pairing,
    tokens: tokens.data,
    art: artFromRow(artRow, row.groundFit, row.groundVeil),
    // Published is the operator's switch; art is the floor. A design with no
    // artwork at all is a blank card whatever the switch says.
    built: row.published && Boolean(artFromRow(artRow, row.groundFit, row.groundVeil)),
  };
}

/** Custom designs only, in admin order (newest first), built or not. */
export async function allCustomDesigns(): Promise<TemplateManifest[]> {
  const [rows, art] = await Promise.all([
    db.customDesign.findMany({ orderBy: { createdAt: "desc" } }),
    db.templateArt.findMany(),
  ]);
  const byId = new Map(art.map((a) => [a.templateId, a]));
  return rows
    .map((row) => customDesignToManifest(row, byId.get(row.templateId)))
    .filter((m): m is TemplateManifest => m !== null);
}

/**
 * Every manifest, code and custom, with uploaded artwork merged over the code
 * families the same way `allTemplateArt` does it.
 */
export async function allManifests(): Promise<TemplateManifest[]> {
  const [custom, art] = await Promise.all([allCustomDesigns(), db.templateArt.findMany()]);
  const byId = new Map(art.map((a) => [a.templateId, a]));

  const coded = TEMPLATE_MANIFESTS.map((manifest) => {
    const row = byId.get(manifest.templateId);
    if (!row) return manifest;
    const merged: TemplateArt = { ...manifest.art };
    for (const piece of ART_PIECES) {
      const url = row[ART_COLUMN[piece]];
      if (url) merged[piece] = url;
    }
    return Object.keys(merged).length ? { ...manifest, art: merged } : manifest;
  });

  return [...coded, ...custom];
}

/** The designs a customer may actually pick for this occasion. */
export async function manifestsForEvent(eventType: EventType): Promise<TemplateManifest[]> {
  const all = await allManifests();
  return all.filter((m) => m.built && m.eventTypes.includes(eventType));
}

/**
 * One design, resolved. Falls back to the code registry — which itself falls
 * back to the default family — so an invitation pointing at a design that was
 * deleted still renders rather than 500s.
 */
export async function resolveDesign(templateId: string): Promise<TemplateManifest> {
  const all = await allManifests();
  return all.find((m) => m.templateId === templateId) ?? getManifest(templateId);
}

/**
 * The server-side half of `isSelectableTemplate`, which cannot see custom
 * designs. Every route that accepts a templateId from a client uses this:
 * without it a housewarming could be pointed at the wedding family, or at an
 * unpublished design, by a hand-made request.
 */
export async function isSelectableDesign(
  templateId: string,
  eventType: EventType,
): Promise<boolean> {
  const families = await manifestsForEvent(eventType);
  return families.some((m) => m.templateId === templateId);
}

/** Whether artwork may be uploaded against this id at all. */
export async function designExists(templateId: string): Promise<boolean> {
  if (TEMPLATE_MANIFESTS.some((m) => m.templateId === templateId)) return true;
  return Boolean(await db.customDesign.findUnique({ where: { templateId } }));
}
