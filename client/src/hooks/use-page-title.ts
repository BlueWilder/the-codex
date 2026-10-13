import { useEffect } from "react";

/**
 * Browser tab title (UI rule 7): "The Codex" on Home, "<Page> · The Codex"
 * elsewhere. server/seo.ts sets the same titles on first load; this keeps
 * them right as the app navigates client-side.
 */
export function usePageTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} · The Codex` : "The Codex";
  }, [page]);
}
