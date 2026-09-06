import type { CeremonyType } from "@prisma/client";
import type { ReactNode } from "react";

/**
 * One line icon per ceremony. Flat strokes at a size that stays legible —
 * these sit at 38px, where anything more detailed turns to mush.
 */
const PATHS: Record<CeremonyType, ReactNode> = {
  mehendi: (
    <><path d="M11.4 20v-6.4a1.9 1.9 0 0 1 3.8 0"/><path d="M15.2 17V9.5a1.9 1.9 0 0 1 3.8 0v7"/><path d="M19 17.3v-6.1a1.9 1.9 0 0 1 3.8 0v5.9"/><path d="M22.8 17.3v-2.6a1.9 1.9 0 0 1 3.8 0v10A8.3 8.3 0 0 1 18.3 33h-1.4a6.6 6.6 0 0 1-6.6-6.6V20"/><circle cx="18.5" cy="24.8" r="2.2"/></>
  ),
  haldi: (
    <><path d="M6.5 18.5h25"/><path d="M9 18.5a10 10 0 0 0 20 0"/><path d="M15.5 15c0-2.4 1.5-3.8 3.5-3.8s3.5 1.4 3.5 3.8"/><circle cx="13" cy="10.5" r="1.2"/><circle cx="25" cy="11.4" r="1.2"/></>
  ),
  sangeet: (
    <><ellipse cx="9" cy="19" rx="2.8" ry="6.6"/><ellipse cx="29" cy="19" rx="4" ry="9"/><path d="M9 12.4c7-1.9 13-2.8 20-2.8M9 25.6c7 1.9 13 2.8 20 2.8"/><path d="M11.8 15.9c6-1.2 10.7-1.7 15.4-1.9"/></>
  ),
  muhurtham: (
    <><path d="M6.5 10c4 7 8.3 10.7 12.5 10.7S27.5 17 31.5 10"/><path d="M19 20.7v2.8"/><path d="M19 23.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/><circle cx="19" cy="28.5" r="1.5"/></>
  ),
  nalangu: (
    <><circle cx="19" cy="22" r="9.5"/><path d="M19 12.5c-1.7-3.1-.7-5.7-.7-5.7s2.4 2.1 1.7 5.5"/><circle cx="15.5" cy="19.7" r="1.2"/><circle cx="22.5" cy="19.7" r="1.2"/><circle cx="19" cy="24.5" r="1.2"/></>
  ),
  baraat: (
    <><path d="M19 7v4"/><path d="M6 17c0-5.5 5.8-9 13-9s13 3.5 13 9z"/><path d="M6 17h26"/><path d="M19 17v10"/><path d="M12.5 27h13l-1.6 5h-9.8z"/></>
  ),
  reception: (
    <><g><circle cx="8.7" cy="16.8" r="2.2"/><circle cx="12.2" cy="12.5" r="2.2"/><circle cx="17.9" cy="10.6" r="2.2"/><circle cx="23.8" cy="11.5" r="2.2"/><circle cx="28.3" cy="15.0" r="2.2"/><circle cx="30.0" cy="20.0" r="2.2"/><circle cx="28.3" cy="25.0" r="2.2"/><circle cx="23.8" cy="28.5" r="2.2"/><circle cx="17.9" cy="29.4" r="2.2"/><circle cx="12.2" cy="27.5" r="2.2"/><circle cx="8.7" cy="23.2" r="2.2"/></g><path d="M7 14.8c1.9-4 6.4-6.5 12-6.5s10.1 2.5 12 6.5"/></>
  ),
  engagement: (
    <><circle cx="15" cy="22" r="7.4"/><circle cx="23" cy="22" r="7.4"/><path d="M12.3 11.8h5.2l-2.6 3.1z"/></>
  ),
  custom: (
    <><circle cx="10.5" cy="20" r="2.2"/><circle cx="19" cy="20" r="2.2"/><circle cx="27.5" cy="20" r="2.2"/></>
  ),
};

export function CeremonyIcon({
  ceremony,
  className,
}: {
  ceremony: CeremonyType;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 38 38"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[ceremony]}
    </svg>
  );
}
