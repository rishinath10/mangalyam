"use client";

import { InvitationRenderer } from "@/components/templates/InvitationRenderer";
import type { InvitationJson } from "@/lib/invitation/types";

/**
 * Phone-shaped viewport around the real renderer. The frame is chrome only —
 * inside it is the exact component the guest-facing page mounts (rule #3), so
 * this pane cannot drift from the published result.
 */
export function PreviewPane({
  invitation,
  slug,
}: {
  invitation: InvitationJson;
  slug: string;
}) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-scroll">
          <InvitationRenderer invitation={invitation} preview />
        </div>
      </div>
      <p className="phone-cap">Live preview · mangalyam.my/i/{slug}</p>
    </div>
  );
}
