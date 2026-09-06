import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/templates/InvitationRenderer";
import { db } from "@/lib/db";
import { buildInvitationJson, invitationInclude } from "@/lib/invitation/build";
import { formatEventDate } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

/**
 * Published invitations only. A draft returns 404 to the public — the customer
 * previews drafts through the builder, which is behind their own session.
 * The draft -> published flip and OG image generation are Phase 6.
 */
async function loadPublished(slug: string) {
  return db.invitation.findFirst({
    where: { slug, status: "published" },
    include: invitationInclude,
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const row = await loadPublished(slug);
  if (!row) return { title: "Invitation not found" };

  const json = buildInvitationJson(row);
  const title = `${json.couple.name1} & ${json.couple.name2} — ${json.ceremonyLabel}`;
  const description = [json.event.venueName, formatEventDate(json.event.date)]
    .filter(Boolean)
    .join(" · ");

  return {
    title,
    description: description || json.couple.message || undefined,
    // opengraph-image.tsx generates the card; leaving images unset here lets
    // Next attach it automatically at the right size for every scraper
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitationPage({ params }: Params) {
  const { slug } = await params;
  const row = await loadPublished(slug);
  if (!row) notFound();

  // Same builder, same component the live preview uses (rule #3).
  return <InvitationRenderer invitation={buildInvitationJson(row)} />;
}
