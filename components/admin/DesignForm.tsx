"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/events";
import { FONT_PAIRINGS, FONT_PAIRING_KEYS, type FontPairingKey } from "@/lib/templates/fonts";

export interface DesignFormValues {
  name: string;
  tagline: string;
  eventTypes: EventType[];
  accents: { name: string; hex: string }[];
  fontPairing: FontPairingKey;
  tokens: Record<string, string | number>;
  groundFit: "tile" | "cover";
  groundVeil: number;
}

/** What a new design starts as: legible, neutral, and obviously a placeholder. */
export const BLANK_DESIGN: DesignFormValues = {
  name: "",
  tagline: "",
  eventTypes: [...EVENT_TYPES] as EventType[],
  accents: [{ name: "Kumkum", hex: "#A81A2C" }],
  fontPairing: "classic",
  tokens: {
    surface: "#FDFBF5",
    surfaceAlt: "#F4EFE2",
    ink: "#241E14",
    inkMuted: "#6F6553",
    rule: "#DED5C0",
    brand: "#8A6B14",
    brandDeep: "#5E480C",
    gold: "#B8912F",
    radius: "4px",
    motionIntensity: 0.95,
  },
  groundFit: "tile",
  groundVeil: 0.88,
};

/** Plain-language labels: nobody outside this codebase calls it "surfaceAlt". */
const TOKEN_LABELS: Record<string, string> = {
  surface: "Paper",
  surfaceAlt: "Paper, shaded",
  ink: "Text",
  inkMuted: "Quiet text",
  rule: "Hairlines",
  brand: "The design's own colour",
  brandDeep: "Its darker tone",
  gold: "Metallic",
};

const TOKEN_ORDER = [
  "surface",
  "surfaceAlt",
  "ink",
  "inkMuted",
  "rule",
  "brand",
  "brandDeep",
  "gold",
] as const;

export function DesignForm({
  templateId,
  initial,
  canSample,
}: {
  /** Absent when creating; present when editing an existing design. */
  templateId?: string;
  initial?: DesignFormValues;
  /** Whether there is artwork to read colours out of. */
  canSample?: boolean;
}) {
  const router = useRouter();
  const [v, setV] = useState<DesignFormValues>(initial ?? BLANK_DESIGN);
  const [busy, setBusy] = useState(false);
  const [sampling, setSampling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<DesignFormValues>) => {
    setV((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  function toggleOccasion(type: EventType) {
    set({
      eventTypes: v.eventTypes.includes(type)
        ? v.eventTypes.filter((t) => t !== type)
        : [...v.eventTypes, type],
    });
  }

  async function readColoursFromArt() {
    if (!templateId) return;
    setSampling(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/designs/${templateId}/palette`, { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not read colours from the artwork.");
        return;
      }
      set({ tokens: payload.tokens, accents: payload.accents });
    } catch {
      setError("Could not reach the server to read the artwork.");
    } finally {
      setSampling(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);
    const body = JSON.stringify({
      name: v.name,
      tagline: v.tagline,
      eventTypes: v.eventTypes,
      accents: v.accents,
      fontPairing: v.fontPairing,
      tokens: { ...v.tokens, motionIntensity: Number(v.tokens.motionIntensity) },
      groundFit: v.groundFit,
      groundVeil: Number(v.groundVeil),
    });
    try {
      const res = await fetch(
        templateId ? `/api/admin/designs/${templateId}` : "/api/admin/designs",
        {
          method: templateId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = payload.details
          ? Object.values(payload.details as Record<string, string[]>).flat().join(" ")
          : null;
        setError(detail || payload.error || "That could not be saved.");
        return;
      }
      if (templateId) {
        setSaved(true);
        router.refresh();
      } else {
        // Straight to the new design's own page, where the artwork goes up.
        // A design without artwork is not finished, and returning to a list
        // would make it look as though it were.
        router.push(`/admin/designs/${payload.templateId}`);
      }
    } catch {
      setError("Your changes did not reach us — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1.4rem" }}>
      {error && <p className="notice notice-bad" role="alert">{error}</p>}

      <div className="form-grid">
        <Input
          id="designName"
          label="Name"
          placeholder="Kolam Rose"
          maxLength={40}
          hint="What customers see in the picker."
          value={v.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        <Input
          id="designTagline"
          label="Tagline"
          placeholder="Rose and gold, drawn like a kolam"
          maxLength={80}
          value={v.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </div>

      <div>
        <span className="field-label">Offered for</span>
        <div className="chiprow">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="chip"
              aria-pressed={v.eventTypes.includes(type)}
              onClick={() => toggleOccasion(type)}
            >
              {EVENT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="field-label">Lettering</span>
        <div className="chiprow">
          {FONT_PAIRING_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="chip chip-type"
              aria-pressed={v.fontPairing === key}
              onClick={() => set({ fontPairing: key })}
            >
              <span style={{ fontFamily: FONT_PAIRINGS[key].display }}>
                {FONT_PAIRINGS[key].name}
              </span>
            </button>
          ))}
        </div>
        <p className="dim" style={{ fontSize: "var(--t-xs)", marginTop: ".5rem" }}>
          {FONT_PAIRINGS[v.fontPairing].note} — this is the one it opens on; a
          customer can still choose another.
        </p>
      </div>

      <div>
        <div className="panel-head" style={{ padding: 0, marginBottom: ".8rem" }}>
          <span className="field-label" style={{ margin: 0 }}>Colours</span>
          {templateId && (
            <Button
              type="button"
              variant="line"
              size="sm"
              disabled={!canSample || sampling}
              onClick={readColoursFromArt}
            >
              {sampling ? "Reading…" : "Read them from the artwork"}
            </Button>
          )}
        </div>
        {templateId && !canSample && (
          <p className="dim" style={{ fontSize: "var(--t-xs)", marginBottom: ".8rem" }}>
            Upload artwork below and this can pull the palette out of it for you.
          </p>
        )}

        <div className="token-grid">
          {TOKEN_ORDER.map((key) => (
            <label key={key} className="token">
              <input
                type="color"
                value={String(v.tokens[key])}
                onChange={(e) => set({ tokens: { ...v.tokens, [key]: e.target.value } })}
              />
              <span>
                <b>{TOKEN_LABELS[key]}</b>
                <span className="mono">{String(v.tokens[key])}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="field-label">Accent colours</span>
        <p className="dim" style={{ fontSize: "var(--t-xs)", marginBottom: ".7rem" }}>
          What a customer picks between. The first is the one it starts on.
        </p>
        <div style={{ display: "grid", gap: ".6rem" }}>
          {v.accents.map((accent, i) => (
            <div key={i} className="accent-row">
              <input
                type="color"
                value={accent.hex}
                onChange={(e) => {
                  const next = [...v.accents];
                  next[i] = { ...next[i], hex: e.target.value };
                  set({ accents: next });
                }}
              />
              <input
                type="text"
                value={accent.name}
                maxLength={40}
                placeholder="Kumkum"
                onChange={(e) => {
                  const next = [...v.accents];
                  next[i] = { ...next[i], name: e.target.value };
                  set({ accents: next });
                }}
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={v.accents.length === 1}
                onClick={() => set({ accents: v.accents.filter((_, j) => j !== i) })}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        {v.accents.length < 8 && (
          <div style={{ marginTop: ".7rem" }}>
            <Button
              type="button"
              variant="line"
              size="sm"
              onClick={() =>
                set({ accents: [...v.accents, { name: "New colour", hex: "#A81A2C" }] })
              }
            >
              Add a colour
            </Button>
          </div>
        )}
      </div>

      <div>
        <span className="field-label">Background texture</span>
        <div className="chiprow">
          <button
            type="button"
            className="chip"
            aria-pressed={v.groundFit === "tile"}
            onClick={() => set({ groundFit: "tile" })}
          >
            Repeats
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={v.groundFit === "cover"}
            onClick={() => set({ groundFit: "cover" })}
          >
            One large image
          </button>
        </div>
        <label className="veil">
          <span>
            How far it is knocked back
            <b>{Math.round((1 - v.groundVeil) * 100)}% visible</b>
          </span>
          <input
            type="range"
            min={0}
            max={0.98}
            step={0.02}
            value={v.groundVeil}
            onChange={(e) => set({ groundVeil: Number(e.target.value) })}
          />
        </label>
        <p className="dim" style={{ fontSize: "var(--t-xs)", marginTop: ".4rem" }}>
          A texture at full strength makes the words on top unreadable. Most
          designs sit between 5% and 15%.
        </p>
      </div>

      <div className="r" style={{ gap: ".9rem", alignItems: "center" }}>
        <Button type="button" onClick={save} disabled={busy || !v.name.trim()}>
          {busy ? "Saving…" : templateId ? "Save changes" : "Create the design"}
        </Button>
        {saved && <span className="save-state" data-tone="good">Saved</span>}
      </div>
    </div>
  );
}
