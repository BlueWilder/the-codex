import { Moon, Sun } from "lucide-react";
import { type Character } from "@/lib/game-data";

export function NightBadges({ char }: { char: Character }) {
  return (
    <>
      {char.firstNightOrder !== null && (
        <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-amber-200/70 border border-amber-900/20 flex items-center gap-1">
          <Moon className="w-3 h-3" /> First Night
        </span>
      )}
      {char.otherNightOrder !== null && (
        <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-amber-200/70 border border-amber-900/20 flex items-center gap-1">
          <Sun className="w-3 h-3" /> Other Nights
        </span>
      )}
    </>
  );
}
