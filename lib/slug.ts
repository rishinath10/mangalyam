import { db } from "@/lib/db";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Builds `rishi-priya-haldi` style slugs. Slugs are globally unique because
 * invitation URLs are flat (`mangalyam.my/i/<slug>`), so a collision across two
 * different weddings is possible and has to be resolved with a suffix.
 */
export async function uniqueInvitationSlug(parts: string[]): Promise<string> {
  const base = slugify(parts.filter(Boolean).join(" ")) || "invitation";

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const taken = await db.invitation.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }

  // Fall back to a random suffix rather than looping forever.
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
