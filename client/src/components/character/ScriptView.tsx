import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutList, Clock, Sunrise, Moon } from "lucide-react";
import { type Character } from "@/lib/game-data";
import { CharacterCard } from "@/components/character/CharacterCard";
import { sortCharacters, getFirstNightChars, getOtherNightChars, type ScriptSort } from "@/lib/night-order";

/**
 * Shared, script-scoped character view. Renders a grid of the shared
 * CharacterCard for a resolved list of characters, so Reference and Game
 * reuse the same expand/collapse card AND the same
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

export type NightView = "first" | "other";

const NIGHT_VIEW_OPTIONS: { value: NightView; label: string; icon: typeof LayoutList; testId: string }[] = [
  { value: "first", label: "First Night", icon: Sunrise, testId: "button-night-first" },
  { value: "other", label: "Other Nights", icon: Moon, testId: "button-night-other" },
];

/**
 * By Team / By Night as a secondary pill pair (UI rule 5). Icons only on a
 * phone; the active pill takes the primary look.
 */
export function SortToggle({ value, onChange }: { value: ScriptSort; onChange: (next: ScriptSort) => void }) {
  return (
    <div className="flex shrink-0 gap-2" role="group" aria-label="Sort characters">
      {SORT_OPTIONS.map(({ value: option, label, icon: Icon, testId }) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="btn-secondary px-3"
          data-active={value === option ? "true" : undefined}
          aria-label={`Sort ${label}`}
          title={`Sort ${label}`}
          data-testid={testId}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

/** First Night / Other Nights as a secondary pill pair, shown in By Night mode. */
export function NightViewToggle({ value, onChange }: { value: NightView; onChange: (next: NightView) => void }) {
  return (
    <div className="flex shrink-0 gap-2" role="group" aria-label="Night">
      {NIGHT_VIEW_OPTIONS.map(({ value: option, label, icon: Icon, testId }) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="btn-secondary px-3"
          data-active={value === option ? "true" : undefined}
          title={label}
          data-testid={testId}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

export function ScriptView({
  characters,
  sortOrder: controlledSortOrder,
  onSortChange,
  defaultSortOrder = "team",
  expandedId: controlledExpandedId,
  onToggle: controlledOnToggle,
  nightView: controlledNightView,
  onNightViewChange,
  showToolbar = true,
  className,
  toolbarClassName = "mb-3 flex flex-wrap justify-end gap-3",
  emptyMessage = "No souls found matching your inquiry.",
}: {
  characters: Character[];
  sortOrder?: ScriptSort;
  onSortChange?: (sort: ScriptSort) => void;
  defaultSortOrder?: ScriptSort;
  expandedId?: string | null;
  onToggle?: (charId: string) => void;
  /** Controlled First / Other Nights choice (Reference puts the toggles in its filter row). */
  nightView?: NightView;
  onNightViewChange?: (next: NightView) => void;
  /** Render the sort and night toggles above the cards (on unless the caller renders them). */
  showToolbar?: boolean;
  className?: string;
  toolbarClassName?: string;
  emptyMessage?: string;
}) {
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);
  const [internalSortOrder, setInternalSortOrder] = useState<ScriptSort>(defaultSortOrder);
  const [internalNightView, setInternalNightView] = useState<NightView>("first");
  const nightView = onNightViewChange ? controlledNightView ?? "first" : internalNightView;
  const setNightView = onNightViewChange ?? setInternalNightView;

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
      {showToolbar && (
        <div className={toolbarClassName}>
          {sortOrder === "night" && <NightViewToggle value={nightView} onChange={setNightView} />}
          <SortToggle value={sortOrder} onChange={handleSortChange} />
        </div>
      )}

      {/* One parchment panel holds every card (Game Mode panel pattern). */}
      <motion.div layout className="game-panel grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((char) => (
          <CharacterCard
            key={char.id}
            char={char}
            isExpanded={expandedId === char.id}
            onToggle={() => handleToggle(char.id)}
          />
        ))}

        {sorted.length === 0 && (
          <div className="col-span-full py-12 text-center font-serif italic text-[var(--parchment-ink-muted)]">
            {emptyMessage}
          </div>
        )}
      </motion.div>
    </div>
  );
}
