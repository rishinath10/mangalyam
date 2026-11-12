import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { ceremonyLabel } from "@/lib/ceremonies";
import { EVENT_TYPE_LABELS } from "@/lib/events";
import { formatEventDate } from "@/lib/format";
import { accentFromManifest } from "@/lib/templates/registry";
import { resolveDesign } from "@/lib/templates/design-store";
import { COMPANY } from "@/lib/company";

export const alt = `${COMPANY.brand} invitation`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

/**
 * The renderer knows no fonts but its own fallback sans, so the invitation's
 * typefaces have to be handed to it as files. They live in /public because
 * that is the one asset folder the runtime image carries (see the Dockerfile),
 * and they are .woff because the renderer cannot read the .woff2 the site
 * itself serves.
 *
 * Read once per process: four small files, kept as a promise so concurrent
 * first requests share one read. A failed read falls back to no fonts rather
 * than failing the image — an off-brand preview still beats a broken one.
 */
type OgFont = { name: string; data: Buffer; weight: 400 | 500; style: "normal" | "italic" };

const FONT_FILES: { file: string; name: string; weight: 400 | 500; style: "normal" | "italic" }[] = [
  { file: "cormorant-garamond-latin-500-normal.woff", name: "Cormorant", weight: 500, style: "normal" },
  { file: "cormorant-garamond-latin-500-italic.woff", name: "Cormorant", weight: 500, style: "italic" },
  { file: "jost-latin-400-normal.woff", name: "Jost", weight: 400, style: "normal" },
  { file: "jost-latin-500-normal.woff", name: "Jost", weight: 500, style: "normal" },
];

let fontsPromise: Promise<OgFont[]> | null = null;

function loadFonts(): Promise<OgFont[]> {
  fontsPromise ??= Promise.all(
    FONT_FILES.map(async ({ file, ...font }) => ({
      ...font,
      data: await readFile(path.join(process.cwd(), "public", "og-fonts", file)),
    })),
  ).catch((err) => {
    console.error("Preview image fonts could not be read:", err);
    fontsPromise = null;
    return [];
  });
  return fontsPromise;
}

/** Long names step down in size instead of running off the card. */
function nameSize(text: string): number {
  if (text.length <= 16) return 112;
  if (text.length <= 24) return 92;
  if (text.length <= 34) return 72;
  return 58;
}

/**
 * The WhatsApp preview card. This is the first thing most guests see of the
 * invitation, so it carries the hosts, the ceremony and the date rather than
 * a bare link — set in the invitation's own typefaces and colours, so the card
 * in the chat looks like the thing it opens.
 *
 * Deliberately typographic: the cover photograph lives on object storage that
 * the renderer may not be able to reach, and a preview that sometimes fails to
 * build is worse than one that always looks composed.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fonts = await loadFonts();

  const row = await db.invitation.findFirst({
    where: { slug, status: "published" },
    include: { event: true },
  });

  if (!row) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%", height: "100%", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "#190409", color: "#EBD79B", fontSize: 64,
            fontFamily: "Cormorant", letterSpacing: 6,
          }}
        >
          {COMPANY.wordmark}
        </div>
      ),
      { ...size, fonts },
    );
  }

  // Through the design store, not the coded registry: a design added from the
  // admin screen exists only in the database, and its invitations deserve
  // their own colours on the card too.
  const design = await resolveDesign(row.templateId);
  const accent = accentFromManifest(design, row.ceremonyType, row.accentKey);
  const tokens = design.tokens;
  const label = row.ceremonyType
    ? ceremonyLabel(row.ceremonyType, row.customCeremonyName)
    : EVENT_TYPE_LABELS[row.event.eventType];
  const names = row.event.hostNames;
  const date = row.date ? formatEventDate(row.date.toISOString().slice(0, 10)) : null;

  const rule = (width: number) => (
    <div style={{ width, height: 2, flexShrink: 0, background: tokens.gold, opacity: 0.7, display: "flex" }} />
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex",
          background: accent, padding: 26,
        }}
      >
        {/* The card itself, sitting on a mat of the ceremony's colour with a
            hairline of gold just inside its edge — a printed invitation's
            border, at the size a chat thumbnail can still show. */}
        <div
          style={{
            flex: 1, display: "flex", background: tokens.surface, padding: 14,
          }}
        >
          <div
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center",
              border: `1.5px solid ${tokens.gold}`, padding: "0 70px",
              color: tokens.ink,
            }}
          >
            <div
              style={{
                display: "flex", fontFamily: "Jost", fontWeight: 500, fontSize: 23,
                letterSpacing: 12, textTransform: "uppercase", color: tokens.inkMuted,
              }}
            >
              {label}
            </div>

            <div
              style={{
                display: "flex", fontFamily: "Cormorant", fontWeight: 500,
                fontSize: nameSize(names), lineHeight: 1.08, color: tokens.brandDeep,
                marginTop: 26,
              }}
            >
              {names}
            </div>

            <div style={{ display: "flex", alignItems: "center", marginTop: 34 }}>
              {rule(90)}
              <div
                style={{
                  width: 9, height: 9, background: tokens.gold, margin: "0 16px",
                  transform: "rotate(45deg)", display: "flex",
                }}
              />
              {rule(90)}
            </div>

            {date && (
              <div
                style={{
                  display: "flex", fontFamily: "Jost", fontWeight: 400, fontSize: 32,
                  letterSpacing: 1.5, marginTop: 32,
                }}
              >
                {date}
              </div>
            )}

            {row.venueName && (
              <div
                style={{
                  display: "flex", fontFamily: "Cormorant", fontStyle: "italic",
                  fontWeight: 500, fontSize: 30, color: tokens.inkMuted, marginTop: 10,
                }}
              >
                {row.venueName}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
