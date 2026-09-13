"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Something threw while rendering.
 *
 * Next's default screen is a stack trace in development and a bare "something
 * went wrong" in production, neither of which belongs in front of a customer
 * mid-way through building an invitation. This says what to do, and — the part
 * that matters when they write in — shows the digest so a support email can be
 * matched to a line in the server log.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error on this page:", error);
  }, [error]);

  return (
    <div className="tone-dark">
      <main className="legal" style={{ minHeight: "62vh" }}>
        <h1>Something went wrong at our end</h1>
        <p className="legal-lede">
          This is a fault on our side, not something you did. Nothing you had
          already saved has been lost.
        </p>
        <p>
          Trying again often works — the usual cause is a request that did not
          complete. If it keeps happening, email us and quote the reference
          below.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".7rem", marginTop: "1.6rem" }}>
          <button type="button" className="btn btn-gold" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn-line" href="/">
            Back to the start
          </Link>
        </div>
        {error.digest && (
          <p className="dim" style={{ marginTop: "1.6rem" }}>
            Reference <span className="mono">{error.digest}</span>
          </p>
        )}
      </main>
    </div>
  );
}
