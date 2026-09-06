"use client";

import { GopuramTemplate } from "@/components/templates/gopuram";
import { designSystemStyle } from "@/lib/templates/design-systems";
import { getManifest } from "@/lib/templates/registry";
import type { InvitationJson } from "@/lib/invitation/types";
import type { TemplateProps } from "@/lib/templates/types";

const TEMPLATES: Record<string, (props: TemplateProps) => React.ReactNode> = {
  "gopuram-01": GopuramTemplate,
};

/**
 * THE renderer (CLAUDE.md rule #3).
 *
 * The builder's live preview and the published guest page both mount this
 * component with the same invitation JSON. There is deliberately no second
 * rendering path — if you find yourself wanting one, change this instead.
 *
 * `preview` only gates side effects (audio autoplay), never layout or content:
 * what the customer sees while editing is what the guest gets.
 */
export function InvitationRenderer({ invitation, preview = false }: TemplateProps) {
  const manifest = getManifest(invitation.templateId);
  const Template = TEMPLATES[manifest.templateId] ?? GopuramTemplate;

  return (
    <div style={designSystemStyle(manifest.designSystem, invitation.accentColor)}>
      <Template invitation={invitation} preview={preview} />
    </div>
  );
}

export type { InvitationJson };
