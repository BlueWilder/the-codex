import { type Character } from "@/lib/game-data";

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
