import { Fragment, type ReactNode } from "react";

/**
 * Titles are set in Cormorant Garamond, but any numeral inside a title is set
 * in EB Garamond. A typeface cannot substitute another family's digits on its
 * own, so digit runs are wrapped here rather than left to whoever writes the
 * copy to remember.
 *
 * Use it for display text only — body copy is Jost, whose own figures are fine.
 */
export function withFigures(text: string): ReactNode {
  const parts = text.split(/(\d[\d.,:/]*)/g);
  return parts.map((part, i) =>
    /^\d/.test(part) ? (
      <span key={i} className="num">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
