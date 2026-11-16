/**
 * Makes a 1080x1920 start frame for an animated mascot clip: the mascot on the
 * site's wine background.
 *
 *   node marketing/src/frame.js <cutout.png> <out.png>
 */
const sharp = require("sharp");

const [, , src, out] = process.argv;

(async () => {
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <defs>
        <radialGradient id="a" cx="85%" cy="8%" r="70%"><stop offset="0" stop-color="#5a1830"/><stop offset="1" stop-color="#190409" stop-opacity="0"/></radialGradient>
        <radialGradient id="b" cx="10%" cy="100%" r="70%"><stop offset="0" stop-color="#4a3210"/><stop offset="1" stop-color="#190409" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="#190409"/>
      <rect width="1080" height="1920" fill="url(#a)"/>
      <rect width="1080" height="1920" fill="url(#b)"/>
      <ellipse cx="540" cy="1500" rx="300" ry="38" fill="#000" opacity=".35"/>
    </svg>`,
  );
  const who = await sharp(src).trim().resize({ height: 1050 }).toBuffer();
  const meta = await sharp(who).metadata();
  await sharp(bg)
    .composite([{ input: who, left: Math.round((1080 - meta.width) / 2), top: 1500 - meta.height + 10 }])
    .png()
    .toFile(out);
  console.log("wrote", out);
})();
