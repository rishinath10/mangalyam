"use client";

import { ArtTemplate } from "@/components/templates/art/ArtTemplate";
import { DeepamTemplate } from "@/components/templates/deepam";
import { MandapamTemplate } from "@/components/templates/mandapam";
import { InvitationShell } from "@/components/templates/shared/InvitationShell";
import { designSystemStyle } from "@/lib/templates/design-systems";
import { getManifest } from "@/lib/templates/registry";
import type { InvitationJson } from "@/lib/invitation/types";
import type { TemplateProps } from "@/lib/templates/types";

const TEMPLATES: Record<string, (props: TemplateProps) => React.ReactNode> = {
  "mandapam-01": MandapamTemplate,
  "deepam-01": DeepamTemplate,
};

/**
 * THE renderer (CLAUDE.md rule #3).
 *
 * The builder's live preview and the published guest page both mount this
 * component with the same invitation JSON. There is deliberately no second
 * rendering path — if you find yourself wanting one, change this instead.
 *
 * `preview` and `live` only gate side effects (audio autoplay, the page
 * drifting under the editor, whether the RSVP can be submitted), never layout
 * or content: what the customer sees while editing is what the guest gets —
 * the opening sequence included. `live` defaults to the opposite of `preview`,
 * so the only caller that has to think about it is the owner's draft preview,
 * which wants the real behaviour with the replies still held back.
 */
export function InvitationRenderer({
  invitation,
  preview = false,
  live,
}: TemplateProps & { live?: boolean }) {
  const manifest = getManifest(invitation.templateId);
  // A coded family uses its own component; a drawn one needs no component at
  // all, which is what lets a design be a folder of art and a manifest entry.
  const Template =
    TEMPLATES[manifest.templateId] ?? (manifest.art ? ArtTemplate : DeepamTemplate);

  return (
    <div style={designSystemStyle(manifest, invitation.accentColor, invitation.fontPairing)}>
      <InvitationShell invitation={invitation} preview={preview} live={live}>
        <Template invitation={invitation} preview={preview} />
      </InvitationShell>
    </div>
  );
}

export type { InvitationJson };
