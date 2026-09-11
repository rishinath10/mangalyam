import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { isSelectableDesign, resolveDesign } from "@/lib/templates/design-store";
import { requireUserId } from "@/lib/auth/ownership";
import { ceremonyLabel } from "@/lib/ceremonies";
import { EVENT_TYPE_LABELS, isWeddingEvent } from "@/lib/events";
import { uniqueInvitationSlug } from "@/lib/slug";
import { draftClaimSchema } from "@/lib/validation";

/**
 * Turns a draft built anonymously in the browser into rows this account owns.
 *
 * This is the only place where work that was never guarded becomes work that
 * is: everything before it lived in the visitor's own localStorage, where
 * there was no owner to check against. The event is created *with* the
 * signed-in user's id — never taken from the request — so a claim can only
 * ever produce rows belonging to the caller.
 *
 * It is also the only route that writes an event and its invitation together.
 * A draft is one invitation by definition; splitting the write would leave an
 * event with nothing in it whenever the second call failed, and the customer
 * with a dashboard entry that does nothing.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const userId = await requireUserId();
    const input = await parseBody(req, draftClaimSchema);

    if (!(await isSelectableDesign(input.templateId, input.eventType))) {
      throw badRequest("That design is not available for this occasion");
    }

    // Only a wedding has sub-ceremonies. Anything sent for another occasion is
    // dropped rather than rejected — the wizard hides that step entirely, so a
    // stale value is a leftover, not a request.
    const wedding = isWeddingEvent(input.eventType);
    const ceremonyType = wedding ? (input.ceremonyType ?? null) : null;
    const customCeremonyName = wedding ? (input.customCeremonyName ?? null) : null;
    if (ceremonyType === "custom" && !customCeremonyName?.trim()) {
      throw badRequest("Name your custom ceremony");
    }

    // A palette key means nothing outside its own family, so it is checked
    // against the family actually being saved.
    const manifest = await resolveDesign(input.templateId);
    if (input.accentKey && !manifest.accents.some((a) => a.key === input.accentKey)) {
      throw badRequest("That colour is not in this design's palette");
    }

    const label = ceremonyType
      ? ceremonyLabel(ceremonyType, customCeremonyName)
      : EVENT_TYPE_LABELS[input.eventType];
    const slug = await uniqueInvitationSlug([input.hostNames, label]);

    const settings = input.settings;
    const settingsCreate: Prisma.InvitationSettingsCreateWithoutInvitationInput = {
      ...settings,
      musicUrl: settings.musicUrl ?? null,
      openingText: settings.openingText ?? null,
      contactName: settings.contactName ?? null,
      contactPhone: settings.contactPhone ?? null,
      // Same reasoning as the invitation PATCH route: a plain yyyy-mm-dd on a
      // @db.Date column gets UTC midnight so the stored day cannot drift by
      // one in a non-UTC server timezone.
      rsvpCloseDate: settings.rsvpCloseDate
        ? new Date(`${settings.rsvpCloseDate}T00:00:00Z`)
        : null,
    };

    const event = await db.event.create({
      data: {
        userId,
        hostNames: input.hostNames,
        eventType: input.eventType,
        invitations: {
          create: {
            slug,
            ceremonyType,
            customCeremonyName,
            templateId: input.templateId,
            accentKey: input.accentKey ?? null,
            fontPairing: input.fontPairing ?? null,
            date: input.date ? new Date(`${input.date}T00:00:00Z`) : null,
            startTime: input.startTime ?? null,
            endTime: input.endTime ?? null,
            venueName: input.venueName ?? null,
            address: input.address ?? null,
            mapLink: input.mapLink ?? null,
            description: input.description ?? null,
            settings: { create: settingsCreate },
            scheduleItems: {
              create: input.schedule.map((item, index) => ({
                time: item.time,
                title: item.title,
                description: item.description ?? null,
                sortOrder: index,
              })),
            },
          },
        },
      },
      include: { invitations: { select: { id: true, slug: true } } },
    });

    // Nothing is published here. Publishing stays behind the entitlement check
    // in the publish route — the draft is saved, the payment is still owed.
    return {
      eventId: event.id,
      invitationId: event.invitations[0].id,
      slug: event.invitations[0].slug,
    };
  });
}
