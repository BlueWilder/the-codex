import { ALL_CHARACTERS } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { teamBadge, teamCard, teamRing } from "@/lib/team-style";
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
 * Candidate chip styling. The primary claim renders as a filled team-colored
 * pill (the existing badge style); alternates render outlined (team text + ring
 * border on a transparent background). Both reuse team-style values; no new
 * colors are introduced here.
 */
export function candidateChipClass(team: string, isPrimary: boolean): string {
  if (isPrimary) return teamBadge(team);
  const text = teamCard(team).split(' ').find((c) => c.startsWith('text-')) ?? 'text-foreground';
  return cn('bg-transparent', text, teamRing(team));
}

/**
 * The claim a player was believed to be before their current believed claim
 * (claims[0]): the most recent other claim recorded strictly earlier than it.
 * Claims added later, or in the same batch, are alternates, not history.
 * Returns null without claim records (legacy games) or history.
 */
export function previousClaimId(player: GamePlayer): string | null {
  const primary = player.claims[0];
  const records = player.claimRecords ?? [];
  const primaryRecord = primary ? records.find(r => r.characterId === primary) : undefined;
  if (!primaryRecord) return null;
  let best: { characterId: string; addedAt: string } | null = null;
  for (const r of records) {
    if (r.characterId === primary || !player.claims.includes(r.characterId)) continue;
    if (r.addedAt >= primaryRecord.addedAt) continue;
    if (!best || r.addedAt > best.addedAt) best = r;
  }
  return best?.characterId ?? null;
}
