// Turns artwork painted on a flat white (or black) field into a transparent
// overlay, so one painting sits on any design's own paper colour.
//
//   node scripts/prepare-art.mjs <in.png> <out.webp> [--width 1080] [--from white|black] [--quality 84]
//   node scripts/prepare-art.mjs <in.png> <out.webp> --tint "#FBF4E6" [--crop-top 0.3]
//   node scripts/prepare-art.mjs <in.png> <out.webp> --trim --width 720
//
// --tint is for the large cover scene. It keeps the image opaque and stains
// the white field to the design's paper colour instead (a multiply, which is
// what paint on tinted paper is). A full-screen image with a soft alpha
// channel is around half a megabyte; the same image opaque is a third of
// that, and it is the first thing a guest downloads on mobile data.
//
// This is colour-to-alpha, not background removal: each pixel's opacity is how
// far it is from the field colour, and its colour is un-mixed from the field.
// A watercolour wash therefore stays a wash — soft edges remain soft instead
// of being cut to a hard outline with a pale halo, which is what a matting
// model does to exactly this kind of art.
import sharp from "sharp";

const [input, output, ...rest] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: prepare-art.mjs <in> <out.webp> [--width n] [--from white|black] [--quality n]");
  process.exit(1);
}
const flag = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? fallback : rest[i + 1];
};
const width = Number(flag("width", 1080));
const from = flag("from", "white");
const quality = Number(flag("quality", 84));
// Generated "white" is rarely 255: anything this close to the field counts as
// the field, or the whole image keeps a faint grey veil.
const floor = Number(flag("floor", 10));

// --trim crops an ornament to its own edges, so it can be sized by its drawn
// width rather than by however much blank field came with it. --crop-top drops
// that fraction off the top first, for a footer painted low in a tall frame.
let source = sharp(input);
const cropTop = Number(flag("crop-top", 0));
if (cropTop > 0) {
  const meta = await sharp(input).metadata();
  const top = Math.round(meta.height * cropTop);
  source = sharp(await source.extract({ left: 0, top, width: meta.width, height: meta.height - top }).toBuffer());
}
if (rest.includes("--trim")) {
  source = sharp(await source.trim({ background: from === "black" ? "#000000" : "#ffffff", threshold: 14 }).toBuffer());
}

const { data, info } = await source
  .resize({ width, withoutEnlargement: true })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const tint = flag("tint", null);
if (tint) {
  const t = [1, 3, 5].map((i) => parseInt(tint.slice(i, i + 2), 16));
  const stained = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    // lift near-white to true white first, so the field lands exactly on the
    // paper colour and the image has no visible edge against the page
    const c = Math.min(255, (data[i] * 255) / (255 - floor));
    stained[i] = Math.round((c * t[i % 3]) / 255);
  }
  await sharp(stained, { raw: { width: info.width, height: info.height, channels: 3 } })
    .webp({ quality, effort: 6 })
    .toFile(output);
  const fs = await import("node:fs");
  console.log(`${output}  ${info.width}x${info.height}  ${(fs.statSync(output).size / 1024).toFixed(0)}KB  (tinted ${tint})`);
  process.exit(0);
}

const out = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
  let r = data[i], g = data[i + 1], b = data[i + 2];
  if (from === "black") { r = 255 - r; g = 255 - g; b = 255 - b; }
  // distance from white, per channel; the furthest channel sets the opacity
  let a = Math.max(255 - r, 255 - g, 255 - b);
  a = a <= floor ? 0 : Math.min(255, ((a - floor) * 255) / (255 - floor));
  if (a === 0) { out[o + 3] = 0; continue; }
  const k = a / 255;
  // un-mix the field: c = field*(1-k) + colour*k  →  colour = (c - 255(1-k)) / k
  let cr = Math.round((r - 255 * (1 - k)) / k);
  let cg = Math.round((g - 255 * (1 - k)) / k);
  let cb = Math.round((b - 255 * (1 - k)) / k);
  cr = Math.max(0, Math.min(255, cr)); cg = Math.max(0, Math.min(255, cg)); cb = Math.max(0, Math.min(255, cb));
  if (from === "black") { cr = 255 - cr; cg = 255 - cg; cb = 255 - cb; }
  out[o] = cr; out[o + 1] = cg; out[o + 2] = cb; out[o + 3] = Math.round(a);
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .webp({ quality, alphaQuality: 90, effort: 6 })
  .toFile(output);
const { size } = await import("node:fs").then((fs) => fs.statSync(output));
console.log(`${output}  ${info.width}x${info.height}  ${(size / 1024).toFixed(0)}KB`);
