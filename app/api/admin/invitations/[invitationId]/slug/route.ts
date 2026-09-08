import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, handle, notFound, parseBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import { slugSchema } from "@/lib/admin/schemas";
import { slugify } from "@/lib/slug";

type Params = { params: Promise<{ invitationId: string }> };

/**
 * The same edit a customer can make, reachable for any invitation — for the
 * support case where a published link has to be corrected on someone's behalf.
 *
 * The reserved list is duplicated from the customer route rather than shared:
 * they are the same words today, but an admin route relaxing them later must
 * not silently relax them for customers too.
 */
const RESERVED = new Set(["api", "i", "dashboard", "login", "signup", "admin", "app"]);

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    await requireAdmin();
    const { invitationId } = await params;
    const input = await parseBody(req, slugSchema);

    const slug = slugify(input.slug);
    if (slug.length < 3) throw badRequest("Use at least three letters or numbers.");
    if (RESERVED.has(slug)) throw badRequest("That link is reserved. Please choose another.");

    const existing = await db.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true },
    });
    if (!existing) throw notFound("Invitation");

    try {
      return await db.invitation.update({
        where: { id: invitationId },
        data: { slug },
        select: { id: true, slug: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw badRequest("That link is already taken.");
      }
      throw err;
    }
  });
}
