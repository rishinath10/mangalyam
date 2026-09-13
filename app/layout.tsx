import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  EB_Garamond,
  Gilda_Display,
  Jost,
  Karla,
  Marcellus,
} from "next/font/google";
import "./globals.css";
import { COMPANY } from "@/lib/company";

// Titles. Numerals inside titles are set in EB Garamond instead — see
// lib/typography.tsx, which wraps digit runs so the substitution is automatic
// at the call site rather than something an author has to remember.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const figure = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-figure",
  display: "swap",
});

const ui = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ui",
  display: "swap",
});

// The rest of the font-pairing shortlist (lib/templates/fonts.ts). These are
// only ever used inside an invitation — the app's own chrome stays on the
// three faces above.
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-marcellus",
  display: "swap",
});

const gilda = Gilda_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-gilda",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
