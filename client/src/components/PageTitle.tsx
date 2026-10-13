import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const MAX_PX = 28;
const MIN_PX = 20;

/**
 * The page title (UI rule 1): Fraunces 28px gold, left, one line. A title
 * too long for the screen shrinks until it fits on one line (down to 20px,
 * then it ellipsizes) instead of wrapping.
 */
export function PageTitle({
  children,
  className,
  "data-testid": testId,
}: {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = `${MAX_PX}px`;
      const available = el.clientWidth;
      const needed = el.scrollWidth;
      if (available > 0 && needed > available) {
        const px = Math.max(MIN_PX, Math.floor((MAX_PX * available) / needed));
        el.style.fontSize = `${px}px`;
      }
    };
    fit();
    // Fonts load after first paint and the width can change; refit then.
    document.fonts?.ready.then(fit).catch(() => {});
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [children]);

  return (
    <h1 ref={ref} className={cn("page-title", className)} data-testid={testId}>
      {children}
    </h1>
  );
}
