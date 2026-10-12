import { Moon, Sun } from "lucide-react";
import { type Character } from "@/lib/game-data";

const BADGE = "game-label flex items-center gap-1 rounded-full border border-[var(--parchment-control-border)] bg-[var(--parchment-control)] px-2 py-0.5 text-[var(--parchment-ink-link)]";

export function NightBadges({ char }: { char: Character }) {
  return (
    <>
      {char.firstNightOrder !== null && (
        <span className={BADGE}>
          <Moon className="w-3.5 h-3.5" /> First Night
        </span>
      )}
      {char.otherNightOrder !== null && (
        <span className={BADGE}>
          <Sun className="w-3.5 h-3.5" /> Other Nights
        </span>
      )}
    </>
  );
}
