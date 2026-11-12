import type { TemplateArt } from "@/lib/templates/types";

/**
 * What drifts over the cover once it opens: petals falling for a daytime
 * design, sparks rising for a night one.
 *
 * Plain elements and one CSS animation each — no canvas, no per-frame script.
 * A guest's phone is doing enough already (decoding the painting, starting
 * the music), and a shower that stutters is worse than no shower. They play
 * through twice and stop; an animation that never ends is a battery drain on
 * a page someone leaves open on the table.
 *
 * Every position below is derived from the index, not Math.random, so the
 * server and the browser lay out the same shower and hydration has nothing to
 * disagree about.
 */
const COUNT = 16;

/**
 * A cheap repeatable scatter: the fractional part of a sine, rounded.
 *
 * The rounding is not cosmetic. Node and a phone's browser can disagree about
 * the last bits of Math.sin, and multiplying by forty thousand turns that into
 * a different number entirely — which React then reports as a hydration
 * mismatch on every petal. Two decimals is far coarser than any disagreement.
 */
function scatter(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43.75;
  return Math.round((x - Math.floor(x)) * 100) / 100;
}

const px = (n: number) => Math.round(n * 10) / 10;

export function Particles({ particles }: { particles: NonNullable<TemplateArt["particles"]> }) {
  const { kind, colors } = particles;
  if (colors.length === 0) return null;

  return (
    <div className="art-particles" data-kind={kind} aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => {
        const size = px(kind === "sparks" ? 3 + scatter(i, 1) * 4 : 9 + scatter(i, 1) * 9);
        return (
          <span
            key={i}
            style={
              {
                left: `${px(4 + scatter(i, 2) * 92)}%`,
                width: size,
                height: kind === "sparks" ? size : px(size * 1.25),
                background: colors[i % colors.length],
                "--drift": `${px((scatter(i, 3) - 0.5) * 90)}px`,
                "--spin": `${Math.round(200 + scatter(i, 4) * 420)}deg`,
                "--dur": `${px(5.5 + scatter(i, 5) * 4.5)}s`,
                "--delay": `${px(0.5 + scatter(i, 6) * 3.4)}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
