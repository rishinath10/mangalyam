import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import { assertCanPublish } from "@/lib/entitlements";
import { z } from "zod";

type Params = { params: Promise<{ invitationId: string }> };

const publishSchema = z.object({ publish: z.boolean() });

/**
 * Publishing is where the entitlement actually bites (CLAUDE.md Section 8),
 * and it is the only thing the payment buys. Anyone can build an invitation
 * and watch it work — the create wizard does exactly that before there is even
 * an account. Going public is what costs, so an event with no entitlement is
 * refused here however complete its draft is.
 *
 * Unpublishing is deliberately never gated: someone who has paid and wants
 * their link taken down must not be argued with.
 */
export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    const { publish } = await parseBody(req, publishSchema);

    if (!publish) {
      return db.invitation.update({
        where: { id: invitation.id },
        data: { status: "draft" },
        select: { id: true, status: true, slug: true, publishedAt: true },
      });
    }

    // Nothing goes public without the two things a guest needs to turn up.
    if (!invitation.date) throw badRequest("Add a date before publishing.");
    if (!invitation.venueName?.trim()) throw badRequest("Add a venue before publishing.");

    if (invitation.status !== "published") {
      await assertCanPublish(invitation.eventId, invitation.event.entitlement);
    }

    return db.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "published",
        // keep the first publication date; re-publishing is not a new launch
        publishedAt: invitation.publishedAt ?? new Date(),
      },
      select: { id: true, status: true, slug: true, publishedAt: true },
    });
  });
}
