import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { COMPANY } from "@/lib/company";

/**
 * Every typeface is a file in ./fonts, not a download.
 *
 * These used to come from next/font/google, which fetches them from Google
 * while the site is being built. That made every deploy depend on what Google
 * answered that minute, and one day it answered with a font address the
 * loader could not parse — the build failed and nothing had changed in the
 * code. A font that is in the repository cannot do that.
 *
 * Latin subsets only, the same as before. All six are under the SIL Open Font
 * License; the licence texts sit beside the files.
 */

// Titles. Numerals inside titles are set in EB Garamond instead — see
// lib/typography.tsx, which wraps digit runs so the substitution is automatic
// at the call site rather than something an author has to remember.
const serif = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

const figure = localFont({
  src: [
    { path: "./fonts/eb-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/eb-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/eb-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-figure",
  display: "swap",
});

const ui = localFont({
  src: [
    { path: "./fonts/jost-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/jost-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jost-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-ui",
  display: "swap",
});

// The rest of the font-pairing shortlist (lib/templates/fonts.ts). These are
// only ever used inside an invitation — the app's own chrome stays on the
// three faces above.
const marcellus = localFont({
  src: [
    { path: "./fonts/marcellus-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-marcellus",
  display: "swap",
});

const gilda = localFont({
  src: [
    { path: "./fonts/gilda-display-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-gilda",
  display: "swap",
});

const karla = localFont({
  src: [
    { path: "./fonts/karla-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/karla-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/karla-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-karla",
  display: "swap",
});

const DESCRIPTION =
  "E-invitations for Malaysian Indian families — weddings, naming ceremonies, housewarmings, temple consecrations and community celebrations. One link, sent on WhatsApp, with RSVPs included. One flat price, no subscription.";

export const metadata: Metadata = {
  /**
   * Every canonical and share URL is resolved against this.
   *
   * The fallback is the real domain, not localhost, and that matters more than
   * it looks: NEXT_PUBLIC_* is inlined at BUILD time, the policy pages are
   * prerendered at build time, and the Docker build only receives
   * NEXT_PUBLIC_APP_URL if it is passed as a build argument. Miss that and a
   * localhost fallback would ship canonical tags pointing at
   * http://localhost:3000 — visible to Google, invisible to us. Falling back
   * to the production origin makes the failure harmless.
   */
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? `https://${COMPANY.site}`,
  ),
  title: {
    default: `${COMPANY.brand} — e-invitations for every event you hold`,
    template: `%s · ${COMPANY.brand}`,
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: COMPANY.brand,
    locale: "en_MY",
    title: `${COMPANY.brand} — e-invitations for every event you hold`,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY.brand} — e-invitations for every event you hold`,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${figure.variable} ${ui.variable} ${marcellus.variable} ${gilda.variable} ${karla.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
