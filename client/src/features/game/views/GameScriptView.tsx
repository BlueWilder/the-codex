import { ScriptSheet } from "@/components/character/ScriptSheet";
import { Scroll } from "lucide-react";
import { type Character } from "@/lib/game-data";

/**
 * The Script tab: the selected script as a ScriptSheet, or a nudge to pick
 * one. Named GameScriptView so it is not confused with the shared
 * components/character/ScriptView used by the Reference page.
 */
export function GameScriptView({
  scriptName,
  characters,
  onCharacterSelect,
}: {
  scriptName: string | null;
  characters: Character[];
  onCharacterSelect: (id: string) => void;
}) {
  return (
    scriptName !== null ? (
      <ScriptSheet
        characters={characters}
        scriptName={scriptName}
        onCharacterSelect={onCharacterSelect}
      />
    ) : (
      <div className="py-12 text-center text-muted-foreground" data-testid="text-script-nudge-game">
        <Scroll className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Pick a script to see the full character sheet.</p>
      </div>
    )
  );
}
