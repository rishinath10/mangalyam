"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PreviewPane } from "@/components/builder/PreviewPane";
import { composeInvitationJson } from "@/lib/invitation/compose";
import { draftSlug, draftToSource, emptyDraft, type InvitationDraft } from "@/lib/draft";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-storage";
import { STEPS } from "./steps";
import { StepOccasion } from "./StepOccasion";
import { StepDesign } from "./StepDesign";
import { StepDetails } from "./StepDetails";
import { StepMoments } from "./StepMoments";
import { StepReplies } from "./StepReplies";
import { StepFinish } from "./StepFinish";
import { CoupleConstellation } from "./CoupleConstellation";

/**
 * The create flow: six steps, one preview, no account until the last one.
 *
 * The preview is composed from local state through `composeInvitationJson` —
 * the same function the published page goes through — so what a visitor
 * watches while answering is the real renderer, not a mock-up of it (rule #3).
 */
export function CreateWizard({
  signedIn,
  signedInEmail,
  purchasable,
  priceLabel,
}: {
  signedIn: boolean;
  signedInEmail: string | null;
  purchasable: boolean;
  priceLabel: string | null;
}) {
  const [draft, setDraft] = useState<InvitationDraft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [blocker, setBlocker] = useState<string | null>(null);
  const [storageWarned, setStorageWarned] = useState(false);
  const [resumed, setResumed] = useState(false);
  // Once the draft is rows, there is nothing left in this wizard to go back to.
  const [saved, setSaved] = useState(false);
  // Set while the couple's constellation is on screen; advancing waits for it.
  const [celebrating, setCelebrating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Bumping this remounts the preview, which re-seals the cover so the opening
  // can be watched again. Choosing between three openings is impossible once
  // the first tap has already spent the only reveal.
  const [replay, setReplay] = useState(0);
  // Until the stored draft has been read, nothing may be written back over it.
  const hydrated = useRef(false);
  const panel = useRef<HTMLDivElement>(null);

  // localStorage is not readable during the server render, so the draft is
  // picked up on mount. Rendering the empty draft for one frame first is what
  // keeps the markup identical on both sides.
  useEffect(() => {
    const stored = loadDraft();
    if (stored) {
      setDraft(stored);
      setResumed(true);
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    if (!saveDraft(draft)) setStorageWarned(true);
    // A complaint about a missing date must not survive the date being typed.
    setBlocker(null);
  }, [draft]);

  // A sheet that covers the page must not leave the page scrolling behind it.
  useEffect(() => {
    if (!previewOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [previewOpen]);

  const previewJson = useMemo(() => composeInvitationJson(draftToSource(draft)), [draft]);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  function go(next: number) {
    setBlocker(null);
    setStep(next);
    setPreviewOpen(false);
    // A step change is a page change as far as the reader is concerned, so the
    // panel is put back to its top and given focus rather than leaving them
    // scrolled halfway down the previous answer.
    panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * Leaving the first step with a wedding's two names is the one place in the
   * wizard worth stopping for: it is the moment the invitation stops being a
   * form and becomes about two specific people. Once per draft only.
   */
  function shouldCelebrate() {
    return (
      current.id === "occasion" &&
      draft.eventType === "wedding" &&
      !draft.celebrated &&
      Boolean(draft.groomName.trim() && draft.brideName.trim())
    );
  }

  function next() {
    const problem = current.blocker(draft);
    if (problem) {
      setBlocker(problem);
      return;
    }
    if (last) return;
    if (shouldCelebrate()) {
      setCelebrating(true);
      return;
    }
    go(step + 1);
  }

  /**
   * The rail is a shortcut, not an escape hatch: any earlier step is one tap
   * away, and a later one only opens once every step before it is answered.
   * That keeps someone from landing on "Finish" with no date and reading a
   * list of complaints instead of a summary.
   */
  function jump(target: number) {
    if (target <= step) return go(target);
    for (let i = step; i < target; i++) {
      const problem = STEPS[i].blocker(draft);
      if (problem) {
        setBlocker(problem);
        setStep(i);
        return;
      }
    }
    go(target);
  }

  function startOver() {
    clearDraft();
    setDraft(emptyDraft());
    setResumed(false);
    go(0);
  }

  const stepProps = { draft, onDraft: setDraft };

  return (
    <div className="wz">
      <ol className="wz-rail">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => jump(i)}
              aria-current={i === step ? "step" : undefined}
              data-done={i < step ? "" : undefined}
            >
              <i aria-hidden="true">{i < step ? "✓" : i + 1}</i>
              <span>{s.name}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="wz-grid">
        <div className="t wz-panel" ref={panel}>
          <p className="kick">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2>{current.heading}</h2>
          <p className="muted wz-blurb">{current.blurb}</p>

          {resumed && step === 0 && (
            <p className="notice notice-good wz-resume">
              We picked up where you left off.{" "}
              <button type="button" onClick={startOver}>
                Start a new one
              </button>
            </p>
          )}

          {storageWarned && (
            <p className="notice notice-bad">
              This browser will not let us save your draft, so it lives in this tab
              only. Finish in one sitting, or switch out of private browsing.
            </p>
          )}

          <div className="wz-body">
            {current.id === "occasion" && <StepOccasion {...stepProps} />}
            {current.id === "design" && <StepDesign {...stepProps} />}
            {current.id === "details" && <StepDetails {...stepProps} />}
            {current.id === "moments" && <StepMoments {...stepProps} />}
            {current.id === "replies" && <StepReplies {...stepProps} />}
            {current.id === "finish" && (
              <StepFinish
                draft={draft}
                signedIn={signedIn}
                signedInEmail={signedInEmail}
                purchasable={purchasable}
                priceLabel={priceLabel}
                onSaved={() => setSaved(true)}
              />
            )}
          </div>

          {blocker && (
            <p role="alert" className="notice notice-bad wz-blocker">
              {blocker}
            </p>
          )}

          {!last && (
            <div className="wz-nav">
              <Button
                type="button"
                variant="quiet"
                onClick={() => go(step - 1)}
                disabled={step === 0}
              >
                ← Back
              </Button>
              <Button type="button" onClick={next}>
                Continue
              </Button>
            </div>
          )}

          {last && !saved && (
            <div className="wz-nav">
              <Button type="button" variant="quiet" onClick={() => go(step - 1)}>
                ← Back
              </Button>
            </div>
          )}
        </div>

        <aside className="wz-preview" data-open={previewOpen ? "" : undefined}>
          <div className="wz-preview-in">
            <PreviewPane
              // Changing the opening style re-seals the cover on its own, so
              // the choice on the Replies step demonstrates itself.
              key={`${draft.settings.openingStyle}-${replay}`}
              invitation={previewJson}
              slug={draftSlug(draft)}
            />
            <button
              type="button"
              className="wz-replay"
              onClick={() => setReplay((n) => n + 1)}
            >
              Replay the opening
            </button>
          </div>
        </aside>
      </div>

      {celebrating && (
        <CoupleConstellation
          groom={draft.groomName.trim()}
          bride={draft.brideName.trim()}
          onDone={() => {
            setCelebrating(false);
            // Marked on the draft, not in component state, so a reload does not
            // hand them the same three seconds again.
            setDraft((d) => ({ ...d, celebrated: true }));
            go(step + 1);
          }}
        />
      )}

      {/* On a phone the preview cannot sit beside the questions, so it becomes
          a sheet the visitor pulls up whenever they want to look. */}
      <button
        type="button"
        className="wz-peek"
        onClick={() => setPreviewOpen((open) => !open)}
        aria-expanded={previewOpen}
      >
        <span>{previewOpen ? "Back to the questions" : "Preview my invitation"}</span>
      </button>
    </div>
  );
}
