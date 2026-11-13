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
  className?: string;
}) {
  const [w, h] = MASCOT_POSES[pose];
  const width = Math.round((w / h) * height);

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

  return (
    <span
      className={`mascot ${className ?? ""}`}
      data-enter={enter}
      data-swap={swap ? "" : undefined}
      data-flip={flip || undefined}
      style={{ width, height }}
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
}
