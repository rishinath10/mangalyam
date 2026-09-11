import "server-only";
import sharp from "sharp";

/**
 * Reading a starting palette out of a piece of artwork.
 *
 * Somebody who has just uploaded a card they designed does not want to sit and
 * type ten hex codes that are already sitting in the image. This samples the
 * artwork and proposes the set; every value stays editable, because a sampler
 * cannot know which of three golds is the one the design is *about*.
 *
 * Deliberately not clever. A k-means over a whole image is a better clustering
 * and a worse suggestion: the colours that matter on an invitation border are
 * the saturated ones covering a small area, and an honest average buries them
 * in whatever fills the background.
 */

export interface SampledPalette {
  tokens: {
    surface: string;
    surfaceAlt: string;
    ink: string;
    inkMuted: string;
    rule: string;
    brand: string;
    brandDeep: string;
    gold: string;
    radius: string;
    motionIntensity: number;
  };
  /** Distinct, saturated colours, strongest first. */
  accents: { name: string; hex: string }[];
}

type Rgb = { r: number; g: number; b: number };

const hex = ({ r, g, b }: Rgb) =>
  `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;

const luma = ({ r, g, b }: Rgb) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

function saturation({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function hue({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  const h =
    max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return ((h * 60) % 360 + 360) % 360;
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => ({
  r: a.r + (b.r - a.r) * t,
  g: a.g + (b.g - a.g) * t,
  b: a.b + (b.b - a.b) * t,
});

/** Names for the suggestion only; the operator renames anything they keep. */
function nameFor(c: Rgb): string {
  const h = hue(c);
  if (saturation(c) < 0.16) return luma(c) > 0.6 ? "Stone" : "Charcoal";
  if (h < 18 || h >= 342) return "Vermilion";
  if (h < 45) return luma(c) > 0.55 ? "Gold" : "Copper";
  if (h < 70) return "Turmeric";
  if (h < 160) return "Leaf";
  if (h < 200) return "Teal";
  if (h < 250) return "Indigo";
  if (h < 300) return "Amethyst";
  return "Rose";
}

/**
 * Reads the opaque pixels of one image into weighted colour buckets.
 *
 * Transparency is skipped rather than flattened. A frame is mostly empty by
 * design — that is the rule the whole template system is built on — and
 * painting its clear centre white first means the commonest colour in a
 * border is "nothing", which then decides what the paper and the hairlines
 * are. Reading only what was actually drawn is the difference between
 * sampling a card and sampling its hole.
 */
async function bucketsOf(url: string, size: number) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not read the artwork (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const { data, info } = await sharp(buffer)
    .resize(size, size, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map<string, { c: Rgb; n: number }>();
  for (let i = 0; i < data.length; i += info.channels) {
    // Anti-aliased edges are half the ink in a fine border; anything mostly
    // opaque counts, anything mostly not is the empty middle.
    if (data[i + 3] < 200) continue;
    const c = { r: data[i], g: data[i + 1], b: data[i + 2] };
    const key = [c.r, c.g, c.b].map((v) => Math.round(v / 20)).join(",");
    const hit = buckets.get(key);
    if (hit) {
      hit.n += 1;
      hit.c = mix(hit.c, c, 1 / hit.n);
    } else {
      buckets.set(key, { c, n: 1 });
    }
  }
  return [...buckets.values()];
}

/**
 * Samples a design's artwork and proposes its colours.
 *
 * Each piece is read for what it can actually answer. The border carries a
 * card's identity, so the accents come from there; the background texture is
 * the only piece that knows what colour the paper is. Text colour comes from
 * neither — artwork almost never contains the ink, and guessing it from the
 * darkest thing in a border is how a card ends up with bottle-green body
 * text. A readable dark in the design's own hue is the honest suggestion.
 *
 * Everything here is a starting point the operator edits. A sampler cannot
 * know which of three golds the design is *about*.
 */
export async function samplePalette(sources: {
  frame?: string | null;
  ground?: string | null;
  crest?: string | null;
  divider?: string | null;
}): Promise<SampledPalette> {
  // Ornament first: the border, then the crest, then the rule. The ground is
  // read separately — a texture is a field of one colour and would swamp
  // everything drawn on top of it.
  const ornament = [sources.frame, sources.crest, sources.divider].filter(
    (u): u is string => Boolean(u),
  );
  const readable = ornament.length ? ornament : [sources.ground].filter((u): u is string => Boolean(u));
  if (!readable.length) throw new Error("No artwork to read");

  const groups = await Promise.all(readable.map((url) => bucketsOf(url, 220)));
  const all = groups.flat().sort((a, b) => b.n - a.n);

  const white: Rgb = { r: 255, g: 255, b: 255 };
  const black: Rgb = { r: 0, g: 0, b: 0 };

  /**
   * Accents, ranked by how much of the artwork they actually cover.
   *
   * Coverage is weighted by its square root rather than its logarithm: a gold
   * that draws every rule and sixty dots is the colour of the card, and a log
   * flattens it to within a hair of four small green leaves. Then near-hues
   * are thinned, because six almost-identical golds is not a palette.
   */
  const candidates = all
    .filter((b) => saturation(b.c) > 0.18 && luma(b.c) > 0.06 && luma(b.c) < 0.9)
    .map((b) => ({ c: b.c, score: (0.35 + saturation(b.c)) * Math.sqrt(b.n) }))
    .sort((a, b) => b.score - a.score);

  const accents: Rgb[] = [];
  for (const { c } of candidates) {
    const tooClose = accents.some((a) => {
      const dh = Math.abs(hue(a) - hue(c));
      return Math.min(dh, 360 - dh) < 26;
    });
    if (!tooClose) accents.push(c);
    if (accents.length === 5) break;
  }
  if (accents.length === 0) accents.push({ r: 138, g: 107, b: 20 });

  const brand = accents[0];
  const warm = accents.find((c) => {
    const h = hue(c);
    return h >= 20 && h <= 62 && saturation(c) > 0.28;
  });

  /**
   * The paper. Only the background texture can answer this: a border is
   * transparent where the paper would be. With no ground uploaded, a warm
   * off-white pulled a long way towards the design's own colour beats a flat
   * white, which is the one shade that always reads as a web page.
   */
  let paper: Rgb = mix(white, brand, 0.04);
  if (sources.ground) {
    const groundBuckets = await bucketsOf(sources.ground, 120);
    const pale = groundBuckets
      .filter((b) => luma(b.c) > 0.7)
      .sort((a, b) => b.n - a.n)[0];
    if (pale) paper = pale.c;
  }

  // A dark that is readable by construction rather than by luck, tinted
  // towards the design so it does not read as a different card's text.
  const ink = mix({ r: 26, g: 22, b: 18 }, brand, 0.14);

  return {
    tokens: {
      surface: hex(mix(paper, white, 0.25)),
      surfaceAlt: hex(mix(paper, brand, 0.1)),
      ink: hex(ink),
      inkMuted: hex(mix(ink, paper, 0.45)),
      rule: hex(mix(paper, brand, 0.3)),
      brand: hex(brand),
      brandDeep: hex(mix(brand, black, 0.34)),
      gold: hex(warm ?? mix(brand, { r: 184, g: 145, b: 47 }, 0.6)),
      radius: "4px",
      motionIntensity: 0.95,
    },
    accents: accents.map((c) => ({ name: nameFor(c), hex: hex(c) })),
  };
}
