import { db } from "@/lib/db";
import { badRequest, handle, notFound } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import { ART_COLUMN, ART_PIECES } from "@/lib/templates/art-store";
import { samplePalette } from "@/lib/templates/palette";

type Params = { params: Promise<{ templateId: string }> };

export const runtime = "nodejs";

/**
 * Colours read back out of the uploaded artwork, as a starting point.
 *
 * The frame is sampled by preference because it is the piece that carries a
 * card's identity; the others stand in when there is no frame yet.
 */
export async function POST(_req: Request, { params }: Params) {
  return handle(async () => {
    await requireAdmin();
    const { templateId } = await params;

    const art = await db.templateArt.findUnique({ where: { templateId } });
    if (!art) throw notFound("Artwork");

    if (!ART_PIECES.some((piece) => art[ART_COLUMN[piece]])) {
      throw badRequest("Upload a piece of artwork first.");
    }

    try {
      // Each piece answers a different question — see samplePalette.
      return await samplePalette({
        frame: art.frameUrl,
        ground: art.groundUrl,
        crest: art.crestUrl,
        divider: art.dividerUrl,
      });
    } catch (err) {
      // Suggesting colours is a convenience, and failing at it must read as
      // one: the operator can still type the palette themselves.
      console.error("Could not sample a palette:", err);
      throw badRequest("That artwork could not be read for colours — set them by hand.");
    }
  });
}
