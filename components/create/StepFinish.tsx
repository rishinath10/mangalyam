"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Tick } from "@/components/site/Icons";
import { claimPayload, draftIssues, draftLabel, type InvitationDraft } from "@/lib/draft";
import { clearDraft, coverDataUrlToFile } from "@/lib/draft-storage";

type Saved = { eventId: string; invitationId: string; slug: string };

const INCLUDED = [
  "Your own mangalyam.my link",
  "Unlimited RSVPs, exported to a spreadsheet",
  "Gallery, timeline and countdown",
  "Edits stay live after you publish",
];

/**
 * Where an anonymous draft becomes an account's invitation, and where the
 * money is asked for.
 *
 * The order is deliberate and is the whole point of the rebuild: everything
 * before this screen happened without an account, so the visitor has already
 * seen their own invitation working before they are asked for anything. Saving
 * costs nothing. Publishing is what costs — enforced server-side in the
 * publish route against the entitlement, not by hiding a button here.
 */
export function StepFinish({
  draft,
  signedIn,
  signedInEmail,
  purchasable,
  priceLabel,
  onSaved,
}: {
  draft: InvitationDraft;
  signedIn: boolean;
  signedInEmail: string | null;
  purchasable: boolean;
  priceLabel: string | null;
  /** Told once the draft has become rows, so the wizard can stop offering
   *  a way back into a draft that no longer exists. */
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<"signup" | "signin">(signedIn ? "signin" : "signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  const issues = draftIssues(draft);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  /** Creates the account if needed, then signs in. Throws with a readable message. */
  async function authenticate() {
    if (signedIn) return;

    if (mode === "signup") {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 409) {
          throw new Error(
            "You already have an account with that email. Switch to “I have an account” and sign in — your draft will come with you.",
          );
        }
        const detail = body.issues
          ? Object.values(body.issues as Record<string, string[]>).flat()[0]
          : null;
        throw new Error(detail ?? body.error ?? "That account could not be created.");
      }
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (result?.error) {
      throw new Error(
        mode === "signup"
          ? "Your account was created but signing in failed. Try signing in with those details."
          : "That email and password don't match an account.",
      );
    }
  }

  async function finish() {
    setBusy(true);
    setError(null);
    setWarning(null);

    try {
      await authenticate();

      const res = await fetch("/api/drafts/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimPayload(draft)),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = body.details
          ? Object.values(body.details as Record<string, string[]>).flat()[0]
          : null;
        throw new Error(detail ?? body.error ?? "Your invitation could not be saved.");
      }

      // The photo goes up through the ordinary cover route now that there is
      // an invitation to attach it to. A failure here is not worth losing the
      // save over — everything else is already stored, and the photo can be
      // added again in the builder.
      if (draft.coverPhoto) {
        try {
          const file = await coverDataUrlToFile(draft.coverPhoto);
          const upload = new FormData();
          upload.append("file", file);
          const photoRes = await fetch(`/api/invitations/${body.invitationId}/cover`, {
            method: "POST",
            body: upload,
          });
          if (!photoRes.ok) throw new Error("upload failed");
        } catch {
          setWarning(
            "Everything was saved except the cover photo. Add it again from the editor.",
          );
        }
      }

      clearDraft();
      setSaved(body as Saved);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }

    setBusy(false);
  }

  async function pay() {
    if (!saved) return;
    setPayBusy(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: saved.eventId }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) {
      setError(body.error ?? "Could not start checkout. Please try again.");
      setPayBusy(false);
      return;
    }
    location.href = body.url;
  }

  if (saved) {
    return (
      <div className="wz-fields">
        <div className="wz-done">
          <p className="kick">Saved</p>
          <h3>Your {draftLabel(draft).toLowerCase()} invitation is in your account.</h3>
          <p className="muted">
            It is a draft: only you can see it. Publishing is what puts it at
            mangalyam.my/i/{saved.slug} for your guests.
          </p>
        </div>

        {warning && <p className="notice notice-bad">{warning}</p>}
        {error && (
          <p role="alert" className="notice notice-bad">
            {error}
          </p>
        )}

        <div className="t t--2 price-card">
          <h3>{priceLabel ?? "One invitation"}</h3>
          <p className="inc">One payment for this event. No subscription.</p>
          <ul>
            {INCLUDED.map((item) => (
              <li key={item}>
                <Tick />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Button type="button" onClick={pay} disabled={payBusy || !purchasable}>
            {payBusy ? "Opening checkout…" : purchasable ? "Pay and publish" : "Not on sale yet"}
          </Button>
          {!purchasable && (
            <p className="dim wz-hint">
              Checkout is not switched on yet. Your invitation is saved and safe —
              you can keep editing it in the meantime.
            </p>
          )}
        </div>

        <div className="wz-done-links">
          <Link className="btn btn-line" href={`/dashboard/invitations/${saved.invitationId}`}>
            Open the editor
          </Link>
          <Link className="btn btn-quiet" href="/dashboard">
            Go to my dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wz-fields">
      {issues.length > 0 && (
        <div className="notice notice-bad">
          <b>A couple of things are still missing:</b>
          <ul className="wz-issues">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {signedIn ? (
        <p className="wz-note">
          Signed in as <b>{signedInEmail}</b>. Saving adds this as a new event on
          your dashboard.
        </p>
      ) : (
        <>
          <div className="wz-authtabs" role="tablist" aria-label="Account">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => setMode("signup")}
            >
              I&rsquo;m new here
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              onClick={() => setMode("signin")}
            >
              I have an account
            </button>
          </div>

          <p className="dim wz-hint" style={{ marginTop: 0 }}>
            Your draft is on this device. An account is what makes it yours,
            editable from anywhere, and publishable.
          </p>

          {mode === "signup" && (
            <Input
              id="name"
              label="Your name"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
            />
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            value={form.password}
            onChange={set("password")}
            hint={mode === "signup" ? "At least 8 characters." : undefined}
          />
        </>
      )}

      {error && (
        <p role="alert" className="notice notice-bad">
          {error}
        </p>
      )}

      <Button type="button" onClick={finish} disabled={busy || issues.length > 0}>
        {busy ? "Saving…" : signedIn ? "Save to my account" : "Create my account and save"}
      </Button>

      <p className="dim wz-hint">
        Nothing is charged here. You pay when you are ready to publish.
      </p>
    </div>
  );
}
