/* eslint-disable @next/next/no-img-element */

/**
 * Little Aiyer, the site's mascot, in one of his poses.
 *
 * He is a set of still pictures and some CSS — no script, so he can be dropped
 * into a server-rendered page for free. Every pose breathes with a slow bob;
 * `swap` stacks a second pose over the first and fades between the two, which
 * is how a wave or a cheer is suggested without a frame of video. Under
 * reduced motion he simply stands there.
 *
 * Decorative by default: he repeats what the words beside him already say, so
 * a screen reader is not made to announce him on every page. Pass `label`
 * only where he is the only thing saying it.
 */
export const MASCOT_POSES = {
  namaste: [318, 720],
  wave: [346, 720],
  point: [318, 720],
  think: [318, 720],
  cheer: [447, 720],
  card: [318, 720],
  walk: [350, 720],
  peek: [402, 520],
  sorry: [412, 720],
  sleep: [376, 520],
} as const;

export type MascotPose = keyof typeof MASCOT_POSES;

export function Mascot({
  pose,
  swap,
  height = 220,
  enter = "pop",
  flip = false,
  label,
  say,
  side = "right",
  className,
}: {
  pose: MascotPose;
  /** A second pose to alternate with, for a gesture. */
  swap?: MascotPose;
  /** Rendered height in CSS pixels; the width follows the pose. */
  height?: number;
  /** How he arrives. "none" for places that animate him themselves. */
  enter?: "pop" | "rise" | "none";
  /** Mirror him, so a pointing pose can point the other way. */
  flip?: boolean;
  label?: string;
  /**
   * Something for him to say, in a bubble beside him. This is real text, read
   * out like any other, so use it for a hint the page does not already give.
   */
  say?: string;
  /** Which side of him the bubble sits on. */
  side?: "left" | "right";
  className?: string;
}) {
  const [w, h] = MASCOT_POSES[pose];

  const img = (name: MascotPose, layer: "a" | "b") => {
    const [pw, ph] = MASCOT_POSES[name];
    return (
      <img
        className={`mascot-img mascot-${layer}`}
        src={`/mascot/${name}.webp`}
        alt=""
        width={pw}
        height={ph}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );
  };

  const figure = (
    <span
      className={`mascot ${say ? "" : (className ?? "")}`}
      data-enter={enter}
      data-swap={swap ? "" : undefined}
      data-flip={flip || undefined}
      // --ms lets a page scale him for a narrow screen without a second prop.
      style={{ "--mh": `${height}px`, aspectRatio: `${w} / ${h}` } as React.CSSProperties}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="mascot-in">
        {img(pose, "a")}
        {swap && img(swap, "b")}
      </span>
    </span>
  );

  if (!say) return figure;
  return (
    <span className={`guide ${className ?? ""}`} data-side={side}>
      {figure}
      <span className="guide-say">{say}</span>
    </span>
  );
}
