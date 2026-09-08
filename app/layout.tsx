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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Mangalyam — an invitation for every ceremony",
    template: "%s · Mangalyam",
  },
  description:
    "Digital wedding invitations for Malaysian Indian families. One wedding, a separate invitation and RSVP for every ceremony.",
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
