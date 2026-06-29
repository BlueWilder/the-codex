import { useState } from "react";
import { Shield, User, Skull, Flame, Footprints, Star, LayoutList, Clock, type LucideIcon } from "lucide-react";
import { type Character } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { sortCharacters, nightOrderValue, type ScriptSort } from "@/lib/night-order";

/**
 * ScriptSheet renders a selected script in official BotC "almanac" style: a
 * LIGHT parchment surface with team sections, two columns, a token per
 * character, and the name + ability. It is intentionally a distinct surface
 * from the dark gothic ScriptView and does NOT inherit the dark surface tokens.
 *
 * Presentation only: callers resolve the character list (see
 * `lib/script-resolve.ts`). Sorting reuses the shared `night-order` helpers.
 */

const TEAM_ORDER = ["townsfolk", "outsider", "minion", "demon", "traveler", "fabled"] as const;

const TEAM_LABEL: Record<string, string> = {
  townsfolk: "Townsfolk",
  outsider: "Outsider",
  minion: "Minion",
  demon: "Demon",
  traveler: "Traveler",
  fabled: "Fabled",
};

/**
 * Parchment-legible shades of the SAME team color families used by
 * `team-style.ts` (blue townsfolk/outsider, red minion/demon, slate traveler,
 * gold fabled). team-style only exposes dark-tuned class strings, so we restate
 * those families at readable shades for the light sheet rather than inventing
 * any new hue. The fabled gold hex (#efc344) is the same value team-style uses.
 */
const TEAM_SHEET: Record<string, { text: string; ring: string; tokenBg: string }> = {
  townsfolk: { text: "text-blue-800", ring: "border-blue-700/60", tokenBg: "bg-blue-100" },
  outsider: { text: "text-blue-600", ring: "border-blue-500/60", tokenBg: "bg-blue-50" },
  minion: { text: "text-red-700", ring: "border-red-600/60", tokenBg: "bg-red-100" },
  demon: { text: "text-red-900", ring: "border-red-800/70", tokenBg: "bg-red-100" },
  traveler: { text: "text-slate-700", ring: "border-slate-500/60", tokenBg: "bg-slate-100" },
  fabled: { text: "text-[#9a7d0a]", ring: "border-[#efc344]", tokenBg: "bg-[#fdf6dd]" },
};

const FALLBACK_SHEET = { text: "text-stone-700", ring: "border-stone-500/60", tokenBg: "bg-stone-100" };

function teamSheet(team: string) {
  return TEAM_SHEET[team] ?? FALLBACK_SHEET;
}

// Placeholder. Real per-character token art swaps in here once an image field
// exists on Character.
function getTeamToken(team: string): LucideIcon {
  switch (team) {
    case "townsfolk": return Shield;
    case "outsider": return User;
    case "minion": return Skull;
    case "demon": return Flame;
    case "traveler": return Footprints;
    case "fabled": return Star;
    default: return Shield;
  }
}

const SORT_OPTIONS: { value: ScriptSort; label: string; icon: LucideIcon; testId: string }[] = [
  { value: "team", label: "By Team", icon: LayoutList, testId: "button-sheet-sort-team" },
  { value: "night", label: "By Night", icon: Clock, testId: "button-sheet-sort-night" },
];

function charWakes(char: Character): boolean {
  return char.firstNightOrder !== null || char.otherNightOrder !== null;
}

function Token({ char, sortOrder }: { char: Character; sortOrder: ScriptSort }) {
  const sheet = teamSheet(char.team);
  const Icon = getTeamToken(char.team);
  const showNumber = sortOrder === "night" && charWakes(char);
  return (
    <div className={cn("shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center", sheet.ring, sheet.tokenBg)}>
      {showNumber ? (
        <span className={cn("text-sm font-bold", sheet.text)}>{nightOrderValue(char)}</span>
      ) : (
        <Icon className={cn("w-5 h-5", sheet.text)} />
      )}
    </div>
  );
}

function CharRow({ char, sortOrder }: { char: Character; sortOrder: ScriptSort }) {
  return (
    <div className="flex items-start gap-3 py-2" data-testid={`script-sheet-char-${char.id}`}>
      <Token char={char} sortOrder={sortOrder} />
      <div className="min-w-0">
        <div className="font-display font-bold text-[#2a2016] leading-tight">{char.name}</div>
        <div className="font-serif text-sm text-[#4a3c28] leading-snug">{char.ability}</div>
      </div>
    </div>
  );
}

export function ScriptSheet({
  characters,
  scriptName,
  sortOrder: controlledSortOrder,
  onSortChange,
  defaultSortOrder = "team",
}: {
  characters: Character[];
  scriptName?: string;
  sortOrder?: ScriptSort;
  onSortChange?: (s: ScriptSort) => void;
  defaultSortOrder?: ScriptSort;
}) {
  const [internalSort, setInternalSort] = useState<ScriptSort>(defaultSortOrder);
  const isControlled = onSortChange !== undefined;
  const sortOrder = isControlled ? controlledSortOrder ?? defaultSortOrder : internalSort;

  const handleSort = (next: ScriptSort) => {
    if (isControlled) onSortChange(next);
    else setInternalSort(next);
  };

  const sections = TEAM_ORDER
    .map(team => ({ team, chars: characters.filter(c => c.team === team) }))
    .filter(s => s.chars.length > 0);

  const nightSorted = sortCharacters(characters, "night");

  return (
    <div
      className="rounded-xl border border-[#d8c9a3] bg-[#f4ecd8] bg-gradient-to-b from-[#f7f0df] to-[#efe4c8] p-5 md:p-6 shadow-inner"
      data-testid="script-sheet"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#d8c9a3] pb-3">
        <h3 className="font-display text-xl text-[#2a2016]">{scriptName ?? "Script"}</h3>
        <div className="inline-flex items-center gap-1 rounded-full border border-[#cbb98e] bg-[#e8dcbe] p-1">
          {SORT_OPTIONS.map(({ value, label, icon: Icon, testId }) => (
            <button
              key={value}
              onClick={() => handleSort(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap",
                sortOrder === value
                  ? "bg-[#7a5c2e] text-[#f4ecd8]"
                  : "bg-transparent text-[#6b5836] hover:bg-[#dccfa9]"
              )}
              title={`Sort ${label}`}
              data-testid={testId}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {sortOrder === "team" ? (
        <div className="space-y-5">
          {sections.map(({ team, chars }) => {
            const sheet = teamSheet(team);
            return (
              <section key={team} data-testid={`script-sheet-section-${team}`}>
                <h4 className={cn("font-display font-bold tracking-wider uppercase text-sm mb-1", sheet.text)}>
                  {TEAM_LABEL[team] ?? team} ({chars.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5">
                  {chars.map(c => <CharRow key={c.id} char={c} sortOrder={sortOrder} />)}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5">
          {nightSorted.map(c => <CharRow key={c.id} char={c} sortOrder={sortOrder} />)}
        </div>
      )}
    </div>
  );
}
