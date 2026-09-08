import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

// Edge-safe: authConfig carries no Prisma/bcrypt imports, so this only reads
// and verifies the session JWT.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const signedIn = Boolean(req.auth?.user);
  const { pathname } = req.nextUrl;

  if (!signedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

// The customer dashboard and the admin area are gated here. Public invitation
// pages (/i/<slug>), auth pages and the API surface are handled by their own
// route-level checks — the API routes must not rely on middleware for
// authorization (rule #4).
//
// This only proves *signed in*, never *admin*. The allowlist check needs the
// database, which the edge runtime cannot reach, so it lives in the /admin
// layout and in every query in lib/admin/queries.ts. Middleware here just
// saves an anonymous visitor a pointless render.
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
