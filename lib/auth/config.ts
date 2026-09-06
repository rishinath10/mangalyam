import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe slice of the Auth.js config.
 *
 * `middleware.ts` runs on the edge runtime, where Prisma and bcrypt cannot be
 * imported. Keeping the providers array empty here lets middleware read and
 * verify the JWT session cookie without dragging Node-only code into the edge
 * bundle. The Credentials provider is attached in lib/auth/index.ts, which only
 * ever runs in the Node runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
