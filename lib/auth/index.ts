import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth/config";
import { credentialsSchema } from "@/lib/auth/schemas";
import { clearRateLimit, clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * A brake on password guessing.
 *
 * Without this an attacker can try passwords against a known email address as
 * fast as bcrypt will answer, forever — and bcrypt at cost 12 is slow enough
 * to feel like protection while still allowing thousands of attempts a day.
 * Ten failures per address per fifteen minutes leaves a forgetful customer
 * plenty of room and takes an online guessing attack off the table.
 *
 * Keyed on the email rather than the IP, deliberately: the address is the
 * thing being attacked, and it is the one value an attacker cannot rotate
 * while still trying to get into that account. The IP is a second key, so one
 * host cannot spray many addresses either.
 *
 * The counter is per-process (see lib/rate-limit.ts). On one container that
 * is the whole picture; on several it becomes per-container, which is the
 * point at which this wants Redis rather than a Map.
 */
const LOGIN_LIMIT = { limit: 10, windowMs: 15 * 60_000 };
const LOGIN_SPRAY = { limit: 40, windowMs: 15 * 60_000 };

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const address = email.toLowerCase();

        // Checked before the database is touched and before bcrypt runs, so a
        // flood costs us nothing. Returning null rather than throwing keeps
        // the answer identical to a wrong password: an attacker learns only
        // that it did not work, never that they tripped a limit.
        const perAddress = rateLimit(`login:${address}`, LOGIN_LIMIT);
        const perHost = request ? rateLimit(clientKey(request, "login-ip"), LOGIN_SPRAY) : { ok: true };
        if (!perAddress.ok || !perHost.ok) {
          console.warn(`Rate-limited sign-in attempt for ${address}`);
          return null;
        }

        const user = await db.user.findUnique({ where: { email: address } });

        // Hash a throwaway value when the user is missing so a non-existent
        // account takes the same time as a wrong password.
        if (!user) {
          await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // A clean sign-in clears the counter, so somebody who fumbled their
        // password four times is not then locked out of their own account by
        // a stale window after they get it right.
        clearRateLimit(`login:${address}`);

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
