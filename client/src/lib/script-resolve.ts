import { ALL_CHARACTERS, OFFICIAL_SCRIPTS, TRAVELLER_SCRIPT_MAP, type Character } from "@/lib/game-data";
import type { LocalScript } from "@/hooks/use-local-scripts";

export interface ResolveScriptOpts {
  includeTravellers?: boolean;
  includeFabled?: boolean;
}

/**
 * Shared, pure resolver: given an already-resolved script (or null = all
 * characters), return the set of characters that belong to it. Sorting is left
 * to the caller. This is the canonical entry point for the Reference page, the
 * future ScriptView, and the Game flow so they all resolve scripts identically.
 *
 * - Resolves official / community / custom scripts by their `characterIds`
 *   id-list (NOT edition matching).
 * - Layers in `TRAVELLER_SCRIPT_MAP` travelers for core scripts when
 *   `includeTravellers` is on (keyed by `script.id`; custom/community scripts
 *   have no map entry, so none are added, matching today's behavior).
 * - Always appends fabled when `includeFabled` is on.
 *
 * Does NOT fetch from the database; callers pass the already-resolved script.
 */
export function resolveScriptCharacters(
  script: LocalScript | null,
  opts: ResolveScriptOpts = {},
): Character[] {
  if (!script) return [...ALL_CHARACTERS];

  const { includeTravellers = false, includeFabled = false } = opts;
  const ids = new Set(script.characterIds);

  if (includeTravellers) {
    const travellers = TRAVELLER_SCRIPT_MAP[script.id];
    if (travellers) travellers.forEach(id => ids.add(id));
  }

  return ALL_CHARACTERS.filter(c => {
    if (ids.has(c.id)) return true;
    if (includeFabled && c.team === "fabled") return true;
    return false;
  });
}

/**
 * Reference-facing resolver that reproduces the page's full filter branching
 * from a raw `scriptFilter` string, including the legacy edition fallback.
 * Prefer `resolveScriptCharacters` for new code.
 *
 * Branches, mirroring Reference exactly:
 * - an active custom script -> resolve by its characterIds (+ fabled).
 * - "all" -> every character.
 * - an id found in OFFICIAL_SCRIPTS -> resolve by its character list (+ traveler
 *   map + fabled).
 * - otherwise -> the legacy edition fallback below.
 */
export function resolveCharactersForScriptFilter(
  scriptFilter: string,
  activeCustomScript: LocalScript | null | undefined,
  opts: ResolveScriptOpts = {},
): Character[] {
  if (activeCustomScript) {
    return resolveScriptCharacters(activeCustomScript, opts);
  }

  if (scriptFilter === "all") {
    return [...ALL_CHARACTERS];
  }

  const officialScript = OFFICIAL_SCRIPTS.find(s => s.id === scriptFilter);
  if (officialScript) {
    return resolveScriptCharacters(
      {
        id: officialScript.id,
        name: officialScript.name,
        isOfficial: officialScript.isOfficial,
        isCommunity: !officialScript.isOfficial,
        characterIds: officialScript.characters,
      },
      opts,
    );
  }

  // Legacy edition fallback. Unreachable from the current Reference UI (every
  // SCRIPTS chip id exists in OFFICIAL_SCRIPTS, and custom scripts use the
  // `custom:` prefix resolved via activeCustomScript). Preserved for
  // byte-identical behavior; candidate for removal in a later cleanup slice.
  const { includeTravellers = false, includeFabled = false } = opts;
  const travellers = includeTravellers ? TRAVELLER_SCRIPT_MAP[scriptFilter] : undefined;

  return ALL_CHARACTERS.filter(c => {
    if (c.team === "traveler") {
      return travellers ? travellers.includes(c.id) : false;
    }
    if (c.edition === scriptFilter) return true;
    if (includeFabled && c.team === "fabled") return true;
    return false;
  });
}
