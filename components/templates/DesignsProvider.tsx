"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { EventType } from "@prisma/client";
import {
  DEFAULT_TEMPLATE_ID,
  getManifest,
  TEMPLATE_MANIFESTS,
  templatesForEvent,
} from "@/lib/templates/registry";
import type { TemplateManifest } from "@/lib/templates/types";

/**
 * The designs a picker may offer, handed down from the server.
 *
 * `lib/templates/registry.ts` is imported by browser modules and so has to
 * stay synchronous and code-only. That was fine while every design was
 * written in code; a design added through /admin/designs lives in the database
 * and cannot reach those modules at all. Rather than make the registry async
 * — which would put a fetch in the render path of a card and ripple through
 * eighteen call sites — the server resolves the list once and passes it in.
 *
 * Outside a provider every hook falls back to the code registry, so a
 * component that has not been wired up behaves exactly as it did before
 * custom designs existed. That is what makes this safe to adopt one screen at
 * a time instead of in one sweep.
 */
const DesignsContext = createContext<TemplateManifest[] | null>(null);

export function DesignsProvider({
  designs,
  children,
}: {
  designs: TemplateManifest[];
  children: ReactNode;
}) {
  // The array is rebuilt on every server render; memoising on its contents
  // keeps consumers from re-rendering for an identical list.
  const value = useMemo(() => designs, [designs]);
  return <DesignsContext.Provider value={value}>{children}</DesignsContext.Provider>;
}

export function useDesigns(): TemplateManifest[] {
  return useContext(DesignsContext) ?? TEMPLATE_MANIFESTS;
}

/**
 * One design. Falls back the same way `getManifest` does — to the default
 * family rather than to nothing — so an invitation on a design that was
 * deleted still renders.
 */
export function useManifest(templateId: string): TemplateManifest {
  const designs = useDesigns();
  return (
    designs.find((d) => d.templateId === templateId) ??
    designs.find((d) => d.templateId === DEFAULT_TEMPLATE_ID) ??
    getManifest(templateId)
  );
}

/** The designs this occasion may choose between, built ones only. */
export function useFamilies(eventType: EventType): TemplateManifest[] {
  const designs = useContext(DesignsContext);
  if (!designs) return templatesForEvent(eventType);
  return designs.filter((d) => d.built && d.eventTypes.includes(eventType));
}
