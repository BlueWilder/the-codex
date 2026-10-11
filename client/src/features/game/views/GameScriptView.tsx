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
      // The sheet is already parchment, so it becomes the tab's panel itself
      // (panel radius and padding) instead of nesting inside another panel.
      <ScriptSheet
        characters={characters}
        scriptName={scriptName}
        onCharacterSelect={onCharacterSelect}
        className="rounded-[14px] p-3 md:p-3.5 shadow-none"
      />
    ) : (
      <div className="game-panel" data-testid="panel-script">
        <div className="py-12 text-center text-[var(--parchment-ink-muted)]" data-testid="text-script-nudge-game">
          <Scroll className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-serif text-base">Pick a script to see the full character sheet.</p>
        </div>
      </div>
    )
  );
}
