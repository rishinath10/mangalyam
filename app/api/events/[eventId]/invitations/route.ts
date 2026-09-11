import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requireEvent } from "@/lib/auth/ownership";
import { assertCanAddInvitation } from "@/lib/entitlements";
import { ceremonyLabel } from "@/lib/ceremonies";
import { EVENT_TYPE_LABELS, isWeddingEvent } from "@/lib/events";
import { uniqueInvitationSlug } from "@/lib/slug";
import { defaultTemplateFor } from "@/lib/templates/registry";
import { isSelectableDesign } from "@/lib/templates/design-store";
import { badRequest } from "@/lib/api";
import { invitationCreateSchema } from "@/lib/validation";

type Params = { params: Promise<{ eventId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { eventId } = await params;
    const { event } = await requireEvent(eventId);
    return db.invitation.findMany({
      where: { eventId: event.id },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });
  });
}

export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const { eventId } = await params;
    const { event } = await requireEvent(eventId);
    const input = await parseBody(req, invitationCreateSchema);

    // Self-serve is always one invitation (Section 8). Checked before
    // anything is written.
    await assertCanAddInvitation(event.id, event.entitlement);

    const templateId = input.templateId ?? defaultTemplateFor(event.eventType);
    if (!(await isSelectableDesign(templateId, event.eventType))) {
      throw badRequest("That design is not available for this occasion");
    }

    // Only a wedding has sub-ceremonies; every other occasion ignores
    // whatever ceremony fields were sent rather than erroring on them, since
    // the builder simply never shows that picker for a non-wedding event.
    const wedding = isWeddingEvent(event.eventType);
    const ceremonyType = wedding ? (input.ceremonyType ?? null) : null;
    const customCeremonyName = wedding ? (input.customCeremonyName ?? null) : null;
    if (wedding && ceremonyType === "custom" && !customCeremonyName) {
      throw badRequest("Name your custom ceremony");
    }

    const label = ceremonyType
      ? ceremonyLabel(ceremonyType, customCeremonyName)
      : EVENT_TYPE_LABELS[event.eventType];
    const slug = await uniqueInvitationSlug([event.hostNames, label]);

    return db.invitation.create({
      data: {
        eventId: event.id,
        slug,
        ceremonyType,
        customCeremonyName,
        templateId,
        // Settings always exist so the renderer never has to guess defaults.
        settings: { create: {} },
      },
      include: { settings: true },
    });
  });
}
