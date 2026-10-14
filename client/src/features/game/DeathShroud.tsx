import { cn } from "@/lib/utils";

/**
 * The Circle view's death marker: a small charcoal cloth hung over the top of
 * a seat medallion. It starts above the medallion's top edge and falls over
 * roughly its upper 55%, so the character art still shows underneath. Drawn
 * in a fixed viewBox and sized from the medallion, so it scales with the
 * 72 / 60 / 52px seat steps.
 */
export function DeathShroud({
  size,
  className,
  "data-testid": testId,
}: {
  /** Medallion diameter in px. */
  size: number;
  className?: string;
  "data-testid"?: string;
}) {
  const width = size * 0.6;
  const height = size * 0.75;
  // Hangs from 15% of the medallion above its top edge to about 55% down it.
  const top = -size * 0.15;
  return (
    <svg
      viewBox="0 0 60 72"
      width={width}
      height={height}
      className={cn("pointer-events-none absolute left-1/2 -translate-x-1/2", className)}
      style={{ top, filter: "drop-shadow(0 1.5px 1.5px rgba(0, 0, 0, 0.45))" }}
      aria-label="Dead"
      role="img"
      data-testid={testId}
    >
      {/* Body: a lopsided gather where it hangs, shoulders sloping over the
          medallion's top edge, sides with a slight ripple, and an uneven hem
          with one corner left dangling lower, like a handkerchief. */}
      <path
        d="M25.5 5.5 C26 3 28 2 30 2.3 C32.5 2.6 34.5 3.6 34.5 6
           C38.5 8.5 42 13 43.5 19 C45 25 44.5 30 46 35 C47.5 40 49.5 44 50 50
           C50.5 55 51.5 59 53 62
           C50.5 62.5 48.5 61 46 61.5 C43.5 62 42.5 64.5 39.5 64.5 C37 64.5 36 60.5 33.5 60.5
           C31 60.5 30 64 27.5 65 C25.5 65.8 24 63 21.5 63.5 C19 64 17.5 66 15.5 67.5
           C13.5 69 11 70.5 8.5 70.5
           C9.5 66 10.5 60 11 55 C11.5 49 12.5 44 14 39 C15.5 34 15 29 16.5 23.5
           C18 17 21 9.5 25.5 5.5 Z"
        fill="#3a3632"
        stroke="#1f1c19"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Soft folds: creases from the gather into the hem's notches and the
          long corner, faint highlights down the bulges between them. */}
      <g fill="none" strokeLinecap="round">
        <path d="M28.5 7 C26 24 21 44 15.5 65" stroke="#1f1c19" strokeOpacity="0.55" strokeWidth="1.3" />
        <path d="M31 7.5 C32 25 33 44 33.5 59" stroke="#1f1c19" strokeOpacity="0.55" strokeWidth="1.2" />
        <path d="M33.5 7.5 C38 22 43 40 46 60" stroke="#1f1c19" strokeOpacity="0.5" strokeWidth="1.2" />
        <path d="M30 10 C29.5 30 28.5 48 27.5 62.5" stroke="#635c54" strokeOpacity="0.5" strokeWidth="1" />
        <path d="M32.5 11 C36 28 38.5 46 39.5 62" stroke="#635c54" strokeOpacity="0.45" strokeWidth="1" />
        <path d="M26.5 10 C23 28 20.5 46 21 61.5" stroke="#635c54" strokeOpacity="0.4" strokeWidth="0.9" />
      </g>
      {/* The gather's underside. */}
      <path d="M25.8 6.2 C28.5 8 32 8 34.3 6.5" fill="none" stroke="#1f1c19" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
