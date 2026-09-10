import { draftHostNames, type InvitationDraft } from "@/lib/draft";

/**
 * The wizard's spine. Each step declares what it is called, the one-line
 * promise made at the top of it, and — crucially — what must be true before
 * the visitor may move past it.
 *
 * `blocker` returns the sentence to show, or null to let them through. It is
 * deliberately narrow: a step asks only for what would otherwise strand them
 * later. Everything else stays optional, because an invitation half-finished
 * on a Tuesday is the normal case, not an error.
 */
export interface WizardStep {
  id: string;
  name: string;
  heading: string;
  blurb: string;
  blocker: (draft: InvitationDraft) => string | null;
}

const HTTP = /^https?:\/\//i;

export const STEPS: WizardStep[] = [
  {
    id: "occasion",
    name: "Occasion",
    heading: "What are we celebrating?",
    blurb: "Pick the day. Everything after this is shaped around it.",
    blocker: (draft) => {
      // A wedding needs both halves named — the cover sets them as a pair, and
      // "Rishi &" on its own is worse than no cover at all.
      if (draft.eventType === "wedding") {
        if (!draft.groomName.trim() && !draft.brideName.trim())
          return "Tell us who is getting married.";
        if (!draft.groomName.trim()) return "Add the groom's name.";
        if (!draft.brideName.trim()) return "Add the bride's name.";
        return null;
      }
      return draftHostNames(draft) ? null : "Tell us whose celebration this is.";
    },
  },
  {
    id: "design",
    name: "Design",
    heading: "Choose the look",
    blurb: "A family, a colour and a set of letterforms. The preview follows along.",
    blocker: () => null,
  },
  {
    id: "details",
    name: "Details",
    heading: "When and where",
    blurb: "The two things a guest needs to turn up, and anything you want to add.",
    blocker: (draft) => {
      if (draft.ceremonyType === "custom" && !draft.customCeremonyName?.trim())
        return "Give your ceremony a name.";
      if (!draft.date) return "Add the date.";
      if (!draft.venueName?.trim()) return "Add the venue.";
      if (draft.mapLink && !HTTP.test(draft.mapLink))
        return "A map link has to start with http:// or https://";
      return null;
    },
  },
  {
    id: "moments",
    name: "Moments",
    heading: "The photo and the run of the day",
    blurb: "Both optional. Both are what make an invitation feel like yours.",
    blocker: () => null,
  },
  {
    id: "replies",
    name: "Replies",
    heading: "How it opens, how they answer",
    blurb: "The reveal, the countdown, and whether you are collecting RSVPs.",
    blocker: (draft) => {
      const { musicEnabled, musicUrl } = draft.settings;
      if (musicEnabled && musicUrl && !HTTP.test(musicUrl))
        return "A music link has to start with http:// or https://";
      return null;
    },
  },
  {
    id: "finish",
    name: "Finish",
    heading: "Save it to your account",
    blurb: "Your invitation is ready. This is where it gets a home and a link.",
    blocker: () => null,
  },
];
