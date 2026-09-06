import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ApiError, badRequest, handle, notFound, parseBody } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { rsvpCreateSchema } from "@/lib/validation";

type Params = { params: Promise<{ slug: string }> };

/**
 * The only public-write endpoint in the app (CLAUDE.md rule #4). Anyone can
 * post here without an account, so it is addressed by slug rather than id,
 * rate-limited, and refuses anything that is not an open RSVP on a published
 * invitation.
 */
export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const limited = rateLimit(clientKey(req, "rsvp"), { limit: 8, windowMs: 10 * 60_000 });
    if (!limited.ok) {
      throw new ApiError(429, "Too many replies from this connection. Please try again shortly.", {
        retryAfterSeconds: limited.retryAfterSeconds,
      });
    }

    const { slug } = await params;
    const invitation = await db.invitation.findFirst({
      where: { slug, status: "published" },
      select: { id: true, settings: true },
    });
    if (!invitation) throw notFound("Invitation");

    const settings = invitation.settings;
    if (settings && !settings.rsvpEnabled) {
      throw badRequest("This invitation is not collecting replies.");
    }

    // The close date is a plain day: replies stay open until the end of it.
    if (settings?.rsvpCloseDate) {
      const closesAfter = new Date(settings.rsvpCloseDate);
      closesAfter.setUTCHours(23, 59, 59, 999);
      if (Date.now() > closesAfter.getTime()) {
        throw badRequest("Replies for this ceremony have closed.");
      }
    }

    const input = await parseBody(req, rsvpCreateSchema);

    await db.rsvp.create({
      data: {
        invitationId: invitation.id,
        guestName: input.guestName,
        attending: input.attending,
        // someone who is not coming brings nobody, whatever the form said
        guestCount: input.attending ? (input.guestCount ?? 1) : 0,
        mealPreference:
          input.attending && settings?.askMealPreference ? (input.mealPreference ?? null) : null,
        message: input.message ?? null,
      },
    });

    // Nothing about the row goes back to the guest: the reply list is the
    // owner's to read, and echoing it here would leak it to anyone.
    return { received: true };
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
