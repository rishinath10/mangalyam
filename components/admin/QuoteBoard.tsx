"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QUOTE_STATUSES } from "@/lib/admin/schemas";

type Quote = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  occasion: string | null;
  details: string;
  amountSen: number | null;
  status: string;
  notes: string | null;
  createdAt: string | Date;
};

const BLANK = { name: "", email: "", phone: "", occasion: "", details: "", amount: "", notes: "" };

/**
 * Custom jobs — multiple ceremonies, bespoke work, anything outside the flat
 * price. Enquiries arrive over WhatsApp or email from people who usually have
 * no account, so quotes are typed in here rather than arriving through a form.
 */
export function QuoteBoard({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState(BLANK);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send(url: string, method: string, body?: unknown) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Something went wrong");
      }
      router.refresh();
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const ok = await send("/api/admin/quotes", "POST", {
      ...draft,
      // The form collects ringgit; the API converts to sen. Empty means "not
      // quoted yet", which is not the same as zero.
      amount: draft.amount === "" ? null : Number(draft.amount),
    });
    if (ok) {
      setDraft(BLANK);
      setOpen(false);
    }
  }

  return (
    <>
      {err && <p className="notice notice-bad" style={{ marginBottom: "1rem" }}>{err}</p>}

      <div style={{ marginBottom: "1.4rem" }}>
        <Button type="button" variant={open ? "line" : "gold"} onClick={() => setOpen(!open)}>
          {open ? "Cancel" : "Log a quote"}
        </Button>
      </div>

      {open && (
        <form className="panel" onSubmit={create} style={{ marginBottom: "1.6rem" }}>
          <h2>New quote</h2>
          <div className="form-grid two">
            <label>
              <span className="field-label">Name</span>
              <input required maxLength={120} value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              <span className="field-label">Occasion</span>
              <input maxLength={160} placeholder="Wedding, three ceremonies" value={draft.occasion}
                onChange={(e) => setDraft({ ...draft, occasion: e.target.value })} />
            </label>
            <label>
              <span className="field-label">Email</span>
              <input type="email" maxLength={200} value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </label>
            <label>
              <span className="field-label">Phone</span>
              <input maxLength={40} placeholder="+60…" value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </label>
          </div>
          <label style={{ display: "block", marginTop: "1rem" }}>
            <span className="field-label">What they want</span>
            <textarea required rows={4} maxLength={4000} value={draft.details}
              onChange={(e) => setDraft({ ...draft, details: e.target.value })} />
          </label>
          <label style={{ display: "block", marginTop: "1rem", maxWidth: 220 }}>
            <span className="field-label">Amount (RM, optional)</span>
            <input type="number" min={0} step="0.01" value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
          </label>
          <div style={{ marginTop: "1.2rem" }}>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save quote"}</Button>
          </div>
        </form>
      )}

      {quotes.length === 0 ? (
        <p className="muted">No quotes logged.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {quotes.map((q) => (
            <article className="panel quote" key={q.id}>
              <div className="panel-head">
                <div>
                  <h2>{q.name}</h2>
                  <p className="muted">
                    {[q.occasion, q.email, q.phone].filter(Boolean).join(" · ") || "No contact details"}
                  </p>
                </div>
                <span className={`pill pill-${q.status}`}>{q.status}</span>
              </div>

              <p className="quote-details">{q.details}</p>
              {q.notes && <p className="dim quote-notes">{q.notes}</p>}

              <div className="admin-actions">
                <label htmlFor={`st-${q.id}`}>Status</label>
                <select
                  id={`st-${q.id}`}
                  defaultValue={q.status}
                  disabled={busy}
                  onChange={(e) => send(`/api/admin/quotes/${q.id}`, "PATCH", { status: e.target.value })}
                >
                  {QUOTE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <span className="dim" style={{ fontSize: "var(--t-xs)" }}>
                  {q.amountSen === null
                    ? "Not yet quoted"
                    : `RM ${(q.amountSen / 100).toFixed(2)}`}
                </span>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    if (confirm(`Delete the quote from ${q.name}? This cannot be undone.`)) {
                      void send(`/api/admin/quotes/${q.id}`, "DELETE");
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
