import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { isAdmin } from "@/lib/auth/admin";
import { requireInvitation } from "@/lib/auth/ownership";
import { invitationInclude, toInvitationSource } from "@/lib/invitation/build";
import { InvitationBuilder } from "@/components/builder/InvitationBuilder";

type Params = { params: Promise<{ invitationId: string }> };

export default async function InvitationBuilderPage({ params }: Params) {
  const { invitationId } = await params;

  let owned;
  try {
    ({ invitation: owned } = await requireInvitation(invitationId));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const row = await db.invitation.findUniqueOrThrow({
    where: { id: owned.id },
    include: invitationInclude,
  });

  return (
    // The customiser is a light workspace inside the dashboard's dark chrome
    // (CLAUDE.md has no opinion here — this is a deliberate, scoped choice):
    // colour tokens still come entirely from the tone-cream redefinition, so
    // nothing inside had to be re-themed by hand.
    <div className="tone-cream builder-light">
      <Link href={`/dashboard/events/${row.eventId}`} className="crumb">
        ← {row.event.hostNames}
      </Link>

      {/* The server hands over a plain source object; every edit from here on
          is local state composed into the same JSON the published page uses. */}
      <InvitationBuilder
        initialSource={toInvitationSource(row)}
        // Photo ids are not part of the content contract, but the gallery
        // editor needs them to patch and delete individual photos.
        initialPhotos={row.photos.map((photo) => ({
          id: photo.id,
          url: photo.url,
          caption: photo.caption,
          sortOrder: photo.sortOrder,
        }))}
        status={row.status}
        // The same two conditions assertCanPublish checks, so the Share tab can
        // say why publishing is refused instead of only failing when it is
        // tried. The server still decides; this only picks the button.
        canPublish={Boolean(owned.event.entitlement) || (await isAdmin())}
      />
    </div>
  );
}
