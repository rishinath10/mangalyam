import type { InvitationJson } from "@/lib/invitation/types";

/** The glyph a family marks its sections with — a lotus, a flame. */
export type SectionMark = (props: { className?: string }) => React.ReactNode;

/**
 * The divider a family draws between blocks. Separate from `SectionMark` for
 * the same reason `align` exists: a zari band is Mandapam's, and drawing one
 * inside a shared section put a Mandapam motif in the middle of a Deepam page.
 */
export type SectionRule = (props: { className?: string }) => React.ReactNode;

/**
 * Which way a family sets its shared sections. This is a family property, not
 * a per-section one: Mandapam is symmetric throughout and Deepam is editorial
 * throughout, and a family that is left-aligned on its cover but centred in
 * every shared section below reads as two designs stapled together.
 */
export type SectionAlign = "center" | "left";

export interface SectionProps {
  invitation: InvitationJson;
  Mark: SectionMark;
  Rule: SectionRule;
  align?: SectionAlign;
  preview?: boolean;
}

/**
 * The class pairs each aligned section needs. Centring takes both `text-center`
 * and `mx-auto` — the text and the constrained block are separate decisions —
 * so they are resolved together here rather than re-derived in every section.
 */
export function alignClasses(align: SectionAlign = "center") {
  const centred = align === "center";
  return {
    /** Applies to the section or its reveal wrapper. */
    text: centred ? "text-center" : "text-left",
    /** Applies to any max-w-* block inside it. */
    block: centred ? "mx-auto" : "",
  };
}
