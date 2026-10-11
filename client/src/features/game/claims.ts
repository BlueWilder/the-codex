import { ALL_CHARACTERS } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { teamBadge, teamCard, teamRing } from "@/lib/team-style";
import { type ClaimDescriptor } from "@/features/game/types";

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
