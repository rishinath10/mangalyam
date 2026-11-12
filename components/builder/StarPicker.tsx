"use client";

import { useState } from "react";
import {
  BIRTH_PLACES,
  RAASIS,
  birthStar,
  raasisOfStar,
  starNames,
  type BirthPlaceId,
} from "@/lib/birthstar";
import { NAKSHATRAS, NAKSHATRAS_SANSKRIT } from "@/lib/panchangam";

/**
 * One person's birth star for the invitation.
 *
 * Most hosts know the star by name and just pick it. For anyone who does not,
 * the same calculation as the landing page is tucked underneath — and the
 * birthday typed into it stays in this component. Only the star and the sign
 * are handed up to be saved; the invitation is a public page, and a date of
 * birth should not be recoverable from it.
 */
export function StarPicker({
  id,
  label,
  star,
  raasi,
  onChange,
}: {
  id: string;
  label: string;
  star: number | null;
  raasi: number | null;
  onChange: (next: { star: number | null; raasi: number | null }) => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState<BirthPlaceId>("my");
  const [note, setNote] = useState<string | null>(null);

  const allowed = star === null ? [] : raasisOfStar(star);

  function pick(value: string) {
    setNote(null);
    if (value === "") return onChange({ star: null, raasi: null });
    const next = Number(value);
    onChange({ star: next, raasi: raasisOfStar(next)[0] });
  }

  function workOut() {
    const found = birthStar(date, time || null, place);
    if (!found) {
      setNote("Enter the birth date first.");
      return;
    }
    onChange({ star: found.position.star, raasi: found.position.raasi });
    const names = starNames(found.position.star);
    if (found.alternative) {
      const other = starNames(found.alternative.star);
      setNote(
        found.doubt === "no-time"
          ? `Set to ${names.tamil}. The Moon changed star that day, so it could also be ${other.tamil} — add the birth time to be sure.`
          : `Set to ${names.tamil}, but the Moon was within an hour of ${other.tamil}. Check against the family's own chart.`,
      );
    } else {
      setNote(`Set to ${names.tamil}, raasi ${RAASIS[found.position.raasi].tamil}.`);
    }
  }

  return (
    <div className="starpick">
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <select id={id} value={star ?? ""} onChange={(e) => pick(e.target.value)}>
          <option value="">Not shown</option>
          {NAKSHATRAS.map((name, i) => (
            <option key={name} value={i}>
              {name} ({NAKSHATRAS_SANSKRIT[i]})
            </option>
          ))}
        </select>
      </div>

      {/* Nine stars straddle two signs; only then is there anything to ask. */}
      {star !== null && allowed.length > 1 && (
        <div className="field">
          <label htmlFor={`${id}-raasi`}>Raasi</label>
          <select
            id={`${id}-raasi`}
            value={raasi ?? allowed[0]}
            onChange={(e) => onChange({ star, raasi: Number(e.target.value) })}
          >
            {allowed.map((r) => (
              <option key={r} value={r}>
                {RAASIS[r].tamil} ({RAASIS[r].western})
              </option>
            ))}
          </select>
        </div>
      )}

      <details className="starpick-find">
        <summary>Not sure? Work it out from a birthday</summary>
        <div className="starpick-grid">
          <div className="field">
            <label htmlFor={`${id}-date`}>Birth date</label>
            <input
              id={`${id}-date`}
              type="date"
              min="1900-01-01"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={`${id}-time`}>Time, if known</label>
            <input
              id={`${id}-time`}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={`${id}-place`}>Born in</label>
            <select
              id={`${id}-place`}
              value={place}
              onChange={(e) => setPlace(e.target.value as BirthPlaceId)}
            >
              {BIRTH_PLACES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" className="btn btn-line btn-sm" onClick={workOut}>
          Find the star
        </button>
        <p className="dim starpick-hint">
          The birthday is only used here to find the star. It is not saved and does
          not appear on the invitation.
        </p>
      </details>

      {note && (
        <p className="notice notice-good" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
