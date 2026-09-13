import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/company";

const origin = process.env.NEXT_PUBLIC_APP_URL ?? `https://${COMPANY.site}`;

/**
 * What a crawler may look at.
 *
 * `/i/` is the important line. A published invitation is unlisted, not
 * private — the link travels through WhatsApp groups — and it carries guest
 * names, a home address and, if the host switched it on, a bank account
 * number. None of that belongs in a search index. The pages also carry a
 * `noindex` of their own, because a robots.txt is a request and a meta tag is
 * an instruction, and a link discovered elsewhere never reads this file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/admin/", "/dashboard", "/dashboard/", "/i/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
