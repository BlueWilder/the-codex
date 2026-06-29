import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutList, Clock, Sunrise, Moon } from "lucide-react";
import { type Character } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { CharacterCard } from "@/components/character/CharacterCard";
import { sortCharacters, getFirstNightChars, getOtherNightChars, type ScriptSort } from "@/lib/night-order";

/**
 * Shared, script-scoped character view. Renders a grid of the shared
 * CharacterCard for a resolved list of characters, so Reference, Game,
 * and Storyteller flows reuse the same expand/collapse card AND the same
 * sort toggle instead of duplicating the grid markup or sort logic.
 *
 * Resolution and filtering are left to the caller (see `lib/script-resolve.ts`);
 * sorting now lives here via the shared `sortCharacters` helper. Both the sort
 * order and the expand/collapse state are managed internally by default, but
 * each can be controlled (`sortOrder` + `onSortChange`, `expandedId` +
 * `onToggle`) for surfaces that need to drive them.
 */
const SORT_OPTIONS: { value: ScriptSort; label: string; icon: typeof LayoutList; testId: string }[] = [
  { value: "team", label: "By Team", icon: LayoutList, testId: "button-sort-team" },
  { value: "night", label: "By Night", icon: Clock, testId: "button-sort-night" },
];

type NightView = "first" | "other";

const NIGHT_VIEW_OPTIONS: { value: NightView; label: string; icon: typeof LayoutList; testId: string }[] = [
  { value: "first", label: "First Night", icon: Sunrise, testId: "button-night-first" },
  { value: "other", label: "Other Nights", icon: Moon, testId: "button-night-other" },
];

export function ScriptView({
  characters,
  sortOrder: controlledSortOrder,
  onSortChange,
  defaultSortOrder = "team",
  expandedId: controlledExpandedId,
  onToggle: controlledOnToggle,
  className,
  toolbarClassName = "sticky top-16 md:top-24 z-10 -mx-1 mb-4 flex flex-wrap justify-end gap-2 bg-background/80 backdrop-blur-sm px-1 py-2",
  emptyMessage = "No souls found matching your inquiry.",
}: {
  characters: Character[];
  sortOrder?: ScriptSort;
  onSortChange?: (sort: ScriptSort) => void;
  defaultSortOrder?: ScriptSort;
  expandedId?: string | null;
  onToggle?: (charId: string) => void;
  className?: string;
  toolbarClassName?: string;
  emptyMessage?: string;
}) {
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);
  const [internalSortOrder, setInternalSortOrder] = useState<ScriptSort>(defaultSortOrder);
  const [nightView, setNightView] = useState<NightView>("first");

  const isControlled = controlledOnToggle !== undefined;
  const expandedId = isControlled ? controlledExpandedId ?? null : internalExpandedId;

  const isSortControlled = onSortChange !== undefined;
  const sortOrder = isSortControlled ? controlledSortOrder ?? defaultSortOrder : internalSortOrder;

  const handleToggle = (charId: string) => {
    if (isControlled) {
      controlledOnToggle(charId);
    } else {
      setInternalExpandedId(prev => (prev === charId ? null : charId));
    }
  };

  const handleSortChange = (next: ScriptSort) => {
    if (isSortControlled) {
      onSortChange(next);
    } else {
      setInternalSortOrder(next);
    }
  };

  const sorted =
    sortOrder === "night"
      ? nightView === "first"
        ? getFirstNightChars(characters)
        : getOtherNightChars(characters)
      : sortCharacters(characters, "team");

  return (
    <div className={className}>
      <div className={toolbarClassName}>
        {sortOrder === "night" && (
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-900/30 bg-black/20 p-1">
            {NIGHT_VIEW_OPTIONS.map(({ value, label, icon: Icon, testId }) => (
              <button
                key={value}
                onClick={() => setNightView(value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap",
                  nightView === value
                    ? "bg-amber-900/50 text-amber-100"
                    : "bg-transparent text-muted-foreground hover:bg-white/5",
                )}
                title={label}
                data-testid={testId}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="inline-flex items-center gap-1 rounded-full border border-amber-900/30 bg-black/20 p-1">
          {SORT_OPTIONS.map(({ value, label, icon: Icon, testId }) => (
            <button
              key={value}
              onClick={() => handleSortChange(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap",
                sortOrder === value
                  ? "bg-amber-900/50 text-amber-100"
                  : "bg-transparent text-muted-foreground hover:bg-white/5",
              )}
              title={`Sort ${label}`}
              data-testid={testId}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((char) => (
          <CharacterCard
            key={char.id}
            char={char}
            isExpanded={expandedId === char.id}
            onToggle={() => handleToggle(char.id)}
          />
        ))}

        {sorted.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground font-serif italic">
            {emptyMessage}
          </div>
        )}
      </motion.div>
    </div>
  );
}
