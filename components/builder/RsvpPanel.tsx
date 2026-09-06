"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { withFigures } from "@/lib/typography";

interface Rsvp {
  id: string;
  guestName: string;
  attending: boolean;
  guestCount: number;
  mealPreference: string | null;
  message: string | null;
  createdAt: string;
}

interface Summary {
  replies: number;
  attending: number;
  heads: number;
}

export function RsvpPanel({
  invitationId,
  enabled,
  published,
}: {
  invitationId: string;
  enabled: boolean;
  published: boolean;
}) {
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/invitations/${invitationId}/rsvps`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((data) => {
        if (cancelled) return;
        setRsvps(data.rsvps);
        setSummary(data.summary);
      })
      .catch(() => !cancelled && setError("Could not load replies."));
    return () => {
      cancelled = true;
    };
  }, [invitationId]);

  if (!enabled) {
    return (
      <p className="dim" style={{ fontSize: "var(--t-sm)" }}>
        RSVP is switched off for this ceremony. Turn it on under Settings to start
        collecting replies.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      {!published && (
        <p className="notice notice-bad">
          This invitation is still a draft, so guests cannot reply yet. Publish it to
          open replies.
        </p>
      )}

      {summary && (
        <div className="bento">
          <div className="t t--2 c4 rsvp-stat">
            <b>{withFigures(String(summary.replies))}</b>
            <span>replies</span>
          </div>
          <div className="t t--2 c4 rsvp-stat">
            <b>{withFigures(String(summary.attending))}</b>
            <span>saying yes</span>
          </div>
          <div className="t t--2 c4 rsvp-stat">
            <b>{withFigures(String(summary.heads))}</b>
            <span>people expected</span>
          </div>
        </div>
      )}

      {error && <p className="notice notice-bad">{error}</p>}

      {rsvps === null && !error && (
        <p className="dim" style={{ fontSize: "var(--t-sm)" }}>Loading replies…</p>
      )}

      {rsvps?.length === 0 && (
        <p className="dim" style={{ fontSize: "var(--t-sm)" }}>
          No replies yet. They will appear here as guests answer.
        </p>
      )}

      {rsvps && rsvps.length > 0 && (
        <>
          <div className="rsvp-table-wrap">
            <table className="rsvp-table">
              <caption className="sr-only">Guest replies for this ceremony</caption>
              <thead>
                <tr>
                  <th scope="col">Guest</th>
                  <th scope="col">Reply</th>
                  <th scope="col">Party</th>
                  <th scope="col">Meal</th>
                  <th scope="col">Message</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r) => (
                  <tr key={r.id}>
                    <td>{r.guestName}</td>
                    <td className={r.attending ? "yes" : "no"}>
                      {r.attending ? "Attending" : "Can't make it"}
                    </td>
                    <td className="num">{r.attending ? r.guestCount : "—"}</td>
                    <td>{r.mealPreference ?? "—"}</td>
                    <td className="msg">{r.message ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <ButtonLink
              variant="line"
              size="sm"
              href={`/api/invitations/${invitationId}/rsvps/export`}
              prefetch={false}
            >
              Download CSV
            </ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}
