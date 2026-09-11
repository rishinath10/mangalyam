import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { isSelectableDesign, resolveDesign } from "@/lib/templates/design-store";
import { requireInvitation } from "@/lib/auth/ownership";
import { buildInvitationJson, invitationInclude } from "@/lib/invitation/build";
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

    const eventType = invitation.event.eventType;
    if (input.templateId && !(await isSelectableDesign(input.templateId, eventType))) {
      throw badRequest("That design is not available for this occasion");
    }

    // A palette key only means something inside one family, so it is checked
    // against whichever family the invitation will actually be on once this
    // request lands — not the one it is on now.
    const templateId = input.templateId ?? invitation.templateId;
    if (input.accentKey) {
      const manifest = await resolveDesign(templateId);
      if (!manifest.accents.some((a) => a.key === input.accentKey)) {
        throw badRequest("That colour is not in this design's palette");
      }
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
    if (input.accentKey !== undefined) data.accentKey = input.accentKey ?? null;
    if (input.fontPairing !== undefined) data.fontPairing = input.fontPairing ?? null;
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
