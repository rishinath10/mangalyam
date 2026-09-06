import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { ceremonyLabel } from "@/lib/ceremonies";
import { formatEventDate } from "@/lib/format";
import { resolveAccentColor } from "@/lib/templates/registry";
import { DESIGN_SYSTEMS } from "@/lib/templates/design-systems";
import { getManifest } from "@/lib/templates/registry";

export const alt = "Wedding invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The WhatsApp preview card. This is the first thing most guests see of the
 * invitation, so it carries the couple, the ceremony and the date rather than
 * a bare link — and it is generated per invitation so every ceremony previews
 * in its own colour.
 *
 * Deliberately typographic: the cover photograph lives on object storage that
 * the edge renderer may not be able to reach, and a preview that sometimes
 * fails to build is worse than one that always looks composed.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const row = await db.invitation.findFirst({
    where: { slug, status: "published" },
    include: { wedding: true },
  });

  if (!row) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%", height: "100%", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "#190409", color: "#EBD79B", fontSize: 48,
          }}
        >
          Mangalyam
        </div>
      ),
      size,
    );
  }

  const accent = resolveAccentColor(row.templateId, row.ceremonyType, row.accentColorOverride);
  const tokens = DESIGN_SYSTEMS[getManifest(row.templateId).designSystem];
  const label = ceremonyLabel(row.ceremonyType, row.customCeremonyName);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
          background: tokens.surface, color: tokens.ink, padding: 72,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, background: accent }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 14, background: accent }} />

        <div style={{ fontSize: 24, letterSpacing: 14, textTransform: "uppercase", color: tokens.inkMuted, display: "flex" }}>
          {label}
        </div>

        <div style={{ fontSize: 96, color: tokens.brandDeep, marginTop: 28, display: "flex" }}>
          {row.wedding.coupleName1} &amp; {row.wedding.coupleName2}
        </div>

        {row.date && (
          <div style={{ fontSize: 34, color: tokens.ink, marginTop: 30, display: "flex" }}>
            {formatEventDate(row.date.toISOString().slice(0, 10))}
          </div>
        )}

        {row.venueName && (
          <div style={{ fontSize: 26, color: tokens.inkMuted, marginTop: 12, display: "flex" }}>
            {row.venueName}
          </div>
        )}
      </div>
    ),
    size,
  );
}
