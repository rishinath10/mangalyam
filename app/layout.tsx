import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

// Display face carries the ceremonial tone; body face stays quiet and legible
// at small sizes on a phone. Both are exposed as CSS variables so design-system
// tokens can point at them (lib/templates/design-systems.ts).
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mangalyam",
  description: "Digital wedding invitations for Malaysian Indian weddings.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
