import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/company";

const origin = process.env.NEXT_PUBLIC_APP_URL ?? `https://${COMPANY.site}`;

/**
 * Only the pages that should rank.
 *
 * Invitations are deliberately absent — they are unlisted by design, and a
 * sitemap listing every customer's is the fastest possible way to undo that.
 * Signed-in pages are absent for the obvious reason: a crawler reaching one
 * gets a redirect to the login form.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();
  return [
    { url: origin, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/create`, lastModified: updated, changeFrequency: "monthly", priority: 0.9 },
    { url: `${origin}/signup`, lastModified: updated, changeFrequency: "yearly", priority: 0.5 },
    { url: `${origin}/terms`, lastModified: updated, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/privacy`, lastModified: updated, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/refunds`, lastModified: updated, changeFrequency: "yearly", priority: 0.3 },
  ];
}
