"use client";

import { useState } from "react";

/**
 * Copies an invitation's public address. Takes a path, not a URL: the origin
 * is only knowable in the browser, and it differs between a preview deploy
 * and mangalyam.my.
 */
export function CopyLink({ path, className = "btn btn-line btn-sm" }: { path: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${location.origin}${path}`);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2200);
  }

  return (
    <button type="button" className={className} onClick={copy} aria-live="polite">
      {state === "copied" ? "Copied" : state === "failed" ? "Could not copy" : "Copy link"}
    </button>
  );
}
