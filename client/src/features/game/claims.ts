import { ALL_CHARACTERS } from "@/lib/game-data";
import { type ClaimDescriptor, type GamePlayer } from "@/features/game/types";

export const GENERIC_TRAVELLER_ID = 'generic-traveller';

export function resolveClaimDescriptor(id: string): ClaimDescriptor | null {
  if (id === GENERIC_TRAVELLER_ID) {
    return { id: GENERIC_TRAVELLER_ID, name: 'Traveller', team: 'traveler' };
  }
  const char = ALL_CHARACTERS.find(c => c.id === id);
  return char ? { id: char.id, name: char.name, team: char.team } : null;
}

/**
 * The claim this player made most recently: the claim whose record has the
 * latest addedAt. Claims added in one batch share a timestamp, so ties go to
 * the later position in `claims` (claims are appended in the order made).
 * Claims without a record (legacy saves) count as oldest, so a legacy game
 * with no records at all falls back to the last claim in the array.
 */
export function latestClaimId(player: GamePlayer): string | null {
  const claims = player.claims ?? [];
  const records = player.claimRecords ?? [];
  let best: string | null = null;
  let bestAt = '';
  for (const id of claims) {
    const at = records.find(r => r.characterId === id)?.addedAt ?? '';
    if (best === null || at >= bestAt) {
      best = id;
      bestAt = at;
    }
  }
  return best;
}
