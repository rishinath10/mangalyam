import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { TEMPLATE_MANIFESTS } from "@/lib/templates/registry";
import { ART_BLURB, ART_COLUMN, ART_PIECES } from "@/lib/templates/art-store";
import { DesignArt } from "@/components/admin/DesignArt";

export const dynamic = "force-dynamic";

/**
 * Swapping a family's artwork without a deploy.
 *
 * Only the artwork. A family's palette, type scale and section order stay in
 * lib/templates/registry.ts: those are design decisions that want to be read
 * next to each other, and picking six accent hexes through a web form is worse
 * than picking them in code. What genuinely wants a screen is replacing a
 * border with a better one, which is what this does.
 */
export default async function AdminDesigns() {
  await requireAdmin();
  const rows = await db.templateArt.findMany();
  const byId = new Map(rows.map((r) => [r.templateId, r]));

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Designs</h1>
          <p className="muted">
            Artwork for the drawn families. Uploads take effect immediately, on
            every invitation using that design — including ones already
            published.
          </p>
        </div>
      </div>

      <p className="notice notice-bad" style={{ marginBottom: "1.6rem" }}>
        <b>Never upload artwork with names or dates in it.</b> The couple&rsquo;s
        names print as live text over the middle. Art with words baked in
        replaces every customer&rsquo;s invitation with somebody else&rsquo;s.
        Every piece needs a clear centre — the checkerboard shows you where it
        is transparent.
      </p>

      {TEMPLATE_MANIFESTS.map((manifest) => {
        const row = byId.get(manifest.templateId);
        const drawn = Boolean(manifest.art) || Boolean(row);

        return (
          <section className="panel" key={manifest.templateId} style={{ marginBottom: "1.6rem" }}>
            <div className="panel-head">
              <div>
                <h2>{manifest.name}</h2>
                <p className="muted">
                  {manifest.tagline} · <span className="mono">{manifest.templateId}</span>
                </p>
              </div>
              <div className="r">
                <span className="swatch-row">
                  {manifest.accents.map((a) => (
                    <i
                      key={a.key}
                      title={a.name}
                      style={{
                        background: a.hex,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        display: "inline-block",
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>

            {!drawn && (
              <p className="dim" style={{ fontSize: "var(--t-sm)", marginBottom: "1rem" }}>
                This family is drawn in code rather than from artwork. Uploading a
                piece here switches it to the artwork renderer, which is a real
                change to how it looks — try it on a draft first.
              </p>
            )}

            <div className="art-grid">
              {ART_PIECES.map((piece) => {
                const uploaded = row?.[ART_COLUMN[piece]] ?? null;
                return (
                  <DesignArt
                    key={piece}
                    templateId={manifest.templateId}
                    piece={piece}
                    label={piece[0].toUpperCase() + piece.slice(1)}
                    blurb={ART_BLURB[piece]}
                    url={uploaded ?? manifest.art?.[piece]}
                    fromUpload={Boolean(uploaded)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="dim" style={{ fontSize: "var(--t-sm)" }}>
        Prompts and sizes for producing artwork are in{" "}
        <span className="mono">docs/TEMPLATE-ART.md</span>. To add a whole new
        family — its own palette and type — copy a block in{" "}
        <span className="mono">lib/templates/registry.ts</span>, then upload its
        art here.{" "}
        <Link href="/admin">Back to the overview</Link>
      </p>
    </div>
  );
}
