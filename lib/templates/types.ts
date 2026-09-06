import type { CeremonyType } from "@prisma/client";
import type { InvitationJson } from "@/lib/invitation/types";

export type SectionKey =
  | "cover"
  | "couple"
  | "event"
  | "schedule"
  | "gallery"
  | "rsvp";

export type DesignSystemKey =
  | "temple-heritage"
  | "kolam-classic"
  | "kalash-royal";

/** What a template declares it supports (CLAUDE.md Section 4.4). */
export interface TemplateManifest {
  templateId: string;
  name: string;
  designSystem: DesignSystemKey;
  sections: SectionKey[];
  features: { music: boolean; countdown: boolean };
  /** Per-template accent overrides layered on the Section 7 presets. */
  ceremonyAccentDefaults: Partial<Record<CeremonyType, string>>;
  /** Used when a ceremony has no preset (e.g. `custom`). */
  defaultAccent: string;
  /** Signature/Bespoke templates are gated by the `premium_templates` entitlement. */
  premium: boolean;
}

/**
 * Design tokens live with the design system, not scattered through component
 * logic (CLAUDE.md Section 5). They are emitted as CSS custom properties by
 * `designSystemStyle()` so template markup reads tokens, never hex literals.
 */
export interface DesignTokens {
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
  rule: string;
  /** Brand colour of the design system, distinct from the per-ceremony accent. */
  brand: string;
  brandDeep: string;
  gold: string;
  fontDisplay: string;
  fontBody: string;
  radius: string;
  /** Scales every animation's duration; keep low for patchy venue data. */
  motionIntensity: number;
}

/** Every template component takes exactly this — the JSON and nothing else. */
export interface TemplateProps {
  invitation: InvitationJson;
  /** True inside the builder preview: suppresses live side effects like autoplay. */
  preview?: boolean;
}
