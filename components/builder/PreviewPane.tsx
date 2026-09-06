"use client";

import { InvitationRenderer } from "@/components/templates/InvitationRenderer";
import type { InvitationJson } from "@/lib/invitation/types";

/**
 * Phone-shaped viewport around the real renderer. The frame is chrome only —
 * inside it is the exact component the guest-facing page mounts (rule #3), so
 * this pane cannot drift from the published result.
 */
export function PreviewPane({ invitation }: { invitation: InvitationJson }) {
  return (
    <div className="mx-auto w-full max-w-[380px]">
      <div className="overflow-hidden rounded-[2rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-xl">
        <div className="h-[70svh] min-h-[520px] overflow-y-auto overscroll-contain bg-white">
          <InvitationRenderer invitation={invitation} preview />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-neutral-500">
        Live preview · mangalyam.my/i/{invitation.slug}
      </p>
    </div>
  );
}
