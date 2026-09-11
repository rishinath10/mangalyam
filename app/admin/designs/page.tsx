import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { TEMPLATE_MANIFESTS } from "@/lib/templates/registry";
import { allCustomDesigns } from "@/lib/templates/design-store";
import { ButtonLink } from "@/components/ui/Button";
import { ART_BLURB, ART_COLUMN, ART_PIECES } from "@/lib/templates/art-store";
import { DesignArt } from "@/components/admin/DesignArt";

export const dynamic = "force-dynamic";

/**
 * Designs, in two halves.
 *
 * The families that ship with the product keep their palettes and type scales
 * in lib/templates/registry.ts, where they can be read next to each other —
 * this screen only swaps their artwork, which is the part that genuinely
 * wants a form.
 *
 * A design the operator made themselves is the other half, and the argument
 * for keeping colours in code does not reach it: there is no reviewed file
 * for a card somebody drew in Canva last night, and asking them to open a
 * pull request to change its gold would mean the design never gets added at
 * all. So those carry their own palette in the database, and this page links
 * to where they are made.
 */
export default async function AdminDesigns() {
  await requireAdmin();
  const [rows, custom] = await Promise.all([
    db.templateArt.findMany(),
    allCustomDesigns(),
  ]);
  const byId = new Map(rows.map((r) => [r.templateId, r]));

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Designs</h1>
          <p className="muted">
            Artwork takes effect immediately, on every invitation using that
            design — including ones already published.
          </p>
        </div>
        <ButtonLink href="/admin/designs/new">Add a design</ButtonLink>
      </div>

      <section style={{ marginBottom: "2.2rem" }}>
        <h2 className="kick" style={{ marginBottom: ".9rem" }}>Your designs</h2>
        {custom.length === 0 ? (
          <div className="t empty" style={{ padding: "1.6rem" }}>
            <p className="muted" style={{ margin: 0 }}>
              Nothing yet. A design you made elsewhere — in Canva, or by a
              designer — goes in here as its artwork, with the names printed
              live over the middle.
            </p>
          </div>
        ) : (
          <div className="bento">
            {custom.map((design) => (
              <Link
                key={design.templateId}
                href={`/admin/designs/${design.templateId}`}
                className="t t--lift c4"
              >
                <p className="kick">{design.built ? "Live" : "Not offered yet"}</p>
                <h3 style={{ fontSize: "var(--t-md)", marginTop: ".4rem" }}>{design.name}</h3>
                <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".5rem" }}>
                  {design.tagline}
                </p>
                <span className="swatch-row" style={{ marginTop: ".9rem", display: "flex", gap: 5 }}>
                  {design.accents.slice(0, 6).map((a) => (
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
              </Link>
            ))}
          </div>
        )}
      </section>

      <h2 className="kick" style={{ marginBottom: ".9rem" }}>Built in</h2>

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
        Sizes and generation prompts for artwork are in{" "}
        <span className="mono">docs/TEMPLATE-ART.md</span>.{" "}
        <Link href="/admin">Back to the overview</Link>
      </p>
    </div>
  );
}
