/**
 * The landing page's "reveal your stars" gimmick (CLAUDE.md-adjacent, not in
 * the brief's data model — this never touches the database or a signed-in
 * user; it's pure functions over a birth date typed into a public form).
 *
 * The twelve signs use the standard tropical date boundaries because that's
 * what "star sign" means to anyone reading the page, but everything past the
 * boundary — the motif, the traits, the reading — is our own invention, not a
 * real chart. The copy says so. Keep it that way: a nice touch, not a claim.
 */

export type Stroke = readonly (readonly [number, number])[];

export interface SignInfo {
  id: string;
  name: string;
  range: string;
  /** An object from Malaysian Indian celebration life, not a zodiac glyph. */
  motif: string;
  meaning: string;
  traits: readonly [string, string];
  color: string;
  /** Gestural line art for the canvas, in a -100..100 box. One array per stroke. */
  art: readonly Stroke[];
}

export const SIGNS: readonly SignInfo[] = [
  {
    id: "capricorn",
    name: "Capricorn",
    range: "22 Dec – 19 Jan",
    motif: "the mango-leaf toran",
    meaning: "strung across the doorway before a single guest arrives",
    traits: ["planning the whole function before anyone else has picked a date", "the one the caterer actually calls back"],
    color: "#8FA35E",
    art: [[[-55, 10], [-33, -14], [-11, 4], [11, -14], [33, 4], [55, -14]]],
  },
  {
    id: "aquarius",
    name: "Aquarius",
    range: "20 Jan – 18 Feb",
    motif: "the kalasam",
    meaning: "filled, topped with a coconut, and never quite the same twice",
    traits: ["bringing the one idea nobody else thought to try", "the guest list somehow grows once you're on it"],
    color: "#4E92B0",
    art: [
      [[-26, 10], [-30, 35], [-14, 52], [14, 52], [30, 35], [26, 10], [-26, 10]],
      [[-14, 10], [-14, -8], [14, -8], [14, 10]],
      [[0, -22]],
    ],
  },
  {
    id: "pisces",
    name: "Pisces",
    range: "19 Feb – 20 Mar",
    motif: "twin oil flames",
    meaning: "lit together so neither one burns out alone",
    traits: ["crying at every wedding, including strangers'", "remembering the one song that got everyone up dancing"],
    color: "#E3B34D",
    art: [
      [[-24, 40], [-30, 10], [-20, -14], [-24, -36]],
      [[24, 40], [30, 10], [20, -14], [24, -36]],
    ],
  },
  {
    id: "aries",
    name: "Aries",
    range: "21 Mar – 19 Apr",
    motif: "the temple bell",
    meaning: "rung to call a ceremony to attention",
    traits: ["arriving first and setting the mood for everyone after you", "saying the thing the whole room was quietly thinking"],
    color: "#D97757",
    art: [
      [[0, -60], [-28, -35], [-34, 5], [-40, 35], [40, 35], [34, 5], [28, -35], [0, -60]],
      [[0, 35], [0, 58]],
    ],
  },
  {
    id: "taurus",
    name: "Taurus",
    range: "20 Apr – 20 May",
    motif: "the standing lamp",
    meaning: "lit before the guests arrive, burning long after they've gone",
    traits: ["steadying a whole gathering just by being in it", "remembering everyone's favourite dish without being told"],
    color: "#C9A227",
    art: [
      [[0, 60], [0, 10]],
      [[-30, 10], [-20, -8], [0, -16], [20, -8], [30, 10]],
      [[0, -16], [-5, -30], [0, -44]],
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    range: "21 May – 20 Jun",
    motif: "the betel leaf",
    meaning: "folded fresh for whoever's at the door next",
    traits: ["carrying three conversations at once without dropping any of them", "making a stranger feel like family inside a minute"],
    color: "#7FB07A",
    art: [
      [[0, -45], [-26, -20], [-20, 20], [0, 42], [20, 20], [26, -20], [0, -45]],
      [[0, -30], [0, 25]],
    ],
  },
  {
    id: "cancer",
    name: "Cancer",
    range: "21 Jun – 22 Jul",
    motif: "the kolam dot beneath a crescent",
    meaning: "drawn fresh at the threshold every single morning",
    traits: ["noticing who hasn't eaten yet before anyone else does", "turning a house into the place everyone ends up at"],
    color: "#A9B8D9",
    art: [
      [[30, -40], [10, -46], [-10, -38], [-22, -14], [-18, 12], [0, 30], [18, 18]],
      [[-34, -4]],
    ],
  },
  {
    id: "leo",
    name: "Leo",
    range: "23 Jul – 22 Aug",
    motif: "the peacock feather",
    meaning: "kept aside for the moment it's needed most",
    traits: ["walking in like the occasion was planned around you", "making the photographs worth taking"],
    color: "#3E8E7E",
    art: [
      [[0, 55], [-4, 10], [-14, -20], [-6, -46], [10, -58]],
      [[10, -58], [26, -64], [34, -48], [22, -38], [10, -46]],
    ],
  },
  {
    id: "virgo",
    name: "Virgo",
    range: "23 Aug – 22 Sep",
    motif: "the jasmine strand",
    meaning: "strung bud by bud, never rushed",
    traits: ["the one who actually reads the seating chart", "quietly fixing three things before anyone noticed they'd gone wrong"],
    color: "#C9A9E0",
    art: [[[-50, 0], [-30, -18], [-10, 4], [10, -18], [30, 4], [50, -18]]],
  },
  {
    id: "libra",
    name: "Libra",
    range: "23 Sep – 22 Oct",
    motif: "the brass scale",
    meaning: "balanced without a thumb on either side",
    traits: ["the one both grandmothers trust with the final decision", "keeping the peace between two families who disagree about the menu"],
    color: "#B08D57",
    art: [
      [[0, 55], [0, -10]],
      [[-40, -10], [40, -10]],
      [[-40, -10], [-40, 20]],
      [[40, -10], [40, 20]],
    ],
  },
  {
    id: "scorpio",
    name: "Scorpio",
    range: "23 Oct – 21 Nov",
    motif: "the kolam star",
    meaning: "traced in one unbroken line, dot to dot",
    traits: ["remembering exactly who said what at the last function", "loyalty that outlasts the seating arrangement"],
    color: "#B21E56",
    art: [[[0, -55], [32, 45], [-52, -17], [52, -17], [-32, 45], [0, -55]]],
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    range: "22 Nov – 21 Dec",
    motif: "the temple flag",
    meaning: "raised first, seen from the furthest lane",
    traits: ["the one who actually organises the group trip", "turning a small gathering into an occasion worth dressing up for"],
    color: "#D9A441",
    art: [
      [[0, 60], [0, -60]],
      [[0, -60], [38, -42], [0, -24]],
    ],
  },
] as const;

const TIME_FLAVOR = [
  { max: 5, line: "Born in the hour before the house wakes — you've always been up before everyone else's alarm." },
  { max: 11, line: "Born as the morning prayers were still being said — mornings have never scared you." },
  { max: 16, line: "Born right in the thick of the afternoon — you've never once been early, and everyone's stopped expecting it." },
  { max: 20, line: "Born as the lamps were being lit for the evening — you know how to make an entrance right on cue." },
  { max: 24, line: "Born under a sky already full of stars — night owls have always recognised one of their own." },
] as const;

const NO_TIME_LINE = "Sometime that day — the hour got lost in the commotion, the way it does.";

/** Month is 1-indexed to match how a date input's value reads. */
function signForMonthDay(month: number, day: number): SignInfo {
  // Walks the boundaries in calendar order; SIGNS starts at Capricorn because
  // its range crosses the year boundary and is easiest to special-case first.
  if (month === 12 && day >= 22) return SIGNS[0];
  if (month === 1 && day <= 19) return SIGNS[0];
  const boundaries: { month: number; day: number; sign: SignInfo }[] = [
    { month: 1, day: 20, sign: SIGNS[1] },
    { month: 2, day: 19, sign: SIGNS[2] },
    { month: 3, day: 21, sign: SIGNS[3] },
    { month: 4, day: 20, sign: SIGNS[4] },
    { month: 5, day: 21, sign: SIGNS[5] },
    { month: 6, day: 21, sign: SIGNS[6] },
    { month: 7, day: 23, sign: SIGNS[7] },
    { month: 8, day: 23, sign: SIGNS[8] },
    { month: 9, day: 23, sign: SIGNS[9] },
    { month: 10, day: 23, sign: SIGNS[10] },
    { month: 11, day: 22, sign: SIGNS[11] },
    { month: 12, day: 22, sign: SIGNS[0] },
  ];
  // Every month/day pair that reaches this loop has already failed both
  // early-return checks above, which guarantees the first boundary (20 Jan)
  // is always reached — so this default is never actually returned.
  let current: SignInfo = SIGNS[1];
  for (const b of boundaries) {
    const reached = month > b.month || (month === b.month && day >= b.day);
    if (reached) current = b.sign;
  }
  return current;
}

export interface StarReading {
  sign: SignInfo;
  timeLine: string;
}

/**
 * `dateValue` is a native <input type="date"> value ("YYYY-MM-DD"); `timeValue`
 * is a native <input type="time"> value ("HH:MM") or null if the guest left it
 * blank. Parsed as plain strings rather than through `Date` so no timezone
 * conversion can shift a birthday to the wrong side of a sign boundary.
 */
export function buildReading(dateValue: string, timeValue: string | null): StarReading | null {
  const dateMatch = /^\d{4}-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!dateMatch) return null;
  const month = Number(dateMatch[1]);
  const day = Number(dateMatch[2]);
  const sign = signForMonthDay(month, day);

  const timeMatch = timeValue ? /^(\d{2}):\d{2}$/.exec(timeValue) : null;
  const hour = timeMatch ? Number(timeMatch[1]) : null;
  const timeLine = hour === null
    ? NO_TIME_LINE
    : (TIME_FLAVOR.find((t) => hour < t.max) ?? TIME_FLAVOR[TIME_FLAVOR.length - 1]).line;

  return { sign, timeLine };
}
