import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond, Jost } from "next/font/google";
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
      className={`${serif.variable} ${figure.variable} ${ui.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
