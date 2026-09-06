import type { CeremonyType } from "@prisma/client";
import { CEREMONY_ACCENT_DEFAULTS } from "@/lib/ceremonies";
import type { TemplateManifest } from "@/lib/templates/types";

/**
 * Launch templates. V1 ships exactly one built template (Temple Heritage,
 * Phase 3); Kolam Classic and Kalash Royal arrive in Phase 8 and are listed as
 * `available: false` until their components exist, so the builder can show them
 * as coming soon without offering a broken selection.
 */
export const TEMPLATE_MANIFESTS: TemplateManifest[] = [
  {
    templateId: "temple-heritage-01",
    name: "Temple Heritage",
    designSystem: "temple-heritage",
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    ceremonyAccentDefaults: CEREMONY_ACCENT_DEFAULTS,
    defaultAccent: "#8A1C1C",
    premium: false,
  },
];

export const DEFAULT_TEMPLATE_ID = "temple-heritage-01";

export function getManifest(templateId: string): TemplateManifest {
  const manifest = TEMPLATE_MANIFESTS.find((t) => t.templateId === templateId);
  // An invitation pointing at a retired template must still render rather than
  // 500, so fall back to the default rather than throwing.
  return manifest ?? TEMPLATE_MANIFESTS[0];
}

export function isKnownTemplate(templateId: string): boolean {
  return TEMPLATE_MANIFESTS.some((t) => t.templateId === templateId);
}

/**
 * Accent resolution order (CLAUDE.md Sections 4.4 and 7):
 *   1. the customer's explicit override
 *   2. the template manifest's default for this ceremony
 *   3. the template's own default accent (this is what `custom` lands on)
 */
export function resolveAccentColor(
  templateId: string,
  ceremonyType: CeremonyType,
  override?: string | null,
): string {
  if (override && /^#[0-9a-fA-F]{6}$/.test(override)) return override;
  const manifest = getManifest(templateId);
  return manifest.ceremonyAccentDefaults[ceremonyType] ?? manifest.defaultAccent;
}
