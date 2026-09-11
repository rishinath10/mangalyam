/**
 * Who is actually behind mangalyam.my.
 *
 * One place, because these details appear on three legal pages, in the footer
 * and in any receipt — and a registration number that disagrees with itself
 * across a site is worse than one that is absent.
 */
export const COMPANY = {
  /**
   * The platform's name, as it is written in words — page titles, receipts,
   * policies, anywhere a sentence names the thing.
   */
  brand: "Mangalyam.my",
  /**
   * What the logo says, which is not the same string.
   *
   * The wordmark is letterspaced serif; ".my" set at that spacing reads as
   * punctuation rather than as part of a domain. A wordmark and a platform
   * name are allowed to differ, and here they do — deliberately, in one place,
   * rather than by drift.
   */
  wordmark: "Mangalyam",
  site: "mangalyam.my",
  /** The entity that actually trades, and is liable. */
  legalName: "Art Engine My Solutions",
  registrationNumber: "202103086214",
  country: "Malaysia",
  email: "artenginemy@gmail.com",
  /**
   * Deliberately null until there is a real number.
   *
   * A privacy policy's contact details are how someone exercises a legal
   * right, so a placeholder here is not a harmless stand-in — it is a
   * published route to nobody. The pages simply omit the line while this is
   * null; fill it in and it appears everywhere at once.
   */
  phone: null as string | null,
  /** When these documents were last changed. Update with the text, not by hand
   *  at some later date — a stale date makes a policy look abandoned. */
  policiesUpdated: "11 September 2026",
} as const;
