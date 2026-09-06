"use client";

import { useState } from "react";
import type { InvitationJson } from "@/lib/invitation/types";

type State = "idle" | "sending" | "done" | "error";

/**
 * The guest-facing reply form. It posts by slug to the public endpoint — the
 * invitation id never reaches the page, so a guest cannot address anything but
 * the invitation they were sent.
 *
 * In the builder preview it renders identically but does not submit: editing a
 * page must never write a real reply.
 */
export function RsvpForm({
  invitation,
  preview = false,
}: {
  invitation: InvitationJson;
  preview?: boolean;
}) {
  const { rsvp, slug } = invitation;
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [meal, setMeal] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (attending === null) {
      setError("Please let us know whether you can come.");
      return;
    }
    if (preview) {
      setState("done");
      return;
    }

    setState("sending");
    setError(null);

    const res = await fetch(`/api/public/invitations/${encodeURIComponent(slug)}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName,
        attending,
        guestCount: attending ? Number(guestCount) || 1 : 0,
        mealPreference: meal || null,
        message: message || null,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setState("error");
      return;
    }

    setState("done");
  }

  if (state === "done") {
    return (
      <div className="rsvp-done" role="status">
        <p className="rsvp-done-h">
          {attending ? "Thank you — we can't wait to see you." : "Thank you for letting us know."}
        </p>
        {preview && <p className="rsvp-preview-note">Preview only — nothing was sent.</p>}
      </div>
    );
  }

  return (
    <form className="rsvp-form" onSubmit={onSubmit}>
      <label className="rsvp-field">
        <span>Your name</span>
        <input
          required
          maxLength={80}
          autoComplete="name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />
      </label>

      <div className="rsvp-choice" role="group" aria-label="Will you attend?">
        <button
          type="button"
          aria-pressed={attending === true}
          onClick={() => { setAttending(true); setError(null); }}
        >
          Joyfully accept
        </button>
        <button
          type="button"
          aria-pressed={attending === false}
          onClick={() => { setAttending(false); setError(null); }}
        >
          Regretfully decline
        </button>
      </div>

      {attending === true && (
        <>
          <label className="rsvp-field">
            <span>How many of you?</span>
            <input
              type="number"
              min={1}
              max={30}
              inputMode="numeric"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </label>

          {rsvp.askMealPreference && (
            <label className="rsvp-field">
              <span>Meal preference</span>
              <select value={meal} onChange={(e) => setMeal(e.target.value)}>
                <option value="">No preference</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-vegetarian">Non-vegetarian</option>
              </select>
            </label>
          )}
        </>
      )}

      <label className="rsvp-field">
        <span>A message for the couple</span>
        <textarea
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      {error && (
        <p role="alert" className="rsvp-error">
          {error}
        </p>
      )}

      <button type="submit" className="rsvp-submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send our reply"}
      </button>

      {preview && <p className="rsvp-preview-note">Preview — replies are not saved here.</p>}
    </form>
  );
}
