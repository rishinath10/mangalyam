"use client";

/**
 * The last resort: the root layout itself failed, so there is no shell to
 * render inside and no stylesheet to rely on. Everything here is inline for
 * that reason — this file has to work when nothing else did.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#1A0409",
          color: "#F2E7D3",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 400 }}>
            Mangalyam.my is having a problem
          </h1>
          <p style={{ color: "#BFA98B", lineHeight: 1.7 }}>
            Something failed before the page could load. Please try again in a
            moment — and if it keeps happening, email artenginemy@gmail.com and
            quote the reference below.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.4rem",
              padding: ".7rem 1.6rem",
              borderRadius: 999,
              border: "1px solid #C9A227",
              background: "transparent",
              color: "#EBD79B",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: "1.4rem", fontSize: ".78rem", color: "#8B7660" }}>
              Reference {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
