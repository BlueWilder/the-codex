import { AlertTriangle } from "lucide-react";
import { ALL_CHARACTERS, type Character, type Jinx } from "@/lib/game-data";

export function JinxList({ char, jinxes }: { char: Character; jinxes: Jinx[] }) {
  if (jinxes.length === 0) return null;

  const getJinxedCharacterName = (jinx: Jinx) => {
    const otherId = jinx.character1 === char.id ? jinx.character2 : jinx.character1;
    const otherChar = ALL_CHARACTERS.find(c => c.id === otherId);
    return otherChar?.name || otherId;
  };

  return (
    <div className="space-y-2">
      <h4 className="game-label flex items-center gap-1.5 text-[var(--parchment-townsfolk)]">
        <AlertTriangle className="h-3.5 w-3.5 text-[var(--attention)]" /> Jinxes
      </h4>
      <div className="space-y-2">
        {jinxes.map((jinx, idx) => (
          <div 
            key={idx}
            className="rounded-[10px] border border-l-2 border-[var(--parchment-border)] border-l-[var(--attention)] bg-[var(--parchment-raised)] p-2.5 font-serif text-sm text-[var(--parchment-ink-body)]"
          >
            <span className="font-display font-semibold text-[var(--parchment-ink)]">{getJinxedCharacterName(jinx)}:</span>
            <span className="ml-1">{jinx.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
