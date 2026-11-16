/**
 * Builds every marketing image from the site's own art.
 *
 *   node marketing/src/build.js
 *
 * Covers in marketing/src/covers are screenshots of the real designs, the
 * mascot comes from public/mascot and the lettering from app/fonts, so a post
 * can never show something the product does not look like. Edit the POSTS
 * list below and run again to change the words.
 */
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../..");
const url = (p) => "file://" + path.join(ROOT, p);
const cover = (n) => url(`marketing/src/covers/${n}.png`);
const mascot = (n) => url(`public/mascot/${n}.webp`);

const CSS = `
@font-face{font-family:Cormorant;font-weight:400;src:url(${url("app/fonts/cormorant-garamond-latin-400-normal.woff2")})}
@font-face{font-family:Cormorant;font-weight:500;src:url(${url("app/fonts/cormorant-garamond-latin-500-normal.woff2")})}
@font-face{font-family:Cormorant;font-weight:400;font-style:italic;src:url(${url("app/fonts/cormorant-garamond-latin-400-italic.woff2")})}
@font-face{font-family:Jost;font-weight:300;src:url(${url("app/fonts/jost-latin-300-normal.woff2")})}
@font-face{font-family:Jost;font-weight:400;src:url(${url("app/fonts/jost-latin-400-normal.woff2")})}
@font-face{font-family:Jost;font-weight:500;src:url(${url("app/fonts/jost-latin-500-normal.woff2")})}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{
  font-family:Jost,sans-serif;color:#F3E9D8;position:relative;overflow:hidden;
  background:
    radial-gradient(900px 700px at 85% 8%,rgba(120,30,60,.55),transparent 70%),
    radial-gradient(900px 800px at 10% 100%,rgba(150,95,20,.28),transparent 70%),
    #190409;
  padding:84px 80px 150px;display:flex;flex-direction:column;
}
body.cream{
  color:#3A1D10;
  background:radial-gradient(900px 700px at 80% 0%,#FFF,transparent 70%),#FBF4E6;
}
.kick{font-size:26px;letter-spacing:.34em;text-transform:uppercase;color:#C9A227;font-weight:500}
h1{font-family:Cormorant,serif;font-weight:400;font-size:104px;line-height:1.02;margin-top:26px;letter-spacing:-.01em}
h1 em{font-style:italic;color:#EBD79B;display:block}
body.cream h1 em{color:#9A6B0E}
.lede{font-size:36px;line-height:1.45;font-weight:300;margin-top:30px;max-width:22em;opacity:.9}
.foot{
  position:absolute;left:80px;right:80px;bottom:62px;display:flex;align-items:center;justify-content:space-between;
  border-top:1px solid rgba(235,215,155,.28);padding-top:26px;
}
body.cream .foot{border-color:rgba(60,30,10,.18)}
.wm{font-family:Cormorant,serif;font-size:40px;letter-spacing:.24em}
.site{font-size:28px;letter-spacing:.08em;color:#1A0A05;background:#C9A227;padding:12px 30px;border-radius:100px;font-weight:500}
.art{flex:1;position:relative;margin-top:36px;min-height:0}
.card{position:absolute;border-radius:46px;box-shadow:0 0 0 2px rgba(255,255,255,.14),0 50px 80px -30px rgba(0,0,0,.9);height:auto}
body.cream .card{box-shadow:0 0 0 1px rgba(60,30,10,.12),0 40px 70px -34px rgba(60,30,10,.55)}
.who{position:absolute;filter:drop-shadow(0 24px 22px rgba(0,0,0,.4))}
/* fan of three */
.fan .card{width:330px;top:50%;left:50%}
.fan .c0{transform:translate(-50%,-50%) translateX(-64%) translateY(5%) rotate(-9deg)}
.fan .c1{transform:translate(-50%,-50%);width:372px;z-index:2;border-radius:52px}
.fan .c2{transform:translate(-50%,-50%) translateX(64%) translateY(5%) rotate(9deg)}
/* one large */
.one .card{border-radius:60px;width:430px;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-3deg)}
/* grid of all */
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:22px;align-content:center}
.grid .card{position:static;width:100%;border-radius:24px}
/* numbered steps and lists */
ol,ul{list-style:none;margin-top:56px;display:grid;gap:38px}
li{display:flex;gap:30px;align-items:flex-start;font-size:42px;line-height:1.3;font-weight:300}
li b{font-family:Cormorant,serif;font-weight:500;font-size:56px;display:block;color:#EBD79B}
body.cream li b{color:#7A1626}
li i{font-style:normal;flex:none;width:76px;height:76px;border-radius:50%;border:2px solid #C9A227;color:#C9A227;
  display:flex;align-items:center;justify-content:center;font-family:Cormorant,serif;font-size:44px}
ul.five{gap:22px;margin-top:40px}ul.five li{font-size:36px}ul.five li b{font-size:48px}
.corner{position:absolute;right:70px;bottom:170px;filter:drop-shadow(0 24px 22px rgba(0,0,0,.4))}
.tall .corner{bottom:340px}
.big{font-family:Cormorant,serif;font-size:250px;line-height:.9;color:#EBD79B;margin-top:30px}
.tall h1{font-size:112px}
.tall .lede{font-size:40px}
.tall{padding:230px 80px 330px}
.tall .foot{bottom:230px}
`;

const page = ({ kind = "", cream, kick, h1, lede, body = "", foot = "mangalyam.my" }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body class="${kind} ${cream ? "cream" : ""}">
${kick ? `<p class="kick">${kick}</p>` : ""}
<h1>${h1}</h1>
${lede ? `<p class="lede">${lede}</p>` : ""}
${body}
<div class="foot"><span class="wm">Mangalyam</span><span class="site">${foot}</span></div>
</body></html>`;

const fan = (a, b, c, who, whoCss) => `<div class="art fan">
<img class="card c0" src="${cover(a)}"><img class="card c1" src="${cover(b)}"><img class="card c2" src="${cover(c)}">
${who ? `<img class="who" src="${mascot(who)}" style="${whoCss}">` : ""}</div>`;
const one = (a, who, whoCss) => `<div class="art one"><img class="card" src="${cover(a)}">
${who ? `<img class="who" src="${mascot(who)}" style="${whoCss}">` : ""}</div>`;
const steps = (items) =>
  `<ol>${items.map(([b, t], i) => `<li><i>${i + 1}</i><span><b>${b}</b>${t}</span></li>`).join("")}</ol>`;
const ticks = (items) =>
  `<ul>${items.map(([b, t]) => `<li><i>✓</i><span><b>${b}</b>${t}</span></li>`).join("")}</ul>`;
const whoOnly = (who, h) =>
  `<div class="art"><img class="who" src="${mascot(who)}" style="height:${h}px;left:50%;bottom:0;transform:translateX(-50%)"></div>`;

const corner = (who, h = 360) => `<img class="corner" src="${mascot(who)}" style="height:${h}px">`;
const ALL = ["kalyana-mandapam", "malligai", "gopuram", "thamarai", "griha-pravesham", "mayil", "deepa-oli", "neelam", "maragatham", "manickam"];

/** Feed posts, 1080 x 1350. Numbered to match the calendar in PLAN.md. */
const POSTS = [
  ["01-launch", page({ kick: "Vanakkam", h1: "Your invitation, <em>as one beautiful link</em>", lede: "Sent on WhatsApp. Opens like a card. Counts its own replies.",
    body: fan("thamarai", "kalyana-mandapam", "mayil", "wave", "height:330px;left:0;bottom:0") })],
  ["02-free", page({ cream: true, kick: "Our opening gift", h1: "Free until <em>31 December 2026</em>", lede: "Publish your invitation before then and it is yours to keep. No card details asked.",
    body: one("malligai", "card", "height:400px;right:40px;bottom:0") })],
  ["03-designs", page({ kick: "Choose your card", h1: "Ten designs, <em>painted not decorated</em>", lede: "Each one changes colour to suit the day.",
    body: `<div class="art grid">${ALL.map((n) => `<img class="card" src="${cover(n)}">`).join("")}</div>` })],
  ["04-how", page({ kick: "How it works", h1: "Answer six questions. <em>Send the link.</em>",
    body: steps([["Tell us who is celebrating", "Names, the occasion, when and where."], ["Pick a design", "Add your photo and choose a colour."], ["Share on WhatsApp", "Guests open it and reply in a tap."]]) + corner("walk") })],
  ["05-occasions", page({ cream: true, kick: "Not only weddings", h1: "One for <em>every event you hold</em>",
    body: ticks([["Weddings", "Mehendi, Muhurtham, Nalangu, Reception."], ["Naming ceremonies", "Welcoming the newest member."], ["Housewarmings", "Griha Pravesham."], ["60th birthdays", "Sashtiabdapoorthi."], ["Temple and community events", "Kumbhabhishekam, open houses."]]).replace("<ul>", '<ul class="five">') })],
  ["06-rsvp", page({ kick: "Replies", h1: "Stop counting <em>heads by hand</em>", lede: "Guests tap to reply. You see who is coming and how many, as it happens.",
    body: fan("gopuram", "griha-pravesham", "deepa-oli", "think", "height:330px;right:0;bottom:0") })],
  ["07-jewels", page({ kick: "The jewel collection", h1: "Neelam. Maragatham. <em>Manickam.</em>", lede: "Sapphire, emerald and ruby, with gold that catches the light.",
    body: fan("neelam", "maragatham", "manickam") })],
  ["08-star", page({ kick: "Natchathiram and raasi", h1: "Which star <em>were you born under?</em>", lede: "Enter your birth date on our home page. We work it out and draw your constellation.",
    body: whoOnly("think", 520) })],
  ["09-aiyer", page({ cream: true, kick: "Say vanakkam to", h1: "Little Aiyer", lede: "He walks you through making your invitation, and can greet your guests if you ask him to.",
    body: whoOnly("namaste", 640) })],
  ["10-edit", page({ kick: "Plans change", h1: "Venue moved? <em>Change it in a minute.</em>", lede: "Edit after you send. The link your guests already have stays the same.",
    body: one("mayil", "sorry", "height:380px;left:30px;bottom:0") })],
  ["11-noapp", page({ cream: true, kick: "For your guests", h1: "No app. No sign-up. <em>Just tap.</em>",
    body: ticks([["Opens in WhatsApp", "One link, any phone."], ["Directions in a tap", "Straight to the venue on the map."], ["Saves to their calendar", "So nobody forgets the date."], ["Reply in seconds", "Name, how many, done."]]) + corner("wave", 300) })],
  ["12-cta", page({ kick: "Nandri", h1: "Make yours <em>tonight</em>", lede: "It takes a few minutes, and it is free until 31 December 2026.",
    body: fan("thamarai", "neelam", "kalyana-mandapam", "cheer", "height:340px;left:0;bottom:0") })],
  // A five-slide carousel: swipe through.
  ["c1-paper-1", page({ kick: "Swipe", h1: "Five things a <em>paper card cannot do</em>", body: one("kalyana-mandapam", "point", "height:380px;left:20px;bottom:0") })],
  ["c1-paper-2", page({ cream: true, h1: "", body: `<p class="big">1</p><h1>It counts <em>your replies</em></h1><p class="lede">A live headcount, without a single phone call.</p>` + corner("think", 420) })],
  ["c1-paper-3", page({ h1: "", body: `<p class="big">2</p><h1>It shows <em>the way</em></h1><p class="lede">One tap opens the venue on the map.</p>` + corner("walk", 420) })],
  ["c1-paper-4", page({ cream: true, h1: "", body: `<p class="big">3</p><h1>It can <em>be corrected</em></h1><p class="lede">Change the time or venue after sending. Nothing to reprint.</p>` + corner("card", 420) })],
  ["c1-paper-5", page({ h1: "", body: `<p class="big">4 + 5</p><h1>It reaches everyone, <em>and it is free</em></h1><p class="lede">One WhatsApp link for every relative, anywhere. Free until 31 December 2026.</p>` + corner("cheer", 420) })],
];

/** WhatsApp and Instagram status, 1080 x 1920. */
const STATUS = [
  ["s1-launch", page({ kind: "tall", kick: "Vanakkam", h1: "Your invitation, <em>as one beautiful link</em>", lede: "Sent on WhatsApp. Opens like a card.",
    body: fan("thamarai", "kalyana-mandapam", "mayil", "wave", "height:360px;left:0;bottom:0") })],
  ["s2-free", page({ kind: "tall", cream: true, kick: "Our opening gift", h1: "Free until <em>31 December 2026</em>", lede: "Make your invitation today. No card details asked.",
    body: one("malligai", "card", "height:430px;right:30px;bottom:0") })],
  ["s3-how", page({ kind: "tall", kick: "How it works", h1: "Answer six questions. <em>Send the link.</em>",
    body: steps([["Tell us who is celebrating", "Names, occasion, when and where."], ["Pick a design", "Add a photo, choose a colour."], ["Share on WhatsApp", "Guests reply in a tap."]]) + corner("walk", 440) })],
  ["s4-cta", page({ kind: "tall", kick: "Nandri", h1: "Make yours <em>tonight</em>", lede: "Free until 31 December 2026.",
    body: fan("neelam", "maragatham", "manickam", "cheer", "height:360px;left:0;bottom:0") })],
];

(async () => {
  const b = await chromium.launch();
  for (const [dir, list, w, h] of [["posts", POSTS, 1080, 1350], ["status", STATUS, 1080, 1920]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    for (const [name, html] of list) {
      const tmp = path.join(__dirname, "_tmp.html");
      fs.writeFileSync(tmp, html.replace("<h1></h1>", ""));
      await p.goto("file://" + tmp);
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(150);
      await p.screenshot({ path: path.join(ROOT, "marketing", dir, name + ".jpg"), type: "jpeg", quality: 90 });
    }
  }
  fs.unlinkSync(path.join(__dirname, "_tmp.html"));
  await b.close();
  console.log("built", POSTS.length, "posts and", STATUS.length, "status images");
})();
