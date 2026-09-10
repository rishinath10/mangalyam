import "server-only";
import { db } from "@/lib/db";
import { getManifest, TEMPLATE_MANIFESTS } from "@/lib/templates/registry";
import type { TemplateArt } from "@/lib/templates/types";

/**
 * Where a family's artwork actually comes from.
 *
 * The registry is read synchronously from eighteen places, several of which
 * are pure browser modules — the draft, the composer, the design picker. Making
 * it async to reach the database would ripple through all of them and put a
 * fetch inside the render path of a card.
 *
 * So the database never reaches the client. The server resolves the art here,
 * puts it in the invitation JSON, and the renderer reads it from the props it
 * was already given. That keeps rule #2 intact — a template still receives the
 * JSON and nothing else — and it means a preview in the builder and the
 * published page are looking at the same resolved artwork.
 *
 * server-only, so an accidental client import fails the build rather than
 * shipping Prisma to a phone.
 */

/** One uploaded piece overrides one manifest piece; nulls fall through. */
function merge(base: TemplateArt | undefined, row: {
  groundUrl: string | null;
  frameUrl: string | null;
  crestUrl: string | null;
  dividerUrl: string | null;
} | null): TemplateArt | undefined {
  if (!row) return base;
  const merged: TemplateArt = {
    ...base,
    ground: row.groundUrl ?? base?.ground,
    frame: row.frameUrl ?? base?.frame,
    crest: row.crestUrl ?? base?.crest,
    divider: row.dividerUrl ?? base?.divider,
  };
  // A family with no art at all in code and no uploads yet stays undefined,
  // which is what keeps the two line-drawn families on their own renderers.
  return merged.ground || merged.frame || merged.crest || merged.divider
    ? merged
    : undefined;
}

export async function resolveTemplateArt(
  templateId: string,
): Promise<TemplateArt | undefined> {
  const base = getManifest(templateId).art;
  const row = await db.templateArt.findUnique({ where: { templateId } });
  return merge(base, row);
}

/** Every family's resolved art, for the pages that offer a choice of family. */
export async function allTemplateArt(): Promise<Record<string, TemplateArt>> {
  const rows = await db.templateArt.findMany();
  const byId = new Map(rows.map((r) => [r.templateId, r]));
  const out: Record<string, TemplateArt> = {};
  for (const manifest of TEMPLATE_MANIFESTS) {
    const art = merge(manifest.art, byId.get(manifest.templateId) ?? null);
    if (art) out[manifest.templateId] = art;
  }
  return out;
}

/** The four pieces, in the order they are shown and stored. */
export const ART_PIECES = ["frame", "crest", "divider", "ground"] as const;
export type ArtPiece = (typeof ART_PIECES)[number];

export const ART_COLUMN: Record<ArtPiece, "frameUrl" | "crestUrl" | "dividerUrl" | "groundUrl"> = {
  frame: "frameUrl",
  crest: "crestUrl",
  divider: "dividerUrl",
  ground: "groundUrl",
};

export const ART_BLURB: Record<ArtPiece, string> = {
  frame: "The border around the cover. 3:4, with a completely clear centre — the names print inside it.",
  crest: "The ornament above the names. Wider than it is tall.",
  divider: "The rule between sections. Symmetric left to right.",
  ground: "A seamless texture behind everything. Laid back to about 8%, so make it stronger than looks right.",
};
