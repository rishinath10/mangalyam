"use client";

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
 * `preview` only gates side effects (audio autoplay, the page drifting under
 * the editor), never layout or content: what the customer sees while editing
 * is what the guest gets — the opening sequence included.
 */
export function InvitationRenderer({ invitation, preview = false }: TemplateProps) {
  const manifest = getManifest(invitation.templateId);
  const Template = TEMPLATES[manifest.templateId] ?? DeepamTemplate;

  return (
    <div style={designSystemStyle(manifest, invitation.accentColor, invitation.fontPairing)}>
      <InvitationShell invitation={invitation} preview={preview}>
        <Template invitation={invitation} preview={preview} />
      </InvitationShell>
    </div>
  );
}

export type { InvitationJson };
