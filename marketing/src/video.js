/**
 * Assembles the promo videos.
 *
 *   node marketing/src/video.js <workDir>
 *
 * workDir holds what the other steps made: r-<scene>/ frame folders from
 * record.js, the mascot clips (wave.mp4 ...) and music.mp3. Each video is
 * intro (mascot) + one or more site recordings inside a framed window with a
 * caption + end card (mascot), with the music under it. A silent copy of each
 * is written too, for adding a trending track in the app.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const work = process.argv[2];
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "marketing/videos");
const font = (f) => "file://" + path.join(ROOT, "app/fonts", f);
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });

// The window the site recording plays in, on the 1080x1920 canvas.
const WIN = { x: 130, y: 330, w: 820, h: 1458 };

const CSS = `
@font-face{font-family:Cormorant;font-weight:400;src:url(${font("cormorant-garamond-latin-400-normal.woff2")})}
@font-face{font-family:Cormorant;font-weight:400;font-style:italic;src:url(${font("cormorant-garamond-latin-400-italic.woff2")})}
@font-face{font-family:Jost;font-weight:400;src:url(${font("jost-latin-400-normal.woff2")})}
@font-face{font-family:Jost;font-weight:500;src:url(${font("jost-latin-500-normal.woff2")})}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;background:transparent;font-family:Jost,sans-serif;color:#F3E9D8;text-align:center}
.cap{position:absolute;left:60px;right:60px;top:92px;height:210px;display:flex;flex-direction:column;justify-content:center}
.cap h1{font-family:Cormorant,serif;font-weight:400;font-size:70px;line-height:1.05;text-wrap:balance}
.cap h1 em{font-style:italic;color:#EBD79B}
.kick{font-size:27px;letter-spacing:.34em;text-transform:uppercase;color:#C9A227;font-weight:500;margin-bottom:14px}
.site{position:absolute;left:0;right:0;bottom:44px;font-size:30px;letter-spacing:.2em;color:#EBD79B}
.top{position:absolute;left:60px;right:60px;top:170px}
.wm{font-family:Cormorant,serif;font-size:104px;letter-spacing:.2em;padding-left:.2em}
.tg{font-size:27px;letter-spacing:.3em;text-transform:uppercase;color:#C9A227;margin-top:14px}
.bot{position:absolute;left:60px;right:60px;top:1560px}
.bot h1{font-family:Cormorant,serif;font-weight:400;font-size:78px;line-height:1.08}
.bot h1 em{font-style:italic;color:#EBD79B}
.pill{display:inline-block;margin-top:34px;font-size:36px;letter-spacing:.06em;color:#1A0A05;background:#C9A227;padding:16px 46px;border-radius:100px;font-weight:500}
`;

/** The wine canvas with a rounded hole for the recording, and a caption. */
const frameHtml = (kick, line) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<svg width="1080" height="1920" style="position:absolute;inset:0">
  <defs>
    <radialGradient id="a" cx="85%" cy="8%" r="70%"><stop offset="0" stop-color="#5a1830"/><stop offset="1" stop-color="#190409" stop-opacity="0"/></radialGradient>
    <mask id="m"><rect width="1080" height="1920" fill="#fff"/><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="56" fill="#000"/></mask>
  </defs>
  <g mask="url(#m)"><rect width="1080" height="1920" fill="#190409"/><rect width="1080" height="1920" fill="url(#a)"/></g>
  <rect x="${WIN.x - 5}" y="${WIN.y - 5}" width="${WIN.w + 10}" height="${WIN.h + 10}" rx="60" fill="none" stroke="#C9A227" stroke-opacity=".55" stroke-width="3"/>
</svg>
<div class="cap">${kick ? `<p class="kick">${kick}</p>` : ""}<h1>${line}</h1></div>
<p class="site">mangalyam.my</p></body></html>`;

const introHtml = (line) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="top"><p class="wm">Mangalyam</p><p class="tg">Celebrations that last a lifetime</p></div>
<div class="bot"><h1>${line}</h1></div></body></html>`;

const endHtml = (line) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="top"><p class="wm">Mangalyam</p><p class="tg">${line}</p></div>
<div class="bot"><h1>Free until <em>31 December 2026</em></h1><span class="pill">mangalyam.my</span></div></body></html>`;

/**
 * Each video: intro line, then parts (a recording, its caption, how many
 * seconds of it to use), then the end card.
 */
const VIDEOS = [
  { name: "1-the-opening", intro: "Vanakkam!", end: "Make yours tonight",
    parts: [{ rec: "opening", kick: "One tap", line: "This is how your guests <em>will open it</em>", secs: 11.5 }] },
  { name: "2-ten-designs", intro: "Which one is yours?", end: "Ten designs, painted",
    parts: [{ rec: "designs", kick: "Choose your card", line: "Ten designs. <em>Tap to try each.</em>", secs: 7 },
            { rec: "opening", kick: "Then open it", line: "Every one <em>opens like a card</em>", secs: 6 }] },
  { name: "3-how-it-works", intro: "Six questions. Send the link.", end: "It takes a few minutes",
    parts: [{ rec: "wizard", kick: "Step 1", line: "Tell us <em>who is celebrating</em>", secs: 6.2 },
            { rec: "designs", kick: "Step 2", line: "Pick <em>a design</em>", secs: 5 },
            { rec: "opening", kick: "Step 3", line: "Share it <em>on WhatsApp</em>", secs: 6 }] },
  { name: "4-free-until-31-dec", intro: "Our opening gift", end: "No card details asked",
    parts: [{ rec: "offer", full: true, secs: 4.3 },
            { rec: "opening", kick: "Yours to keep", line: "Make it in <em>a few minutes</em>", secs: 6 }] },
];

const INTRO_SECS = 2.4;
const END_SECS = 3.2;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = path.join(work, "build");
  fs.mkdirSync(tmp, { recursive: true });

  // Recordings: frame folders to plain 1080x1920 video, once each.
  for (const rec of ["opening", "wizard", "designs", "offer"]) {
    ff(["-f", "concat", "-i", path.join(work, `r-${rec}`, "frames.txt"),
      "-vf", "fps=30,scale=1080:-2,crop=1080:1920:0:0", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p",
      path.join(tmp, `${rec}.mp4`)]);
  }

  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
  const png = async (html, file) => {
    const h = path.join(tmp, "_o.html");
    fs.writeFileSync(h, html);
    await page.goto("file://" + h);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: file, omitBackground: true });
  };

  const enc = ["-r", "30", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-an"];

  for (const v of VIDEOS) {
    const segs = [];

    // Intro: the mascot clip with the name above him and a line below.
    const introPng = path.join(tmp, `${v.name}-intro.png`);
    await png(introHtml(v.intro), introPng);
    const intro = path.join(tmp, `${v.name}-s0.mp4`);
    ff(["-t", String(INTRO_SECS), "-i", path.join(work, "wave.mp4"), "-i", introPng,
      "-filter_complex", "[0:v]fps=30,scale=1080:1920[b];[b][1:v]overlay=0:0,fade=t=in:st=0:d=0.3", ...enc, intro]);
    segs.push(intro);

    for (const [i, p] of v.parts.entries()) {
      const seg = path.join(tmp, `${v.name}-s${i + 1}.mp4`);
      const src = path.join(tmp, `${p.rec}.mp4`);
      if (p.full) {
        ff(["-t", String(p.secs), "-i", src, "-vf", "fps=30", ...enc, seg]);
      } else {
        const framePng = path.join(tmp, `${v.name}-f${i}.png`);
        await png(frameHtml(p.kick, p.line), framePng);
        ff(["-f", "lavfi", "-t", String(p.secs), "-i", "color=c=0x190409:s=1080x1920:r=30",
          "-t", String(p.secs), "-i", src, "-i", framePng,
          "-filter_complex",
          `[1:v]fps=30,scale=${WIN.w}:${WIN.h}[r];[0:v][r]overlay=${WIN.x}:${WIN.y}[a];[a][2:v]overlay=0:0`,
          ...enc, seg]);
      }
      segs.push(seg);
    }

    // End card: the later part of the mascot clip, name, offer and address.
    const endPng = path.join(tmp, `${v.name}-end.png`);
    await png(endHtml(v.end), endPng);
    const end = path.join(tmp, `${v.name}-s9.mp4`);
    ff(["-ss", "1.7", "-t", String(END_SECS), "-i", path.join(work, "wave.mp4"), "-i", endPng,
      "-filter_complex", `[0:v]fps=30,scale=1080:1920[b];[b][1:v]overlay=0:0,fade=t=out:st=${END_SECS - 0.4}:d=0.4`, ...enc, end]);
    segs.push(end);

    const list = path.join(tmp, `${v.name}.txt`);
    fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join("\n") + "\n");
    const silent = path.join(OUT, `${v.name}-silent.mp4`);
    ff(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", silent]);

    const total = INTRO_SECS + END_SECS + v.parts.reduce((n, p) => n + p.secs, 0);
    ff(["-i", silent, "-i", path.join(work, "music.mp3"),
      "-filter_complex", `[1:a]atrim=0:${total},afade=t=in:d=0.3,afade=t=out:st=${(total - 1.2).toFixed(2)}:d=1.2,loudnorm=I=-16:TP=-1.5[a]`,
      "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart",
      path.join(OUT, `${v.name}.mp4`)]);
    console.log(v.name, total.toFixed(1) + "s");
  }
  await browser.close();
})();
