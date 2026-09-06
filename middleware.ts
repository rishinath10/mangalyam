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

// Only the customer dashboard is gated. Public invitation pages (/i/<slug>),
// auth pages and the API surface are handled by their own route-level checks —
// the API routes must not rely on middleware for authorization (rule #4).
export const config = {
  matcher: ["/dashboard/:path*"],
};
