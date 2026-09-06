import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requireWedding } from "@/lib/auth/ownership";
import { assertCanAddInvitation } from "@/lib/entitlements";
import { ceremonyLabel } from "@/lib/ceremonies";
import { uniqueInvitationSlug } from "@/lib/slug";
import { DEFAULT_TEMPLATE_ID, isSelectableTemplate } from "@/lib/templates/registry";
import { badRequest } from "@/lib/api";
import { invitationCreateSchema } from "@/lib/validation";

type Params = { params: Promise<{ weddingId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { weddingId } = await params;
    const { wedding } = await requireWedding(weddingId);
    return db.invitation.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });
  });
}

export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const { weddingId } = await params;
    const { wedding } = await requireWedding(weddingId);
    const input = await parseBody(req, invitationCreateSchema);

    // Package tier caps how many ceremony invitations a wedding may hold
    // (Section 8). Checked before anything is written.
    await assertCanAddInvitation(wedding.id, wedding.entitlement);

    const templateId = input.templateId ?? DEFAULT_TEMPLATE_ID;
    if (!isSelectableTemplate(templateId)) {
      throw badRequest("That design is not available yet");
    }
    if (input.ceremonyType === "custom" && !input.customCeremonyName) {
      throw badRequest("Name your custom ceremony");
    }

    const label = ceremonyLabel(input.ceremonyType, input.customCeremonyName);
    const slug = await uniqueInvitationSlug([
      wedding.coupleName1,
      wedding.coupleName2,
      label,
    ]);

    return db.invitation.create({
      data: {
        weddingId: wedding.id,
        slug,
        ceremonyType: input.ceremonyType,
        customCeremonyName: input.customCeremonyName ?? null,
        templateId,
        // Settings always exist so the renderer never has to guess defaults.
        settings: { create: {} },
      },
      include: { settings: true },
    });
  });
}
