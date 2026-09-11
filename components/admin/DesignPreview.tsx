"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PreviewPane } from "@/components/builder/PreviewPane";
import { composeInvitationJson } from "@/lib/invitation/compose";
import { emptyDraft, draftToSource } from "@/lib/draft";
import type { TemplateManifest } from "@/lib/templates/types";

/**
 * A design, seen as a card.
 *
 * Built out of the ordinary empty draft with sample answers filled in, then
 * put through `composeInvitationJson` and the one renderer — so what an
 * operator judges here is literally what a guest opens, not an approximation
 * of it drawn for the admin screen.
 *
 * The sample names are deliberately long-ish and the venue deliberately real:
 * a design that looks right for "A & B" and breaks on "Kalyanasundaram" is a
 * design that breaks in production.
 */
export function DesignPreview({ design }: { design: TemplateManifest }) {
  const [accentKey, setAccentKey] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  /**
   * Opened for them.
   *
   * A guest is meant to meet the sealed cover first, and the builder's preview
   * keeps that. Here it is in the way: this screen exists to judge artwork,
   * and a sealed card shows none of it. The seal is opened by clicking it
   * rather than by adding a prop to the shell, so there is still exactly one
   * opening implementation and no admin-only branch inside the renderer.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      const seal = stage.current?.querySelector<HTMLElement>(".inv-seal");
      seal?.click();
    }, 400);
    return () => clearTimeout(timer);
  }, [design.templateId]);

  const invitation = useMemo(() => {
    const draft = {
      ...emptyDraft(),
      eventType: design.eventTypes.includes("wedding")
        ? ("wedding" as const)
        : design.eventTypes[0],
      groomName: "Ashwin",
      brideName: "Kalyanasundari",
      hostNames: "The Kumar Family",
      templateId: design.templateId,
      accentKey,
      date: "2026-11-06",
      startTime: "18:30",
      venueName: "Wisma Tamil Bell Club",
      address: "12, Jalan Tun Sambanthan\nBrickfields, Kuala Lumpur",
      description: "Turmeric, laughter and a little chaos.",
    };
    return composeInvitationJson(draftToSource(draft, design));
  }, [design, accentKey]);

  return (
    <div className="design-preview" ref={stage}>
      <div className="design-preview-controls">
        <span className="field-label">Try a colour</span>
        <div className="chiprow">
          {design.accents.map((swatch) => (
            <button
              key={swatch.key}
              type="button"
              className="chip"
              aria-pressed={accentKey === swatch.key}
              onClick={() => setAccentKey(swatch.key === accentKey ? null : swatch.key)}
            >
              <i style={{ background: swatch.hex }} />
              {swatch.name}
            </button>
          ))}
        </div>
      </div>

      <PreviewPane invitation={invitation} slug="your-design" />
    </div>
  );
}
