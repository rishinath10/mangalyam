/**
 * The slug rule, with no database behind it.
 *
 * It lives apart from lib/slug.ts because the create wizard needs to show
 * `mangalyam.my/i/<slug>` under a preview while the visitor is still
 * anonymous — a client component, where importing lib/slug.ts would drag
 * Prisma into the browser bundle. Uniqueness is still a server concern and
 * still lives next to the query that can prove it.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
