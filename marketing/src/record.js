/**
 * Records the real site at phone size for the promo videos.
 *
 *   node marketing/src/record.js <scene> <outDir> [baseUrl]
 *
 * Frames come from Chromium's own screencast, so CSS animation is captured as
 * it plays. Each scene writes numbered JPEGs and an ffmpeg concat list that
 * carries the true time of every frame; assemble.sh turns that into video.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const [, , scene, outDir, base = "http://localhost:3311"] = process.argv;
const INVITE = "/i/ashwin-kalyani-muhurtham";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** A slow, human-looking scroll of `el` (or the page) by `dy` over `ms`. */
async function glide(page, dy, ms, selector) {
  await page.evaluate(
    ({ dy, ms, selector }) =>
      new Promise((done) => {
        const el = selector ? document.querySelector(selector) : document.scrollingElement;
        const from = el.scrollTop;
        const t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / ms);
          el.scrollTop = from + dy * (0.5 - Math.cos(Math.PI * k) / 2);
          if (k < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      }),
    { dy, ms, selector },
  );
}

/** Shows where a tap lands, since a recording has no finger in it. */
async function tap(page, selector) {
  const box = await (await page.waitForSelector(selector)).boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate(
    ({ x, y }) => {
      const d = document.createElement("div");
      d.style.cssText = `position:fixed;left:${x - 26}px;top:${y - 26}px;width:52px;height:52px;border-radius:50%;
        background:rgba(255,255,255,.55);box-shadow:0 0 0 2px rgba(201,162,39,.9);z-index:99999;pointer-events:none;
        transition:transform .45s ease,opacity .45s ease;transform:scale(.4);opacity:1`;
      document.body.appendChild(d);
      requestAnimationFrame(() => {
        d.style.transform = "scale(1.25)";
        d.style.opacity = "0";
      });
      setTimeout(() => d.remove(), 600);
    },
    { x, y },
  );
  await wait(260);
  await page.mouse.click(x, y);
}

const SCENES = {
  /** Tap the seal; the cover parts and the invitation drifts down by itself. */
  async opening(page) {
    await page.goto(base + INVITE, { waitUntil: "networkidle" });
    await wait(1200);
    return async () => {
      await wait(900);
      await tap(page, ".inv-seal");
      await wait(3800);
      // A wheel event is what tells the invitation a guest has taken over.
      // Wheel events, not scrollTop: they reach whichever element really
      // scrolls, and they tell the invitation a guest has taken over.
      await page.mouse.move(195, 400);
      const t0 = Date.now();
      while (Date.now() - t0 < 7000) {
        const k = (Date.now() - t0) / 7000;
        await page.mouse.wheel(0, 3 + 9 * Math.sin(Math.PI * k));
        await wait(16);
      }
      await wait(400);
    };
  },
  /** The first step of the wizard: choose the occasion, type the names. */
  async wizard(page) {
    await page.goto(base + "/create", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await wait(600);
    return async () => {
      await wait(500);
      await tap(page, ".occ-grid .occ");
      await wait(500);
      await glide(page, 560, 900);
      await page.click("#groomName");
      await page.keyboard.type("Ashwin", { delay: 90 });
      await page.click("#brideName");
      await page.keyboard.type("Kalyani", { delay: 90 });
      await wait(900);
    };
  },
  /** The design step: tap through a few designs. */
  async designs(page) {
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      const y = document.querySelector(".show-shelf").getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, y - 76);
    });
    await wait(2500);
    return async () => {
      for (const i of [1, 3, 5, 7]) {
        await page.evaluate((n) => document.querySelectorAll(".show-pick")[n].scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }), i);
        await wait(450);
        await tap(page, `.show-pick:nth-child(${i + 1})`);
        await wait(650);
      }
      await wait(400);
    };
  },
  /** A local animated page (the offer video), recorded for six seconds. */
  async offer(page) {
    const file = "file://" + path.resolve(__dirname, "offer.html");
    await page.goto("about:blank");
    return async () => {
      await page.goto(file);
      await wait(6000);
    };
  },
};

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 694 }, deviceScaleFactor: 2.77, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const act = await SCENES[scene](page);

  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (f) => {
    const name = `f${String(frames.length).padStart(5, "0")}.jpg`;
    frames.push({ name, t: f.metadata.timestamp });
    fs.writeFileSync(path.join(outDir, name), Buffer.from(f.data, "base64"));
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, everyNthFrame: 1 });
  await act();
  await cdp.send("Page.stopScreencast");
  await wait(300);

  const lines = ["ffconcat version 1.0"];
  frames.forEach((f, i) => {
    const next = frames[i + 1];
    lines.push(`file ${f.name}`, `duration ${(next ? next.t - f.t : 0.04).toFixed(4)}`);
  });
  fs.writeFileSync(path.join(outDir, "frames.txt"), lines.join("\n") + "\n");
  const secs = frames.length ? frames[frames.length - 1].t - frames[0].t : 0;
  console.log(scene, frames.length, "frames over", secs.toFixed(1), "s");
  await browser.close();
})();
