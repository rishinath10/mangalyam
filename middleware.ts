import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

// Edge-safe: authConfig carries no Prisma/bcrypt imports, so this only reads
// and verifies the session JWT.
const { auth } = NextAuth(authConfig);

/** Paths that require a session. Everything else here is just passing through. */
const GUARDED = ["/dashboard", "/admin"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  /**
   * One hostname, not two.
   *
   * www.mangalyam.my was answering 200 with the whole site on it, which splits
   * search ranking between two addresses and — worse — means a session cookie
   * set on one host does not exist on the other, so a customer who lands on
   * the wrong one appears signed out. A permanent redirect is the fix a
   * crawler and a browser both understand.
   *
   * This could equally live in the reverse proxy, and if you would rather set
   * it in Coolify then this becomes a harmless no-op. Doing it here means it
   * is true wherever the app is deployed.
   */
  if (host.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = host.slice(4);
    url.port = "";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  if (GUARDED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!req.auth?.user) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

// The customer dashboard and the admin area are gated above. Public invitation
// pages (/i/<slug>), auth pages and the API surface are handled by their own
// route-level checks — the API routes must not rely on middleware for
// authorization (rule #4).
//
// The matcher is now everything-except-assets rather than only the two guarded
// trees, because the www redirect has to see every request. Static files,
// image optimisation and the favicon are excluded: redirecting or decoding a
// JWT for each of those is pure cost.
//
// Being on a path here still only ever proves *signed in*, never *admin*. The
// allowlist check needs the database, which the edge runtime cannot reach, so
// it lives in the /admin layout and in every query in lib/admin/queries.ts.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|img/|templates/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)"],
};
