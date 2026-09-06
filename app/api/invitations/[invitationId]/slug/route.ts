import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import { slugify } from "@/lib/slug";
import { z } from "zod";

type Params = { params: Promise<{ invitationId: string }> };

const slugSchema = z.object({ slug: z.string().trim().min(3).max(60) });

const RESERVED = new Set(["api", "i", "dashboard", "login", "signup", "admin", "app"]);

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    const input = await parseBody(req, slugSchema);

    const slug = slugify(input.slug);
    if (slug.length < 3) {
      throw badRequest("Use at least three letters or numbers.");
    }
    if (RESERVED.has(slug)) {
      throw badRequest("That link is reserved. Please choose another.");
    }

    try {
      return await db.invitation.update({
        where: { id: invitation.id },
        data: { slug },
        select: { id: true, slug: true },
      });
    } catch (err) {
      // Slugs are globally unique because invitation URLs are flat, so a
      // collision can come from another customer's wedding entirely.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw badRequest("That link is already taken. Please choose another.");
      }
      throw err;
    }
  });
}
