import type { NextConfig } from "next";

/**
 * Response headers.
 *
 * The site shipped with none of these, which meant the dashboard could be
 * framed by any page on the internet and a browser was free to sniff a
 * content type it had been told plainly.
 *
 * The Content-Security-Policy here is deliberately partial. A full one needs
 * `script-src` with a per-request nonce threaded through Next's streaming
 * renderer, and a CSP that is wrong does not degrade — it blanks the page. So
 * this sets only the directives that carry no such risk and still close the
 * real holes: nothing may frame us, nothing may retarget a form post, no
 * plugins, no injected <base>. Tightening script-src is worth doing later, on
 * purpose, with the time to test it.
 */
const CSP = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  // The modern directive above covers this; kept for older browsers that
  // only understand the legacy header.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the full URL within our own site, only the origin off it: an
  // invitation's slug is a semi-secret and must not travel in a Referer to a
  // venue's website when a guest taps "Get directions".
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self)",
  },
  /**
   * One year, apex only.
   *
   * `includeSubDomains` is deliberately absent. It is the right end state, but
   * it is also a one-year commitment that every subdomain — cdn.mangalyam.my
   * included — is reachable over HTTPS and will stay that way. Add it once
   * that is verified; adding it early locks people out of a host for a year
   * with no way to take it back.
   */
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  // Naming the framework and letting its version be inferred buys an attacker
  // a shortlist of CVEs to try. It buys us nothing.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
