import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/templates/InvitationRenderer";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildInvitationJson, invitationInclude } from "@/lib/invitation/build";
import { resolveDesign } from "@/lib/templates/design-store";
import { formatEventDate } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

/** What a guest may see: published, and nothing else. */
async function loadPublished(slug: string) {
  return db.invitation.findFirst({
    where: { slug, status: "published" },
    include: invitationInclude,
  });
}

/**
 * The same page, on the same URL, for the one person allowed to see it early.
 *
 * A phone frame in the editor is not the thing itself: the opening runs at a
 * different size, the drift reads differently, and a customer about to pay
 * wants to hold the real page in their hand first. So the owner — and only the
 * owner — gets their draft at the address it will keep once published, which
 * means what they test is literally the link they will send.
 *
 * The ownership predicate lives in the `where` clause, so an unowned draft can
 * never produce a row (rule #4). Everyone else still gets the same 404 they got
 * before, which is what stops this from becoming a free way to reach guests
 * without paying.
 */
async function loadOwnDraft(slug: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  return db.invitation.findFirst({
    where: { slug, status: "draft", event: { userId } },
    include: invitationInclude,
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const row = await loadPublished(slug);
  // A draft has no public metadata to give: whoever is asking for it without a
  // session is a crawler or a stranger, and both should be told nothing.
  if (!row) return { title: "Invitation not found", robots: { index: false } };

  const json = buildInvitationJson(row);
  const title = `${json.couple.hostNames} — ${json.ceremonyLabel}`;
  const description = [json.event.venueName, formatEventDate(json.event.date)]
    .filter(Boolean)
    .join(" · ");

  return {
    title,
    description: description || json.couple.message || undefined,
    /**
     * Never indexed, and this is the instruction that actually binds.
     *
     * An invitation is unlisted, not private: the link is meant to travel
     * through WhatsApp groups. What it must not do is turn up in a search for
     * someone's name. The page carries the family's names, the date they will
     * be away from home, their address, whatever their guests wrote, and — if
     * they switched it on — a bank account number.
     *
     * robots.txt asks; a crawler that found the link somewhere else never
     * reads it. `noimageindex` matters as much as the rest here, because the
     * gallery is photographs of a family.
     */
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
    // opengraph-image.tsx generates the card; leaving images unset here lets
    // Next attach it automatically at the right size for every scraper. This
    // is not indexing — it is the preview WhatsApp draws when the host sends
    // the link, which is the entire point of the product.
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitationPage({ params }: Params) {
  const { slug } = await params;

  const published = await loadPublished(slug);
  if (published) {
    // Same builder, same component the live preview uses (rule #3).
    const design = await resolveDesign(published.templateId);
    return <InvitationRenderer invitation={buildInvitationJson(published, design)} />;
  }

  const draft = await loadOwnDraft(slug);
  if (!draft) notFound();
  const draftDesign = await resolveDesign(draft.templateId);

  return (
    <>
      {/* preview, so a reply cannot be filed against an invitation nobody has
          been invited to yet — but live, so the music and the drift are the
          real ones. This is a rehearsal, not a mock-up. */}
      <InvitationRenderer invitation={buildInvitationJson(draft, draftDesign)} preview live />

      <div className="draft-flag">
        <span>
          <b>Draft</b> — only you can see this until you publish.
        </span>
        <Link href={`/dashboard/invitations/${draft.id}`}>Back to the editor</Link>
      </div>
    </>
  );
}
