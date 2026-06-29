import { useState } from "react";
import { motion } from "framer-motion";
import { type Character } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { CharacterCard } from "@/components/character/CharacterCard";

/**
 * Shared, script-scoped character view. Renders a grid of the shared
 * CharacterCard for an already-resolved list of characters, so Reference, Game,
 * and Storyteller flows reuse the same expand/collapse card instead of
 * duplicating the grid markup.
 *
 * Resolution, filtering, and sorting are left to the caller (see
 * `lib/script-resolve.ts` and `lib/night-order.ts`); ScriptView only renders the
 * characters it is handed. Expand/collapse state is managed internally by
 * default (one card open at a time), but can be controlled via `expandedId` +
 * `onToggle` for surfaces that need to drive it.
 */
export function ScriptView({
  characters,
  expandedId: controlledExpandedId,
  onToggle: controlledOnToggle,
  className,
  emptyMessage = "No souls found matching your inquiry.",
}: {
  characters: Character[];
  expandedId?: string | null;
  onToggle?: (charId: string) => void;
  className?: string;
  emptyMessage?: string;
}) {
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);

  const isControlled = controlledOnToggle !== undefined;
  const expandedId = isControlled ? controlledExpandedId ?? null : internalExpandedId;

  const handleToggle = (charId: string) => {
    if (isControlled) {
      controlledOnToggle(charId);
    } else {
      setInternalExpandedId(prev => (prev === charId ? null : charId));
    }
  };

  return (
    <motion.div layout className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {characters.map((char) => (
        <CharacterCard
          key={char.id}
          char={char}
          isExpanded={expandedId === char.id}
          onToggle={() => handleToggle(char.id)}
        />
      ))}

      {characters.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground font-serif italic">
          {emptyMessage}
        </div>
      )}
    </motion.div>
  );
}
