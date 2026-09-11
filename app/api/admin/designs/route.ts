import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import { designCreateSchema } from "@/lib/validation";
import { TEMPLATE_MANIFESTS } from "@/lib/templates/registry";

/**
 * Creating a design without a deploy.
 *
 * A design created here is always rendered by ArtTemplate — it has no
 * component of its own, which is exactly what makes it addable from a form.
 * What the form supplies is the part that is genuinely data: a name, the
 * occasions it suits, its colours, its lettering. The artwork goes up
 * afterwards through the route every other design's artwork uses.
 */

/** "Kolam Rose" -> "custom-kolam-rose". Prefixed so it can never collide with
 *  a coded family's id, now or after a future rename. */
function templateIdFrom(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `custom-${slug || "design"}`;
}

/** Accent keys are generated, never typed: they are an internal handle, and
 *  asking someone to invent a stable identifier for a colour is a trap. */
function accentKey(name: string, index: number): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || `accent-${index + 1}`;
}

export async function POST(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const input = await parseBody(req, designCreateSchema);

    let templateId = templateIdFrom(input.name);
    if (TEMPLATE_MANIFESTS.some((m) => m.templateId === templateId)) {
      throw badRequest("That name collides with a built-in design");
    }
    // A second "Kolam Rose" gets -2 rather than an error: the name is a label,
    // and refusing it would mean explaining a uniqueness rule nobody asked for.
    const taken = await db.customDesign.findMany({
      where: { templateId: { startsWith: templateId } },
      select: { templateId: true },
    });
    if (taken.some((t) => t.templateId === templateId)) {
      templateId = `${templateId}-${taken.length + 1}`;
    }

    return db.customDesign.create({
      data: {
        templateId,
        name: input.name,
        tagline: input.tagline,
        eventTypes: input.eventTypes,
        accents: input.accents.map((a, i) => ({
          key: accentKey(a.name, i),
          name: a.name,
          hex: a.hex,
        })),
        fontPairing: input.fontPairing,
        tokens: input.tokens,
        groundFit: input.groundFit ?? "tile",
        groundVeil: input.groundVeil ?? 0.88,
        // Never on arrival. There is no artwork yet, and a published design
        // with no artwork is a blank card in a customer's picker.
        published: false,
      },
    });
  });
}
