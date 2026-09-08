import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "@/lib/api";

/**
 * Admin access, for the Mangalyam owner.
 *
 * Everything else in this codebase reads *scoped to the signed-in user* — the
 * guards in ownership.ts put the ownership predicate inside the `where` clause
 * so an unowned row can never be produced. The admin surface is the one place
 * that deliberately reads across users, so it gets its own guard here rather
 * than an `isAdmin` bypass threaded through those, which would turn every
 * existing query into something that has to be re-audited.
 *
 * The allowlist lives in the environment, not the database:
 *   ADMIN_EMAILS="you@example.com, ops@example.com"
 * There is no row anywhere the app can write that grants admin, so a bug in
 * signup or profile editing cannot escalate anyone. Changing who is an admin
 * is a deploy, which for a solo owner is the right friction.
 */

/** Parsed per call: the set is tiny, and this avoids a stale cache after a deploy. */
function allowlist(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Fails closed. An unset or empty ADMIN_EMAILS means nobody is an admin —
 * never "everybody", which is the shape this kind of check usually goes wrong.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = allowlist();
  if (list.size === 0) return false;
  return list.has(email.trim().toLowerCase());
}

export type AdminIdentity = { userId: string; email: string };

/**
 * The authoritative check, and the only thing that may open an admin door.
 *
 * The email is read from the database rather than from the session token. The
 * JWT is signed and not forgeable, but it is a snapshot taken at sign-in: a
 * token issued before an address changed would still carry the old one, and
 * this is precisely the check where a stale value must not decide the answer.
 *
 * Throws 404 rather than 403, matching notFound()'s reasoning elsewhere — an
 * admin page should be indistinguishable from a route that does not exist, so
 * probing cannot confirm the surface is even there.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw notFound("Page");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user || !isAdminEmail(user.email)) throw notFound("Page");

  return { userId, email: user.email };
}

/** Non-throwing form, for deciding whether to show an admin link in the UI. */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}
