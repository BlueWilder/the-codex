import type { DeathRecord } from "@/hooks/use-player-game";

export function latestDeathRecord(
  deathRecords: DeathRecord[],
  playerId: string,
): DeathRecord | null {
  const phaseRank = (p: DeathRecord['phase']) => (p === 'night' ? 0 : 1);
  return (
    deathRecords
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.playerId === playerId)
      .sort((a, b) =>
        a.r.day - b.r.day ||
        phaseRank(a.r.phase) - phaseRank(b.r.phase) ||
        a.i - b.i,
      )
      .at(-1)?.r ?? null
  );
}

/**
 * The dagger phase-label string for a death record, e.g. N1 / D2. Shared by the
 * circle node and the List row so both views show an identical stamp. Exported
 * for tests.
 */
export function deathPhaseLabel(record: DeathRecord | null | undefined): string | null {
  return record ? `${record.phase === 'night' ? 'N' : 'D'}${record.day}` : null;
}
