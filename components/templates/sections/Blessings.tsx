"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ScrollReveal } from "@/components/motion/primitives";
import { Lightbox } from "@/components/templates/shared/Lightbox";
import { alignClasses, type SectionProps } from "@/components/templates/sections/types";

/**
 * Where a guest sends gift money — moi at a wedding, a blessing at any other
 * occasion.
 *
 * Two ways in, because Malaysian guests split cleanly between them: a QR to
 * scan, and an account number to type into a banking app. A QR alone strands
 * anyone whose bank app cannot read a saved image, and a number alone loses
 * the one-tap path everybody now expects.
 *
 * The QR is offered enlarged rather than only as a thumbnail: a guest reading
 * the invitation on their only phone cannot point that phone at its own
 * screen, so the useful gesture is saving the image and handing it to their
 * bank app's own scanner.
 */
export function Blessings({ invitation, Rule, align }: SectionProps) {
  const { blessings } = invitation;
  const [qrOpen, setQrOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const hasBank = Boolean(blessings.accountNumber && blessings.bankName);
  // Turned on is not the same as filled in. A heading over an empty space
  // reads as a fault in the card, so nothing is drawn until there is
  // something to send money to.
  if (!blessings.enabled || (!blessings.qr && !hasBank)) return null;

  const a = alignClasses(align);
  const number = blessings.accountNumber ?? "";

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(number.replace(/[\s-]/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard access can be refused outright — an in-app browser, an
      // older phone. The number stays on screen as selectable text, which is
      // how it would be copied anyway, so there is nothing to apologise for.
    }
  }

  return (
    <section className="px-6 py-16" aria-labelledby="blessings-heading">
      <ScrollReveal className={a.text}>
        <h2
          id="blessings-heading"
          className="text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          Blessings
        </h2>
        <Rule className={`mt-5 ${a.block}`} />
        <p className={`mt-6 max-w-md text-[13.5px] leading-relaxed text-[var(--ds-ink-muted)] ${a.block}`}>
          {blessings.note ||
            "Your presence is the greatest blessing. For those who wish to give, the details are here."}
        </p>
      </ScrollReveal>

      <div className={`bless mt-8 max-w-md ${a.block}`}>
        {blessings.qr && (
          <div className="bless-qr">
            <button type="button" onClick={() => setQrOpen(0)} className="bless-qr-tap">
              <img
                src={blessings.qr}
                alt="Payment QR code"
                loading="lazy"
                decoding="async"
              />
            </button>
            <p>Tap to enlarge, or press and hold to save it for your banking app.</p>
          </div>
        )}

        {hasBank && (
          <dl className="bless-bank">
            <div>
              <dt>Bank</dt>
              <dd>{blessings.bankName}</dd>
            </div>
            {blessings.accountName && (
              <div>
                <dt>Account name</dt>
                <dd>{blessings.accountName}</dd>
              </div>
            )}
            <div>
              <dt>Account number</dt>
              <dd>
                <span className="bless-num">{number}</span>
                <button type="button" className="bless-copy" onClick={copyNumber}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </dd>
            </div>
          </dl>
        )}
      </div>

      {blessings.qr && (
        <Lightbox
          gallery={[{ url: blessings.qr, caption: "Payment QR code", order: 0 }]}
          index={qrOpen}
          onClose={() => setQrOpen(null)}
          onMove={setQrOpen}
        />
      )}
    </section>
  );
}
