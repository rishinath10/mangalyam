import { NAKSHATRAS, NAKSHATRAS_SANSKRIT, moonSidereal } from "@/lib/panchangam";

/**
 * A birth star (natchathiram) and moon sign (raasi), from a date, a time and
 * where the clock was set.
 *
 * Both are read off one number: the Moon's sidereal longitude at the moment of
 * birth. The sky is cut into twenty-seven equal stars of 13°20' and twelve
 * signs of 30°; whichever the Moon stood in is the answer. That is astronomy,
 * not interpretation, and it is the same arithmetic a printed panchangam does.
 *
 * What this cannot do is know the birth time better than it was told. The
 * Moon moves through a star in about a day, so a date alone often settles it
 * and sometimes does not — and when it does not, this says so and gives both
 * candidates rather than quietly picking one. A family's own almanac, or the
 * astrologer who cast the chart, outranks this page.
 *
 * Nothing here says what a star *means* for anyone. The symbol and the deity
 * are what tradition records against each star, reported as that.
 */

const STAR_SPAN = 360 / 27; // 13°20'
const PADA_SPAN = STAR_SPAN / 4; // 3°20'

/** The twelve, in the Tamil names first, then Sanskrit and the Western sign. */
export const RAASIS = [
  { tamil: "Mesham", sanskrit: "Mesha", western: "Aries" },
  { tamil: "Rishabam", sanskrit: "Vrishabha", western: "Taurus" },
  { tamil: "Mithunam", sanskrit: "Mithuna", western: "Gemini" },
  { tamil: "Kadagam", sanskrit: "Karka", western: "Cancer" },
  { tamil: "Simmam", sanskrit: "Simha", western: "Leo" },
  { tamil: "Kanni", sanskrit: "Kanya", western: "Virgo" },
  { tamil: "Thulam", sanskrit: "Tula", western: "Libra" },
  { tamil: "Viruchigam", sanskrit: "Vrischika", western: "Scorpio" },
  { tamil: "Dhanusu", sanskrit: "Dhanu", western: "Sagittarius" },
  { tamil: "Magaram", sanskrit: "Makara", western: "Capricorn" },
  { tamil: "Kumbam", sanskrit: "Kumbha", western: "Aquarius" },
  { tamil: "Meenam", sanskrit: "Meena", western: "Pisces" },
] as const;

/**
 * What tradition records against each star: its emblem, its presiding deity
 * and its ruling graha. Listed in the order of the sky, Aswini first.
 */
export const STAR_LORE: readonly { symbol: string; deity: string; ruler: string }[] = [
  { symbol: "a horse's head", deity: "the Ashwini Kumaras", ruler: "Ketu" },
  { symbol: "the bearer", deity: "Yama", ruler: "Venus" },
  { symbol: "a flame", deity: "Agni", ruler: "the Sun" },
  { symbol: "a chariot", deity: "Brahma", ruler: "the Moon" },
  { symbol: "a deer's head", deity: "Soma", ruler: "Mars" },
  { symbol: "a teardrop", deity: "Rudra", ruler: "Rahu" },
  { symbol: "a quiver of arrows", deity: "Aditi", ruler: "Jupiter" },
  { symbol: "a lotus", deity: "Brihaspati", ruler: "Saturn" },
  { symbol: "a coiled serpent", deity: "the Nagas", ruler: "Mercury" },
  { symbol: "a royal throne", deity: "the ancestors", ruler: "Ketu" },
  { symbol: "a swinging hammock", deity: "Bhaga", ruler: "Venus" },
  { symbol: "a bed", deity: "Aryaman", ruler: "the Sun" },
  { symbol: "an open hand", deity: "Savitr", ruler: "the Moon" },
  { symbol: "a bright jewel", deity: "Vishvakarma", ruler: "Mars" },
  { symbol: "a young shoot in the wind", deity: "Vayu", ruler: "Rahu" },
  { symbol: "a triumphal arch", deity: "Indra and Agni", ruler: "Jupiter" },
  { symbol: "a lotus in bloom", deity: "Mitra", ruler: "Saturn" },
  { symbol: "a protective amulet", deity: "Indra", ruler: "Mercury" },
  { symbol: "a bundle of roots", deity: "Nirriti", ruler: "Ketu" },
  { symbol: "a winnowing fan", deity: "the Waters", ruler: "Venus" },
  { symbol: "an elephant's tusk", deity: "the Vishvadevas", ruler: "the Sun" },
  { symbol: "three footprints", deity: "Vishnu", ruler: "the Moon" },
  { symbol: "a drum", deity: "the eight Vasus", ruler: "Mars" },
  { symbol: "an empty circle", deity: "Varuna", ruler: "Rahu" },
  { symbol: "twin swords", deity: "Aja Ekapada", ruler: "Jupiter" },
  { symbol: "a serpent of the deep", deity: "Ahir Budhnya", ruler: "Saturn" },
  { symbol: "a fish", deity: "Pushan", ruler: "Mercury" },
];

/**
 * Where the clock was set. A birth time is a local time, and the same reading
 * on the wall is a different instant in Kuala Lumpur and in Chennai.
 */
export const BIRTH_PLACES = [
  { id: "my", label: "Malaysia or Singapore" },
  { id: "in", label: "India or Sri Lanka" },
  { id: "uk", label: "United Kingdom" },
  { id: "au", label: "Australia (east coast)" },
] as const;
export type BirthPlaceId = (typeof BIRTH_PLACES)[number]["id"];

/**
 * Hours ahead of UTC for a place on a date.
 *
 * Malaysia and Singapore were on UTC+7:30 until the end of 1981 — which is
 * every parent and grandparent on most invitations — and moved to +8 on New
 * Year's Day 1982. India has been +5:30 throughout. The other two ignore
 * daylight saving, which moves the answer by an hour: half a degree of Moon,
 * and the near-boundary warning below already covers that much.
 */
export function utcOffsetHours(place: BirthPlaceId, year: number): number {
  switch (place) {
    case "my":
      return year < 1982 ? 7.5 : 8;
    case "in":
      return 5.5;
    case "uk":
      return 0;
    case "au":
      return 10;
  }
}

export interface StarPosition {
  /** 0–26, Aswini first. */
  star: number;
  /** 1–4: which quarter of the star. */
  pada: number;
  /** 0–11, Mesham first. */
  raasi: number;
  /** The Moon's sidereal longitude, degrees. */
  longitude: number;
}

export function starAt(longitude: number): StarPosition {
  const lon = ((longitude % 360) + 360) % 360;
  const within = lon % STAR_SPAN;
  return {
    star: Math.floor(lon / STAR_SPAN),
    pada: Math.floor(within / PADA_SPAN) + 1,
    raasi: Math.floor(lon / 30),
    longitude: lon,
  };
}

/** Julian Day for a local wall-clock time at a given offset from UTC. */
function julianDayLocal(
  year: number, month: number, day: number, minutes: number, offsetHours: number,
): number {
  const utcMs = Date.UTC(year, month - 1, day) + minutes * 60_000 - offsetHours * 3_600_000;
  return utcMs / 86_400_000 + 2_440_587.5;
}

export interface BirthStar {
  position: StarPosition;
  /**
   * Set when the answer is not certain: the other star it could be. With no
   * birth time, that is a star the Moon was also in that day; with one, it is
   * the neighbouring star when the Moon was within half an hour of the line.
   */
  alternative: StarPosition | null;
  /** Why `alternative` is set, in the reader's terms. */
  doubt: "no-time" | "near-boundary" | null;
}

/**
 * The series behind this is good to a few arc-minutes, and a remembered birth
 * time is rarely good to better than a quarter of an hour. Half a degree is
 * about an hour of Moon; inside it, the neighbouring star is worth naming.
 */
const BOUNDARY_MARGIN_DEG = 0.5;

/** Null for a date that is not one. */
export function birthStar(
  dateIso: string,
  timeHHmm: string | null,
  place: BirthPlaceId,
): BirthStar | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso);
  if (!d) return null;
  const [year, month, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day || year < 1900 || year > 2100
  ) {
    return null;
  }
  const offset = utcOffsetHours(place, year);

  const t = /^(\d{1,2}):(\d{2})$/.exec((timeHHmm ?? "").trim());
  if (!t) {
    // No time: where the Moon was at the start, the middle and the end of the
    // day. Noon is the best single guess; if the day's two ends disagree, the
    // other end is the alternative.
    const at = (minutes: number) =>
      starAt(moonSidereal(julianDayLocal(year, month, day, minutes, offset)));
    const [dawn, noon, dusk] = [at(0), at(720), at(1439)];
    if (dawn.star === dusk.star) return { position: noon, alternative: null, doubt: null };
    return {
      position: noon,
      alternative: noon.star === dawn.star ? dusk : dawn,
      doubt: "no-time",
    };
  }

  const minutes = Number(t[1]) * 60 + Number(t[2]);
  const position = starAt(moonSidereal(julianDayLocal(year, month, day, minutes, offset)));
  const within = position.longitude % STAR_SPAN;
  let alternative: StarPosition | null = null;
  if (within < BOUNDARY_MARGIN_DEG) {
    alternative = starAt(position.longitude - BOUNDARY_MARGIN_DEG * 2);
  } else if (STAR_SPAN - within < BOUNDARY_MARGIN_DEG) {
    alternative = starAt(position.longitude + BOUNDARY_MARGIN_DEG * 2);
  }
  return { position, alternative, doubt: alternative ? "near-boundary" : null };
}

/** "Thiruvonam" — and "Shravana" for anyone who knows it by that name. */
export function starNames(star: number) {
  return { tamil: NAKSHATRAS[star], sanskrit: NAKSHATRAS_SANSKRIT[star] };
}
