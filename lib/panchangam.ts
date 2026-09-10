/**
 * A small panchangam, for helping someone pick a date.
 *
 * Two very different kinds of number live in here and the difference matters
 * more than the code does:
 *
 *   Rahu Kalam, Yamagandam and Gulikai are *arithmetic*. The day between
 *   sunrise and sunset is cut into eight, and each weekday takes a fixed slot.
 *   Given the right sunrise there is nothing to approximate — these are exact.
 *
 *   The natchathiram and the Tamil month are *astronomy*. They come from the
 *   Moon's and the Sun's sidereal longitudes, computed here from a truncated
 *   series rather than a full ephemeris. Good to a few arc-minutes, which is
 *   minutes of Moon motion — right almost always, and capable of being a day
 *   out when a star changes hands near sunrise.
 *
 * Nothing here decides whether a day is good or bad. It reports what the
 * panchangam says and leaves the judgement where it belongs.
 *
 * Sources: Meeus, *Astronomical Algorithms* (2nd ed.) — solar position ch. 25,
 * lunar position ch. 47, sunrise ch. 15. Lahiri ayanamsa as a linear fit.
 */

/** Kuala Lumpur. Peninsular sunrise varies by a few minutes across the states. */
export const PLACE = { name: "Kuala Lumpur", lat: 3.139, lon: 101.6869, tzHours: 8 };

const RAD = Math.PI / 180;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);
const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

/** Julian Day for a UTC instant. */
function julianDay(utcMs: number): number {
  return utcMs / 86400000 + 2440587.5;
}

/** Julian centuries from J2000.0. */
const centuries = (jd: number) => (jd - 2451545) / 36525;

/**
 * The Sun's apparent longitude, tropical. Meeus ch. 25 "low accuracy" — about
 * 0.01°, which for our purposes is exact: the Sun takes six hours to move that
 * far and the Tamil month only changes once a fortnight.
 */
export function sunLongitude(jd: number): number {
  const t = centuries(jd);
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * sin(m) +
    (0.019993 - 0.000101 * t) * sin(2 * m) +
    0.000289 * sin(3 * m);
  return norm360(l0 + c);
}

/**
 * The Moon's longitude, tropical. Meeus ch. 47 truncated to the terms that
 * carry the result — the first dozen cover everything above ~0.01°, and the
 * Moon moves 13° a day, so this is minutes rather than hours of error.
 */
export function moonLongitude(jd: number): number {
  const t = centuries(jd);
  const lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + (t * t * t) / 538841;
  const d = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
  const m = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;
  const mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
  const f = 93.272095 + 483202.0175233 * t - 0.0036539 * t * t;
  // Eccentricity correction on terms involving the Sun's anomaly.
  const e = 1 - 0.002516 * t - 0.0000074 * t * t;

  const terms: [number, number][] = [
    [6288774, mp],
    [1274027, 2 * d - mp],
    [658314, 2 * d],
    [213618, 2 * mp],
    [-185116 * e, m],
    [-114332, 2 * f],
    [58793, 2 * d - 2 * mp],
    [57066 * e, 2 * d - m - mp],
    [53322, 2 * d + mp],
    [45758 * e, 2 * d - m],
    [-40923 * e, m - mp],
    [-34720, d],
    [-30383 * e, m + mp],
    [15327, 2 * d - 2 * f],
    [-12528, mp + 2 * f],
    [10980, mp - 2 * f],
    [10675, 4 * d - mp],
    [10034, 3 * mp],
    [8548, 4 * d - 2 * mp],
    [-7888 * e, 2 * d + m - mp],
    [-6766 * e, 2 * d + m],
    [-5163, d - mp],
    [4987 * e, d + m],
    [4036 * e, 2 * d - m + mp],
    [3994, 2 * d + 2 * mp],
    [3861, 4 * d],
    [3665, 2 * d - 3 * mp],
  ];

  let sum = 0;
  for (const [coef, arg] of terms) sum += coef * sin(arg);
  return norm360(lp + sum / 1000000);
}

/**
 * Lahiri ayanamsa — the gap between the tropical zodiac the maths produces and
 * the sidereal one the panchangam uses. A linear fit is good to under an
 * arc-minute across the years anyone is booking a hall in.
 */
export function ayanamsa(jd: number): number {
  return 23.85 + 0.013969 * ((jd - 2451545) / 365.25);
}

export const sunSidereal = (jd: number) => norm360(sunLongitude(jd) - ayanamsa(jd));
export const moonSidereal = (jd: number) => norm360(moonLongitude(jd) - ayanamsa(jd));

/* ---------------------------------------------------------------- names --- */

/** The twenty-seven, in the Tamil names a family would actually say. */
export const NAKSHATRAS = [
  "Aswini", "Bharani", "Karthigai", "Rohini", "Mirugasirisham", "Thiruvathirai",
  "Punarpoosam", "Poosam", "Ayilyam", "Magam", "Pooram", "Uthiram",
  "Astham", "Chithirai", "Swathi", "Visakam", "Anusham", "Kettai",
  "Moolam", "Pooradam", "Uthiradam", "Thiruvonam", "Avittam", "Sadayam",
  "Poorattathi", "Uthirattathi", "Revathi",
] as const;

/** Sanskrit, for anyone who knows the star by that name instead. */
export const NAKSHATRAS_SANSKRIT = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

export const TAMIL_MONTHS = [
  "Chithirai", "Vaikasi", "Aani", "Aadi", "Aavani", "Purattasi",
  "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni",
] as const;

export const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

/* ------------------------------------------------------------- sunrise --- */

/**
 * Sunrise and sunset, as minutes after local midnight. NOAA's algorithm, which
 * agrees with published tables to about a minute at this latitude.
 */
export function sunTimes(y: number, m: number, d: number) {
  const utcNoon = Date.UTC(y, m - 1, d, 12) - PLACE.tzHours * 3600000;
  const t = centuries(julianDay(utcNoon));

  const l0 = norm360(280.46646 + 36000.76983 * t + 0.0003032 * t * t);
  const mAnom = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const ecc = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * sin(mAnom) +
    (0.019993 - 0.000101 * t) * sin(2 * mAnom) +
    0.000289 * sin(3 * mAnom);
  const trueLong = l0 + c;
  const omega = 125.04 - 1934.136 * t;
  const appLong = trueLong - 0.00569 - 0.00478 * sin(omega);
  const eps = 23 + (26 + (21.448 - t * (46.815 + t * 0.00059)) / 60) / 60 + 0.00256 * cos(omega);
  const decl = Math.asin(sin(eps) * sin(appLong)) / RAD;

  // Equation of time, in minutes.
  const varY = Math.tan((eps / 2) * RAD) ** 2;
  const eqTime =
    4 *
    (varY * Math.sin(2 * l0 * RAD) -
      2 * ecc * Math.sin(mAnom * RAD) +
      4 * ecc * varY * Math.sin(mAnom * RAD) * Math.cos(2 * l0 * RAD) -
      0.5 * varY * varY * Math.sin(4 * l0 * RAD) -
      1.25 * ecc * ecc * Math.sin(2 * mAnom * RAD)) /
    RAD;

  // 90.833° allows for refraction and the Sun's own disc.
  const cosHa =
    cos(90.833) / (cos(PLACE.lat) * cos(decl)) - Math.tan(PLACE.lat * RAD) * Math.tan(decl * RAD);
  if (cosHa > 1 || cosHa < -1) return null; // never happens at this latitude
  const ha = Math.acos(cosHa) / RAD;

  const noonMin = 720 - 4 * PLACE.lon - eqTime + PLACE.tzHours * 60;
  return { sunrise: noonMin - 4 * ha, sunset: noonMin + 4 * ha };
}

/* --------------------------------------------------- the day's windows --- */

/**
 * Which eighth of the daylight each period takes, by weekday. These tables are
 * the whole of the calculation — there is no astronomy in Rahu Kalam beyond
 * knowing when the Sun came up.
 */
const RAHU = [8, 2, 7, 5, 6, 4, 3]; // Sunday first
const YAMA = [5, 4, 3, 2, 1, 7, 6];
const GULIKAI = [7, 6, 5, 4, 3, 2, 1];

export interface Window {
  startMin: number;
  endMin: number;
}

function nthEighth(sunrise: number, sunset: number, nth: number): Window {
  const part = (sunset - sunrise) / 8;
  return { startMin: sunrise + part * (nth - 1), endMin: sunrise + part * nth };
}

/* ------------------------------------------------------------ the day --- */

export interface DayPanchangam {
  /** yyyy-mm-dd */
  date: string;
  weekday: (typeof WEEKDAYS)[number];
  /** Prevailing at sunrise, which is the convention. */
  nakshatra: string;
  nakshatraSanskrit: string;
  nakshatraIndex: number;
  tamilMonth: (typeof TAMIL_MONTHS)[number];
  sunrise: number;
  sunset: number;
  rahu: Window;
  yama: Window;
  gulikai: Window;
}

export function panchangamFor(y: number, m: number, d: number): DayPanchangam | null {
  const times = sunTimes(y, m, d);
  if (!times) return null;

  // Both are read at sunrise: that is the moment a panchangam names the day for.
  const sunriseUtcMs =
    Date.UTC(y, m - 1, d) + times.sunrise * 60000 - PLACE.tzHours * 3600000;
  const jd = julianDay(sunriseUtcMs);

  const nIndex = Math.floor(moonSidereal(jd) / (360 / 27)) % 27;
  const monthIndex = Math.floor(sunSidereal(jd) / 30) % 12;
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  return {
    date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    weekday: WEEKDAYS[weekday],
    nakshatra: NAKSHATRAS[nIndex],
    nakshatraSanskrit: NAKSHATRAS_SANSKRIT[nIndex],
    nakshatraIndex: nIndex,
    tamilMonth: TAMIL_MONTHS[monthIndex],
    sunrise: times.sunrise,
    sunset: times.sunset,
    rahu: nthEighth(times.sunrise, times.sunset, RAHU[weekday]),
    yama: nthEighth(times.sunrise, times.sunset, YAMA[weekday]),
    gulikai: nthEighth(times.sunrise, times.sunset, GULIKAI[weekday]),
  };
}

/** Minutes after midnight -> "7:04 am". */
export function clock(minutes: number): string {
  const total = Math.round(minutes);
  const h24 = Math.floor(total / 60) % 24;
  const mm = String(total % 60).padStart(2, "0");
  const suffix = h24 < 12 ? "am" : "pm";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm} ${suffix}`;
}

/* ------------------------------------------------- when the star turns --- */

export interface NakshatraSpan {
  index: number;
  name: string;
  sanskrit: string;
  /** Minutes after midnight on the queried day. May exceed 1440 for the tail. */
  fromMin: number;
  toMin: number;
}

/**
 * A star does not belong to a day; it hands over partway through one, and a
 * printed panchangam says so — "Punarpoosam until 10:24, then Poosam".
 *
 * Naming the day by whatever prevailed at sunrise is the usual shorthand, and
 * it is also the single biggest way this can look wrong: a festival timed to a
 * star that arrives at noon reads as the previous star at dawn. Giving the
 * handover time removes the argument entirely, and is what a family checking a
 * date actually wants to see.
 */
export function nakshatraSpans(y: number, m: number, d: number): NakshatraSpan[] {
  const today = sunTimes(y, m, d);
  if (!today) return [];
  const midnightUtc = Date.UTC(y, m - 1, d) - PLACE.tzHours * 3600000;
  const jdAt = (minutes: number) => julianDay(midnightUtc + minutes * 60000);
  const span = 360 / 27;
  const indexAt = (minutes: number) => Math.floor(moonSidereal(jdAt(minutes)) / span) % 27;

  const start = today.sunrise;
  const end = today.sunrise + 1440; // through to tomorrow's sunrise
  const spans: NakshatraSpan[] = [];
  let cursor = start;
  let current = indexAt(cursor);

  // The Moon crosses at most two boundaries in a day, so a handful of steps
  // finds them; the bisection then pins each to under a minute.
  while (cursor < end) {
    let probe = Math.min(cursor + 60, end);
    while (probe < end && indexAt(probe) === current) probe += 60;

    let boundary = Math.min(probe, end);
    if (boundary < end) {
      let lo = boundary - 60;
      let hi = boundary;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if (indexAt(mid) === current) lo = mid;
        else hi = mid;
      }
      boundary = hi;
    }

    spans.push({
      index: current,
      name: NAKSHATRAS[current],
      sanskrit: NAKSHATRAS_SANSKRIT[current],
      fromMin: cursor,
      toMin: boundary,
    });
    if (boundary >= end) break;
    cursor = boundary;
    current = indexAt(cursor + 1);
  }

  return spans;
}
