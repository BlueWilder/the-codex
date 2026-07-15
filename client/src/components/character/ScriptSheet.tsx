import { useState } from "react";
import { User, VenetianMask, PersonStanding, Footprints, Star, LayoutList, Clock, type LucideIcon } from "lucide-react";
import { type Character, type Jinx, JINXES } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { characterIcon } from "@/lib/character-icons";
import { nightOrderValue, getFirstNightChars, getOtherNightChars, type ScriptSort } from "@/lib/night-order";

type NightView = "first" | "other";

const SETUP_BRACKET = /\s*\[([^\]]+)\]\s*$/;

/** Split an ability into its body and any trailing `[setup modifier]` text. */
function splitSetup(ability: string): { body: string; setup: string | null } {
  const match = ability.match(SETUP_BRACKET);
  if (!match) return { body: ability, setup: null };
  return { body: ability.replace(SETUP_BRACKET, ""), setup: match[1] };
}

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

/** A horned demon drawn inline so the Demon glyph is not a stock lucide icon. */
function DemonGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
         strokeLinecap="round" strokeLinejoin="round" className={className}
         aria-hidden="true">
      <path d="M6 7C5 5.5 4.5 4 5 3c1 .5 2 1.5 2.5 3" />
      <path d="M18 7c1-1.5 1.5-3 1-4-1 .5-2 1.5-2.5 3" />
      <path d="M5 11a7 7 0 0 1 14 0c0 5-3 9-7 9s-7-4-7-9Z" />
      <path d="M9.5 12.5 8 11.5" />
      <path d="M16 12.5 14.5 11.5" />
      <path d="M10 16c1 1 3 1 4 0" />
    </svg>
  );
}

// Placeholder. Real per-character token art swaps in here once an image field
// exists on Character.
function getTeamToken(team: string): React.ComponentType<{ className?: string }> {
  switch (team) {
    case "townsfolk": return User;
    case "outsider": return PersonStanding;
    case "minion": return VenetianMask;
    case "demon": return DemonGlyph;
    case "traveler": return Footprints;
    case "fabled": return Star;
    default: return User;
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
  const icon = characterIcon(char.id);
  const showNumber = sortOrder === "night" && charWakes(char);
  return (
    <div className={cn("shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden", sheet.ring, sheet.tokenBg)}>
      {showNumber ? (
        <span className={cn("text-sm font-bold", sheet.text)}>{nightOrderValue(char)}</span>
      ) : icon ? (
        <img src={icon} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        <Icon className={cn("w-5 h-5", sheet.text)} />
      )}
    </div>
  );
}

function CharRow({ char, sortOrder, onSelect }: { char: Character; sortOrder: ScriptSort; onSelect?: () => void }) {
  const { body, setup } = splitSetup(char.ability);
  const inner = (
    <>
      <Token char={char} sortOrder={sortOrder} />
      <div className="min-w-0">
        <div className="font-display font-bold text-[#2a2016] leading-tight">{char.name}</div>
        <div className="font-serif text-sm text-[#4a3c28] leading-snug">
          {body}
          {setup && (
            <span
              className="ml-1 font-sans font-bold text-xs text-[#7a5c2e] whitespace-nowrap"
              data-testid={`script-sheet-setup-${char.id}`}
            >
              [{setup}]
            </span>
          )}
        </div>
      </div>
    </>
  );
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex items-start gap-3 py-2 w-full text-left rounded-md transition-colors hover:bg-[#e8dcbe]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
        data-testid={`button-script-char-${char.id}`}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className="flex items-start gap-3 py-2" data-testid={`script-sheet-char-${char.id}`}>
      {inner}
    </div>
  );
}

/** A single Storyteller night-sheet row: sequential numbered token and name. */
function NightRow({ char, position, onSelect }: { char: Character; position: number; onSelect?: () => void }) {
  const sheet = teamSheet(char.team);
  const inner = (
    <>
      <div className={cn("shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center", sheet.ring, sheet.tokenBg)}>
        <span className={cn("text-sm font-bold", sheet.text)}>{position}</span>
      </div>
      <div className="min-w-0">
        <div className="font-display font-bold text-[#2a2016] leading-tight">{char.name}</div>
      </div>
    </>
  );
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-3 py-3 w-full text-left rounded-md transition-colors hover:bg-[#e8dcbe]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
        data-testid={`button-script-char-${char.id}`}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3 py-3" data-testid={`script-sheet-nightrow-${char.id}`}>
      {inner}
    </div>
  );
}

/** A token-less meta step (Dusk / Dawn) bracketing the night sheet. */
function NightMetaRow({ label, testId }: { label: string; testId: string }) {
  return (
    <div className="py-2 text-center" data-testid={testId}>
      <span className="font-sans text-xs italic uppercase tracking-widest text-[#9a8252]">{label}</span>
    </div>
  );
}

export function ScriptSheet({
  characters,
  scriptName,
  sortOrder: controlledSortOrder,
  onSortChange,
  defaultSortOrder = "team",
  onCharacterSelect,
}: {
  characters: Character[];
  scriptName?: string;
  sortOrder?: ScriptSort;
  onSortChange?: (s: ScriptSort) => void;
  defaultSortOrder?: ScriptSort;
  onCharacterSelect?: (characterId: string) => void;
}) {
  const [internalSort, setInternalSort] = useState<ScriptSort>(defaultSortOrder);
  const [nightView, setNightView] = useState<NightView>("first");
  const isControlled = onSortChange !== undefined;
  const sortOrder = isControlled ? controlledSortOrder ?? defaultSortOrder : internalSort;

  const handleSort = (next: ScriptSort) => {
    if (isControlled) onSortChange(next);
    else setInternalSort(next);
  };

  const sections = TEAM_ORDER
    .map(team => ({ team, chars: characters.filter(c => c.team === team) }))
    .filter(s => s.chars.length > 0);

  const nightChars = nightView === "first"
    ? getFirstNightChars(characters)
    : getOtherNightChars(characters);

  const byId = new Map(characters.map(c => [c.id, c]));
  const jinxPairs = JINXES
    .filter(j => byId.has(j.character1) && byId.has(j.character2))
    .map(j => {
      const a = byId.get(j.character1)!;
      const b = byId.get(j.character2)!;
      const first = a.name.localeCompare(b.name) <= 0 ? a : b;
      const second = first === a ? b : a;
      return { first, second, reason: j.reason };
    })
    .sort((x, y) =>
      x.first.name.localeCompare(y.first.name) ||
      x.second.name.localeCompare(y.second.name),
    );

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
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all duration-150 whitespace-nowrap",
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

      {sortOrder === "night" && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center gap-1 rounded-full border border-[#cbb98e] bg-[#e8dcbe] p-0.5">
            {([
              { value: "first" as NightView, label: "First Night", testId: "script-sheet-night-first" },
              { value: "other" as NightView, label: "Other Nights", testId: "script-sheet-night-other" },
            ]).map(({ value, label, testId }) => (
              <button
                key={value}
                onClick={() => setNightView(value)}
                className={cn(
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  "px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all duration-150 whitespace-nowrap",
                  nightView === value
                    ? "bg-[#7a5c2e] text-[#f4ecd8]"
                    : "bg-transparent text-[#6b5836] hover:bg-[#dccfa9]"
                )}
                data-testid={testId}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

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
                  {chars.map(c => (
                    <CharRow
                      key={c.id}
                      char={c}
                      sortOrder={sortOrder}
                      onSelect={onCharacterSelect ? () => onCharacterSelect(c.id) : undefined}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-[#d8c9a3]">
          <NightMetaRow label="Dusk - Start the Night Phase." testId="script-sheet-night-dusk" />
          {nightChars.map((c, i) => (
            <NightRow
              key={c.id}
              char={c}
              position={i + 1}
              onSelect={onCharacterSelect ? () => onCharacterSelect(c.id) : undefined}
            />
          ))}
          <NightMetaRow label="Dawn - End the Night Phase." testId="script-sheet-night-dawn" />
        </div>
      )}

      {jinxPairs.length > 0 && (
        <section
          className="mt-6 pt-4 border-t border-[#d8c9a3]"
          data-testid="script-sheet-jinxes"
        >
          <h4 className="font-display font-bold tracking-wider uppercase text-sm mb-2 text-[#7a5c2e]">
            Jinxes
          </h4>
          <div className="space-y-3">
            {jinxPairs.map(({ first, second, reason }) => {
              const ids = [first.id, second.id].sort();
              return (
                <div
                  key={`${ids[0]}-${ids[1]}`}
                  className="flex items-start gap-3"
                  data-testid={`script-sheet-jinx-${ids[0]}-${ids[1]}`}
                >
                  <div className="flex shrink-0 -space-x-1">
                    <JinxToken char={first} />
                    <JinxToken char={second} />
                  </div>
                  <div className="min-w-0 font-serif text-sm text-[#4a3c28] leading-snug">
                    <span className="font-display font-bold text-[#2a2016]">
                      {first.name} &amp; {second.name}
                    </span>
                    : {reason}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/** Compact team-colored token reused inside jinx rows. */
function JinxToken({ char }: { char: Character }) {
  const sheet = teamSheet(char.team);
  const Icon = getTeamToken(char.team);
  const icon = characterIcon(char.id);
  return (
    <div
      className={cn(
        "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center overflow-hidden",
        sheet.ring,
        sheet.tokenBg,
      )}
      title={char.name}
    >
      {icon ? (
        <img src={icon} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        <Icon className={cn("w-4 h-4", sheet.text)} />
      )}
    </div>
  );
}
