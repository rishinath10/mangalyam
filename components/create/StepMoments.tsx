"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { toCoverDataUrl } from "@/lib/draft-storage";
import type { InvitationDraft } from "@/lib/draft";

const MAX_STEPS = 30;

/**
 * The cover photo and the run of the day.
 *
 * Nothing here is uploaded: there is no account yet and so no invitation to
 * attach a file to. The photo is re-encoded to a phone-sized JPEG in the
 * browser, kept with the rest of the draft, and sent up through the ordinary
 * cover route the moment the invitation exists.
 */
export function StepMoments({
  draft,
  onDraft,
}: {
  draft: InvitationDraft;
  onDraft: (draft: InvitationDraft) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const schedule = draft.schedule;

  const setSchedule = (next: InvitationDraft["schedule"]) =>
    onDraft({ ...draft, schedule: next });

  const update = (index: number, patch: Partial<InvitationDraft["schedule"][number]>) =>
    setSchedule(schedule.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= schedule.length) return;
    const next = [...schedule];
    [next[index], next[target]] = [next[target], next[index]];
    setSchedule(next);
  };

  async function pickPhoto(file: File) {
    setBusy(true);
    setError(null);
    try {
      onDraft({ ...draft, coverPhoto: await toCoverDataUrl(file) });
    } catch {
      setError("That file could not be read as an image. Try a JPEG or PNG.");
    }
    setBusy(false);
  }

  return (
    <div className="wz-fields">
      <div>
        <span className="field-label">Cover photo</span>
        <p className="dim wz-hint" style={{ marginTop: "-.2rem", marginBottom: ".8rem" }}>
          Sits behind your names as texture, softened so the lettering stays
          readable. A portrait photo works best.
        </p>

        {draft.coverPhoto ? (
          <div className="cover-pick">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draft.coverPhoto} alt="Your chosen cover" />
            <div>
              <p className="dim wz-hint" style={{ marginTop: 0 }}>
                Saved with your draft on this device.
              </p>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => onDraft({ ...draft, coverPhoto: null })}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            className="filedrop"
            aria-label="Choose a cover photo"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pickPhoto(file);
              e.target.value = "";
            }}
          />
        )}
        {busy && <p className="dim wz-hint">Preparing the photo…</p>}
        {error && (
          <p role="alert" className="notice notice-bad" style={{ marginTop: ".7rem" }}>
            {error}
          </p>
        )}
      </div>

      <div>
        <span className="field-label">The run of the day</span>
        <p className="dim wz-hint" style={{ marginTop: "-.2rem", marginBottom: ".8rem" }}>
          Optional. Guests read it to work out when to arrive.
        </p>

        <div className="wz-fields">
          {schedule.map((item, index) => (
            <div key={index} className="tl-item">
              <div className="form-grid" style={{ gridTemplateColumns: "8rem 1fr" }}>
                <Input
                  aria-label={`Time for step ${index + 1}`}
                  type="time"
                  value={item.time}
                  onChange={(e) => update(index, { time: e.target.value })}
                />
                <Input
                  aria-label={`Title for step ${index + 1}`}
                  placeholder="Arrival of the bride"
                  maxLength={80}
                  value={item.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </div>
              <Input
                aria-label={`Detail for step ${index + 1}`}
                placeholder="Optional detail"
                maxLength={300}
                value={item.description ?? ""}
                onChange={(e) => update(index, { description: e.target.value || null })}
              />
              <div className="acts">
                <Button
                  type="button"
                  variant="quiet"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑ Up
                </Button>
                <Button
                  type="button"
                  variant="quiet"
                  size="sm"
                  disabled={index === schedule.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓ Down
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  style={{ marginLeft: "auto" }}
                  onClick={() => setSchedule(schedule.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {schedule.length < MAX_STEPS && (
            <Button
              type="button"
              variant="line"
              onClick={() =>
                setSchedule([...schedule, { time: "09:00", title: "", description: null }])
              }
            >
              + Add a step
            </Button>
          )}
        </div>
      </div>

      <p className="dim wz-note">
        A photo gallery can go in once the invitation is saved — those go
        straight to your account rather than into this draft.
      </p>
    </div>
  );
}
