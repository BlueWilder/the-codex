import { ALL_CHARACTERS, type Character } from "@/lib/game-data";

export type ScriptSort = "team" | "night";

export function getFirstNightChars(chars: Character[]): Character[] {
  return chars
    .filter(c => c.firstNightOrder !== null)
    .sort((a, b) => (a.firstNightOrder ?? 0) - (b.firstNightOrder ?? 0));
}

export function getOtherNightChars(chars: Character[]): Character[] {
  return chars
    .filter(c => c.otherNightOrder !== null)
    .sort((a, b) => (a.otherNightOrder ?? 0) - (b.otherNightOrder ?? 0));
}

export function nightOrderValue(char: Character): number {
  return char.firstNightOrder ?? char.otherNightOrder ?? 999;
}

const END_TEAMS = ["traveler", "fabled"];

export function compareEndTeams(a: Character, b: Character): number | null {
  const aIsEnd = END_TEAMS.includes(a.team);
  const bIsEnd = END_TEAMS.includes(b.team);
  if (aIsEnd && bIsEnd) {
    if (a.team !== b.team) return a.team === "traveler" ? -1 : 1;
    return a.name.localeCompare(b.name);
  }
  if (aIsEnd && !bIsEnd) return 1;
  if (!aIsEnd && bIsEnd) return -1;
  return null;
}

const TEAM_SHEET_ORDER: Record<string, number> = { townsfolk: 0, outsider: 1, minion: 2, demon: 3, traveler: 4, fabled: 5 };

export function compareSheetOrder(a: Character, b: Character, reference: Character[]): number {
  const aTeamOrder = TEAM_SHEET_ORDER[a.team] ?? 6;
  const bTeamOrder = TEAM_SHEET_ORDER[b.team] ?? 6;
  if (aTeamOrder !== bTeamOrder) return aTeamOrder - bTeamOrder;
  const aIndex = reference.indexOf(a);
  const bIndex = reference.indexOf(b);
  return aIndex - bIndex;
}

export function sortCharacters(chars: Character[], sort: ScriptSort): Character[] {
  return [...chars].sort((a, b) => {
    const endComparison = compareEndTeams(a, b);
    if (endComparison !== null) return endComparison;

    if (sort === "night") {
      const aOrder = nightOrderValue(a);
      const bOrder = nightOrderValue(b);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    }
    // "team": group by team, maintain original ALL_CHARACTERS order within team
    return compareSheetOrder(a, b, ALL_CHARACTERS);
  });
}
