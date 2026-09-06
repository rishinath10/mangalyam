import { db } from "@/lib/db";
import { badRequest, forbidden, handle, parseBody } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import { invitationLimitFor } from "@/lib/entitlements";
import { z } from "zod";

type Params = { params: Promise<{ invitationId: string }> };

const publishSchema = z.object({ publish: z.boolean() });

/**
 * Publishing is where the entitlement actually bites (CLAUDE.md Section 8).
 * The builder lets a customer draft freely; the limit is counted against
 * *published* invitations, so someone on Essential can lay out all their
 * ceremonies and then choose which one goes live.
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
      const limit = invitationLimitFor(invitation.wedding.entitlement);
      if (limit !== null) {
        const live = await db.invitation.count({
          where: { weddingId: invitation.weddingId, status: "published" },
        });
        if (live >= limit) {
          throw forbidden(
            invitation.wedding.entitlement
              ? `Your package covers ${limit} published invitation${limit === 1 ? "" : "s"}. Unpublish another, or upgrade.`
              : "Complete your purchase to publish this invitation.",
          );
        }
      }
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
