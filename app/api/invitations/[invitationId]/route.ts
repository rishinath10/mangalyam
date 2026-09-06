import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import { buildInvitationJson, invitationInclude } from "@/lib/invitation/build";
import { isSelectableTemplate } from "@/lib/templates/registry";
import { invitationUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ invitationId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    // Ownership first; only then load the full row for rendering.
    const { invitation } = await requireInvitation(invitationId);
    const row = await db.invitation.findUniqueOrThrow({
      where: { id: invitation.id },
      include: invitationInclude,
    });
    return { invitation: row, json: buildInvitationJson(row) };
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    const input = await parseBody(req, invitationUpdateSchema);

    if (input.templateId && !isSelectableTemplate(input.templateId)) {
      throw badRequest("That design is not available yet");
    }

    const ceremonyType = input.ceremonyType ?? invitation.ceremonyType;
    const customName =
      input.customCeremonyName !== undefined
        ? input.customCeremonyName
        : invitation.customCeremonyName;
    if (ceremonyType === "custom" && !customName?.trim()) {
      throw badRequest("Name your custom ceremony");
    }

    const data: Prisma.InvitationUpdateInput = {};
    if (input.ceremonyType !== undefined) data.ceremonyType = input.ceremonyType;
    if (input.customCeremonyName !== undefined)
      data.customCeremonyName = input.customCeremonyName ?? null;
    if (input.templateId !== undefined) data.templateId = input.templateId;
    if (input.accentColorOverride !== undefined)
      data.accentColorOverride = input.accentColorOverride ?? null;
    // A plain yyyy-mm-dd on a @db.Date column: append UTC midnight so the
    // stored day cannot drift by one in a non-UTC server timezone.
    if (input.date !== undefined)
      data.date = input.date ? new Date(`${input.date}T00:00:00Z`) : null;
    if (input.startTime !== undefined) data.startTime = input.startTime ?? null;
    if (input.endTime !== undefined) data.endTime = input.endTime ?? null;
    if (input.venueName !== undefined) data.venueName = input.venueName ?? null;
    if (input.address !== undefined) data.address = input.address ?? null;
    if (input.mapLink !== undefined) data.mapLink = input.mapLink ?? null;
    if (input.description !== undefined) data.description = input.description ?? null;
    if (input.coverPhotoUrl !== undefined)
      data.coverPhotoUrl = input.coverPhotoUrl ?? null;

    const row = await db.invitation.update({
      where: { id: invitation.id },
      data,
      include: invitationInclude,
    });
    return { invitation: row, json: buildInvitationJson(row) };
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    await db.invitation.delete({ where: { id: invitation.id } });
    return { deleted: true };
  });
}
