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
      <h4 className="text-sm md:text-xs font-fraunces font-semibold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4 md:w-3 md:h-3 text-orange-400" /> Jinxes
      </h4>
      <div className="space-y-2">
        {jinxes.map((jinx, idx) => (
          <div 
            key={idx}
            className="text-sm md:text-xs bg-orange-950/30 border border-orange-900/30 rounded-lg p-3 md:p-2"
          >
            <span className="font-bold text-orange-300">{getJinxedCharacterName(jinx)}:</span>
            <span className="ml-1 opacity-90">{jinx.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
