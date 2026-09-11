import { db } from "@/lib/db";
import { badRequest, handle, notFound, parseBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import { designUpdateSchema } from "@/lib/validation";
import { ART_COLUMN, ART_PIECES } from "@/lib/templates/art-store";
import { deleteImage } from "@/lib/storage";
import type { Prisma } from "@prisma/client";

type Params = { params: Promise<{ templateId: string }> };

function accentKey(name: string, index: number): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || `accent-${index + 1}`;
}

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    await requireAdmin();
    const { templateId } = await params;
    const existing = await db.customDesign.findUnique({ where: { templateId } });
    if (!existing) throw notFound("Design");

    const input = await parseBody(req, designUpdateSchema);
    const data: Prisma.CustomDesignUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.tagline !== undefined) data.tagline = input.tagline;
    if (input.eventTypes !== undefined) data.eventTypes = input.eventTypes;
    if (input.fontPairing !== undefined) data.fontPairing = input.fontPairing;
    if (input.tokens !== undefined) data.tokens = input.tokens;
    if (input.groundFit !== undefined) data.groundFit = input.groundFit;
    if (input.groundVeil !== undefined) data.groundVeil = input.groundVeil;
    if (input.accents !== undefined) {
      data.accents = input.accents.map((a, i) => ({
        key: accentKey(a.name, i),
        name: a.name,
        hex: a.hex,
      }));
    }

    if (input.published !== undefined) {
      // Publishing is the one field with a precondition. A design with no
      // artwork renders as an empty card, and the picker is the last place
      // that should be discovered.
      if (input.published) {
        const art = await db.templateArt.findUnique({ where: { templateId } });
        const hasArt = art && ART_PIECES.some((piece) => art[ART_COLUMN[piece]]);
        if (!hasArt) {
          throw badRequest(
            "Upload the artwork before publishing — without it this design is a blank card.",
          );
        }
      }
      data.published = input.published;
    }

    return db.customDesign.update({ where: { templateId }, data });
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    await requireAdmin();
    const { templateId } = await params;
    const existing = await db.customDesign.findUnique({ where: { templateId } });
    if (!existing) throw notFound("Design");

    /**
     * A design in use is never deleted.
     *
     * Deleting one would not error anywhere — `resolveDesign` falls back to
     * the default family — which is precisely the problem: somebody's
     * published invitation would quietly turn into a different card, and the
     * first they would hear of it is a guest asking why it changed.
     */
    const inUse = await db.invitation.count({ where: { templateId } });
    if (inUse > 0) {
      throw badRequest(
        `${inUse} invitation${inUse === 1 ? "" : "s"} already use this design. Unpublish it instead — it stays working for them and disappears from the picker.`,
      );
    }

    const art = await db.templateArt.findUnique({ where: { templateId } });
    await db.customDesign.delete({ where: { templateId } });
    if (art) {
      await db.templateArt.delete({ where: { templateId } }).catch(() => {});
      for (const piece of ART_PIECES) {
        const url = art[ART_COLUMN[piece]];
        if (url) await deleteImage(url);
      }
    }
    return { templateId, deleted: true };
  });
}
