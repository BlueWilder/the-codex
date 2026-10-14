import * as React from "react"

/** Parchment surfaces: sheets, dialogs and panels (CLAUDE.md "Game Mode visual system"). */
export const PARCHMENT_SURFACE = ".parchment-scope, .game-panel"

/**
 * Classes for a menu, popover or select list opened from parchment: raised
 * fill, ink text, 1px border, 10px radius. `parchment-scope` re-points the
 * shadcn color variables so focus and muted states read as ink on parchment.
 */
export const parchmentPopupClass =
  "parchment-scope rounded-[10px] border border-[var(--parchment-border)] bg-[var(--parchment-raised)] text-[var(--parchment-ink)]"

/** Rows inside a parchment popup: 44px tall, ink-muted icons. */
export const parchmentItemClass =
  "min-h-11 text-[var(--parchment-ink)] [&_svg]:text-[var(--parchment-ink-muted)]"

/** True inside a menu, popover or select list that opened from parchment. */
export const ParchmentPopupContext = React.createContext(false)

/**
 * Radix portals render popups outside the surface they open from, so CSS
 * scope can't reach them. Radix points the trigger at its content through
 * aria-controls; find it and check whether it sits on parchment. The ref runs
 * in the commit phase, so the parchment styling is in place before paint.
 */
export function useParchmentPopup<T extends HTMLElement>(
  forwardedRef: React.ForwardedRef<T>,
): [React.RefCallback<T>, boolean] {
  const [parchment, setParchment] = React.useState(false)
  const ref = React.useCallback(
    (node: T | null) => {
      if (typeof forwardedRef === "function") forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
      if (node) setParchment(openedFromParchment(node))
    },
    [forwardedRef],
  )
  return [ref, parchment]
}

function openedFromParchment(content: HTMLElement): boolean {
  if (!content.id) return false
  const trigger = content.ownerDocument.querySelector(`[aria-controls="${content.id}"]`)
  return !!trigger?.closest(PARCHMENT_SURFACE)
}
