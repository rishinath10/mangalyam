"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { EventType } from "@prisma/client";
import { DesignCard } from "@/components/site/DesignCard";
import { composeInvitationJson, type InvitationSource } from "@/lib/invitation/compose";
import { EVENT_TYPE_LABELS } from "@/lib/events";
import type { TemplateManifest } from "@/lib/templates/types";

/**
 * The real renderer, and everything it drags in, only once the section is
 * near the screen. The landing page is read by far more people than ever
 * scroll this far, and they should not pay for an invitation engine to read
 * a headline.
 */
const PreviewPane = dynamic(
  () => import("@/components/builder/PreviewPane").then((m) => m.PreviewPane),
  { ssr: false },
);

const SAMPLE_COUPLE = "Ashwin & Kalyani";
const SAMPLE_FAMILY = "The Kumar Family";

/** A whole, believable invitation for a design to be shown wearing. */
function sampleSource(design: TemplateManifest, date: string): InvitationSource {
  const wedding = design.eventTypes.includes("wedding");
  const eventType: EventType = wedding
    ? "wedding"
    : (design.eventTypes.find((t) => t !== "custom") ?? "custom");

  return {
    invitationId: "sample",
    eventId: "sample",
    slug: wedding ? "ashwin-kalyani" : "the-kumar-family",
    eventType,
    ceremonyType: wedding ? "muhurtham" : null,
    customCeremonyName: null,
    templateId: design.templateId,
    accentKey: null,
    fontPairing: null,
    hostNames: wedding ? SAMPLE_COUPLE : SAMPLE_FAMILY,
    coverPhotoUrl: null,
    frameUrl: null,
    design,
    description: wedding
      ? "With our families’ blessings, we invite you to share the morning we begin."
      : "Our doors are open and the lamps are lit. Come as you are, and stay for lunch.",
    date,
    startTime: wedding ? "07:30" : "10:00",
    endTime: wedding ? "12:00" : "14:00",
    venueName: wedding ? "Sri Kandaswamy Kovil Hall" : "Our home",
    address: wedding ? "Jalan Scott, Brickfields\n50470 Kuala Lumpur" : "Taman Tun Dr Ismail, Kuala Lumpur",
    mapLink: "https://maps.google.com",
    schedule: wedding
      ? [
          { time: "07:30", title: "Guests arrive", description: "Coffee and nadaswaram in the hall" },
          { time: "08:15", title: "Muhurtham", description: "The tying of the thali" },
          { time: "11:00", title: "Wedding lunch", description: "Banana leaf, served downstairs" },
        ]
      : [
          { time: "10:00", title: "Pooja", description: "Led by our family priest" },
          { time: "11:30", title: "Lunch", description: "Vegetarian, home-cooked" },
        ],
    photos: [],
    greetings: [
      { guestName: "Aunty Selvi", message: "So happy for you. We will be there!", at: "2026-01-01T00:00:00.000Z" },
    ],
    settings: {
      musicEnabled: false,
      musicUrl: null,
      countdownEnabled: true,
      galleryEnabled: true,
      rsvpEnabled: true,
      askMealPreference: false,
      rsvpCloseDate: null,
      openingStyle: "doors",
      openingText: null,
      autoScroll: true,
      contactName: null,
      contactPhone: null,
      // Thiruvonam in Magaram, Rohini in Rishabam: a couple's two stars, so
      // the sample shows the constellations joining.
      starOne: wedding ? 21 : null,
      raasiOne: wedding ? 9 : null,
      starTwo: wedding ? 3 : null,
      raasiTwo: wedding ? 1 : null,
      giftsEnabled: false,
      giftNote: null,
      giftQrUrl: null,
      giftBankName: null,
      giftAccountName: null,
      giftAccountNumber: null,
    },
  };
}

/**
 * Every design, and a phone showing the chosen one as a guest would get it.
 *
 * The phone is not a picture of an invitation: it is the invitation, the same
 * renderer the published page mounts, sealed and waiting to be tapped. Picking
 * another design remounts it, so each one is met the way a guest meets it —
 * closed first.
 */
export function DesignShowcase({
  designs,
  sampleDate,
}: {
  designs: TemplateManifest[];
  /** A date a couple of months out, decided on the server so both agree. */
  sampleDate: string;
}) {
  const [chosen, setChosen] = useState(designs[0]?.templateId ?? "");
  const [near, setNear] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const design = designs.find((d) => d.templateId === chosen) ?? designs[0];
  const invitation = useMemo(
    () => (design ? composeInvitationJson(sampleSource(design, sampleDate)) : null),
    [design, sampleDate],
  );
  if (!design || !invitation) return null;

  return (
    <div className="show" ref={ref}>
      <div className="show-shelf" role="radiogroup" aria-label="Designs">
        {designs.map((d) => {
          const wedding = d.eventTypes.includes("wedding");
          const occasion = d.eventTypes.find((t) => t !== "custom") ?? "custom";
          return (
            <button
              key={d.templateId}
              type="button"
              role="radio"
              aria-checked={d.templateId === design.templateId}
              className="show-pick"
              onClick={() => setChosen(d.templateId)}
            >
              <DesignCard
                design={d}
                coupleLine={wedding ? SAMPLE_COUPLE : SAMPLE_FAMILY}
                ceremonyLabel={wedding ? "Muhurtham" : EVENT_TYPE_LABELS[occasion]}
              />
              <span className="show-pick-cap">
                <b>{d.name}</b>
              </span>
            </button>
          );
        })}
      </div>

      <div className="show-stage">
        <div className="show-phone">
          {near ? (
            // Keyed by design: a new choice is a new invitation, sealed again.
            <PreviewPane key={design.templateId} invitation={invitation} slug={invitation.slug} />
          ) : (
            <div className="phone">
              <div className="phone-screen">
                <div className="phone-scroll" />
              </div>
            </div>
          )}
        </div>
        <div className="show-about">
          <p className="kick">A real invitation, not a picture of one</p>
          <h3>{design.name}</h3>
          <p className="muted">{design.tagline}. Tap the seal and scroll, exactly as your guests will.</p>
          <ul className="show-swatches" aria-label={`${design.name} accent colours`}>
            {design.accents.map((a) => (
              <li key={a.key} title={a.name}>
                <i style={{ background: a.hex }} />
                <span>{a.name}</span>
              </li>
            ))}
          </ul>
          <Link className="btn btn-gold" href="/create">
            Start with {design.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
