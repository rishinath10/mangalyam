import { db } from "@/lib/db";
import { badRequest, handle, notFound } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import {
  ART_COLUMN,
  ART_PIECES,
  type ArtPiece,
} from "@/lib/templates/art-store";
import { TEMPLATE_MANIFESTS } from "@/lib/templates/registry";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  UnreadableImageError,
  deleteImage,
  storeImage,
} from "@/lib/storage";

type Params = { params: Promise<{ templateId: string; piece: string }> };

export const runtime = "nodejs";

/**
 * One piece of one family's artwork.
 *
 * Admin-only, because this changes what every customer sees. Both the family
 * and the piece are checked against the code's own lists rather than trusted
 * from the path — otherwise the id becomes a way to write arbitrary rows, and
 * the piece a way to name an arbitrary column.
 */
async function resolveTarget(params: Params["params"]) {
  await requireAdmin();
  const { templateId, piece } = await params;

  const manifest = TEMPLATE_MANIFESTS.find((t) => t.templateId === templateId);
  if (!manifest) throw notFound("Design");
  if (!ART_PIECES.includes(piece as ArtPiece)) throw notFound("Artwork");

  return { templateId, piece: piece as ArtPiece };
}

export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const { templateId, piece } = await resolveTarget(params);

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) throw badRequest("Attach an image as `file`");
    if (file.size > MAX_UPLOAD_BYTES) {
      throw badRequest(
        `Artwork must be under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB`,
      );
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      throw badRequest("Upload a PNG or WebP — transparency matters for artwork");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let stored;
    try {
      stored = await storeImage(buffer, piece, `templates/${templateId}`);
    } catch (err) {
      // A storage outage is ours, not theirs: let it through to `handle`,
      // which answers 503 and says so, rather than telling someone their
      // file is broken when it is not.
      if (!(err instanceof UnreadableImageError)) throw err;
      throw badRequest("That file could not be read as an image");
    }

    const column = ART_COLUMN[piece];
    const existing = await db.templateArt.findUnique({ where: { templateId } });
    const previous = existing?.[column] ?? null;

    const row = await db.templateArt.upsert({
      where: { templateId },
      create: { templateId, [column]: stored.url },
      update: { [column]: stored.url },
    });

    // Only after the new one is safely recorded: a failed delete must never
    // cost the artwork that is now live.
    if (previous) await deleteImage(previous);

    return row;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const { templateId, piece } = await resolveTarget(params);
    const column = ART_COLUMN[piece];

    const existing = await db.templateArt.findUnique({ where: { templateId } });
    if (!existing?.[column]) return { templateId, [column]: null };

    const row = await db.templateArt.update({
      where: { templateId },
      data: { [column]: null },
    });
    await deleteImage(existing[column]!);

    // Removing an upload does not remove the design — it falls back to
    // whatever the manifest ships, which is what the customer saw before.
    return row;
  });
}
