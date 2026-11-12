"use client";

import { useEffect, useState } from "react";

/**
 * The moment an invitation goes live, and everything a host does next.
 *
 * Publishing used to end on a status pill changing colour, which is a strange
 * way to mark the thing the whole product is for. This is the link, set large
 * enough to read; the two ways it actually travels — WhatsApp first, because
 * that is where every family group is — and a QR code for the printed card
 * that still goes to the grandparents.
 *
 * `celebrate` plays the seal once. A caller showing an invitation that was
 * already live passes false and gets the same tools without the ceremony.
 */
export function LiveMoment({
  url,
  message,
  title,
  celebrate = true,
  children,
}: {
  /** The full public address, origin included. */
  url: string;
  /** What is sent with the link when it is shared. */
  message: string;
  /** Whose invitation it is — the file name of the QR code, the share title. */
  title: string;
  celebrate?: boolean;
  /** Extra actions, placed after the standard ones. */
  children?: React.ReactNode;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  // The QR library is a few dozen kilobytes nobody needs until this exact
  // moment, so it is fetched here rather than shipped with the editor.
  useEffect(() => {
    let live = true;
    import("qrcode")
      .then((QR) =>
        QR.toDataURL(url, {
          width: 640,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#2B1410", light: "#FFFFFF" },
        }),
      )
      .then((data) => live && setQr(data))
      // No code is not worth an error: the link and the buttons still work.
      .catch(() => live && setQr(null));
    return () => {
      live = false;
    };
  }, [url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Your browser blocked copying. Press and hold the link to copy it.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title, text: message, url });
    } catch {
      // Closing the share sheet is not a failure.
    }
  }

  return (
    <div className="live" data-celebrate={celebrate || undefined}>
      <div className="live-head">
        <span className="live-seal" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="21" pathLength="1" />
            <path d="M15 24.5l6.2 6.2L33.5 18" pathLength="1" />
          </svg>
        </span>
        <div>
          <p className="kick">Published</p>
          <h3>Your invitation is live</h3>
        </div>
      </div>

      <a className="live-link" href={url} target="_blank" rel="noopener noreferrer">
        {url.replace(/^https?:\/\//, "")}
      </a>

      {error && (
        <p role="alert" className="notice notice-bad">
          {error}
        </p>
      )}

      <div className="live-grid">
        <div className="live-actions">
          <a
            className="btn btn-gold"
            href={`https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Send on WhatsApp
          </a>
          <button type="button" className="btn btn-line" onClick={copy}>
            {copied ? "Copied" : "Copy link"}
          </button>
          {canShare && (
            <button type="button" className="btn btn-line" onClick={share}>
              Share…
            </button>
          )}
          {children}
        </div>

        <div className="live-qr">
          {qr ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt={`QR code that opens ${title}'s invitation`} width={160} height={160} />
              <a
                className="live-qr-save"
                href={qr}
                download={`${title.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "invitation"}-qr.png`}
              >
                Save the QR code
              </a>
            </>
          ) : (
            <span className="live-qr-wait" aria-hidden="true" />
          )}
          <p>For the printed card: scanning it opens the invitation.</p>
        </div>
      </div>
    </div>
  );
}
