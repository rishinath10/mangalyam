import type { TemplateManifest } from "@/lib/templates/types";

/**
 * How a design shows itself. The variety is layout, frame and typesetting —
 * flat and abstract — never a drawing of an object, which is what made earlier
 * attempts read as clip-art.
 */
function Deco({ variant }: { variant: TemplateManifest["silk"]["deco"] }) {
  if (variant === "korvai") {
    return (
      <svg
        className="deco"
        viewBox="0 0 300 20"
        preserveAspectRatio="none"
        fill="currentColor"
        aria-hidden="true"
        style={{ inset: "auto 0 0", height: 20, color: "rgba(255,246,226,.62)" }}
      >
        <rect y="15" width="300" height="1.3" />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M${i * 10} 15 ${i * 10 + 5} 5 ${i * 10 + 10} 15Z`} />
        ))}
      </svg>
    );
  }
  return <span className={`deco deco-${variant}`} />;
}

export function DesignCard({
  design,
  coupleLine,
  ceremonyLabel,
  big = false,
}: {
  design: TemplateManifest;
  coupleLine: string;
  ceremonyLabel: string;
  big?: boolean;
}) {
  return (
    <span
      className={`dsn silk ${big ? "dsn--big" : ""}`}
      style={
        {
          "--silk": design.silk.field,
          backgroundImage: design.silk.gradient,
        } as React.CSSProperties
      }
      data-deco={design.silk.deco}
    >
      <Deco variant={design.silk.deco} />
      <span className="scrim" />
      <span className="lab">
        <span className="ct">{ceremonyLabel}</span>
        <span className="cn">{coupleLine}</span>
      </span>
      {!design.built && <span className="soon">Coming soon</span>}
    </span>
  );
}
