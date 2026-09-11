import Link from "next/link";
import { notFound as nextNotFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { ART_BLURB, ART_COLUMN, ART_PIECES } from "@/lib/templates/art-store";
import { customDesignToManifest } from "@/lib/templates/design-store";
import { DesignArt } from "@/components/admin/DesignArt";
import { DesignForm } from "@/components/admin/DesignForm";
import { DesignPublish } from "@/components/admin/DesignPublish";
import { DesignPreview } from "@/components/admin/DesignPreview";
import { isFontPairingKey } from "@/lib/templates/fonts";

export const dynamic = "force-dynamic";

/**
 * One custom design: its settings, its four pieces of artwork, a real preview,
 * and the switch that puts it in front of customers.
 *
 * The preview is the whole point of this page. Colours chosen against swatches
 * look nothing like colours seen behind a border at card size, and a design
 * that is only ever judged as eight hex fields reaches a customer wrong.
 */
export default async function CustomDesignPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  await requireAdmin();
  const { templateId } = await params;

  const [row, art, inUse] = await Promise.all([
    db.customDesign.findUnique({ where: { templateId } }),
    db.templateArt.findUnique({ where: { templateId } }),
    db.invitation.count({ where: { templateId } }),
  ]);
  if (!row) nextNotFound();

  const manifest = customDesignToManifest(row, art ?? undefined);
  const hasArt = ART_PIECES.some((piece) => art?.[ART_COLUMN[piece]]);

  return (
    <div className="wrap">
      <Link href="/admin/designs" className="crumb">← Designs</Link>
      <div className="page-head">
        <div>
          <h1>{row.name}</h1>
          <p className="muted">
            {row.tagline} · <span className="mono">{row.templateId}</span>
          </p>
        </div>
      </div>

      <DesignPublish
        templateId={row.templateId}
        published={row.published}
        hasArt={hasArt}
        inUse={inUse}
      />

      <section className="panel" style={{ marginTop: "1.6rem" }}>
        <div className="panel-head">
          <div>
            <h2>Artwork</h2>
            <p className="muted">
              The card itself. A design you made elsewhere goes in as the
              frame — 3:4, with the middle left empty for the names.
            </p>
          </div>
        </div>

        <p className="notice notice-bad" style={{ marginBottom: "1.4rem" }}>
          <b>No names, dates or venues in the artwork.</b> Those print as live
          text over the middle. Export your design with the text layers hidden —
          the empty centre is the point, not something to fix.
        </p>

        <div className="art-grid">
          {ART_PIECES.map((piece) => (
            <DesignArt
              key={piece}
              templateId={row.templateId}
              piece={piece}
              label={piece[0].toUpperCase() + piece.slice(1)}
              blurb={ART_BLURB[piece]}
              url={art?.[ART_COLUMN[piece]] ?? undefined}
              fromUpload={Boolean(art?.[ART_COLUMN[piece]])}
            />
          ))}
        </div>
      </section>

      {manifest && (
        <section className="panel" style={{ marginTop: "1.6rem" }}>
          <div className="panel-head">
            <div>
              <h2>How it looks</h2>
              <p className="muted">
                Sample names over your artwork, through the same renderer a
                guest gets.
              </p>
            </div>
          </div>
          <DesignPreview design={manifest} />
        </section>
      )}

      <section className="panel" style={{ marginTop: "1.6rem" }}>
        <div className="panel-head">
          <div>
            <h2>Settings</h2>
          </div>
        </div>
        <DesignForm
          templateId={row.templateId}
          canSample={hasArt}
          initial={{
            name: row.name,
            tagline: row.tagline,
            eventTypes: row.eventTypes,
            accents: manifest?.accents.map((a) => ({ name: a.name, hex: a.hex })) ?? [],
            fontPairing: isFontPairingKey(row.fontPairing) ? row.fontPairing : "classic",
            tokens: (manifest?.tokens ?? {}) as Record<string, string | number>,
            groundFit: row.groundFit === "cover" ? "cover" : "tile",
            groundVeil: row.groundVeil ?? 0.88,
          }}
        />
      </section>
    </div>
  );
}
