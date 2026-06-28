import { describe, it, expect } from "vitest";
import { ALL_CHARACTERS, OFFICIAL_SCRIPTS, TRAVELLER_SCRIPT_MAP } from "@/lib/game-data";
import { resolveScriptCharacters, resolveCharactersForScriptFilter } from "@/lib/script-resolve";
import type { LocalScript } from "@/hooks/use-local-scripts";

const fabledIds = ALL_CHARACTERS.filter(c => c.team === "fabled").map(c => c.id);
const tb = OFFICIAL_SCRIPTS.find(s => s.id === "tb")!;

describe("resolveScriptCharacters", () => {
  it("returns all characters when script is null", () => {
    const ids = resolveScriptCharacters(null).map(c => c.id);
    expect(ids).toEqual(ALL_CHARACTERS.map(c => c.id));
  });

  it("resolves a core script by id-list plus its traveler map and fabled", () => {
    const script: LocalScript = {
      id: "tb",
      name: "Trouble Brewing",
      isOfficial: true,
      characterIds: tb.characters,
    };
    const ids = new Set(
      resolveScriptCharacters(script, { includeTravellers: true, includeFabled: true }).map(c => c.id),
    );
    for (const id of tb.characters) expect(ids.has(id)).toBe(true);
    for (const id of TRAVELLER_SCRIPT_MAP.tb) expect(ids.has(id)).toBe(true);
    for (const id of fabledIds) expect(ids.has(id)).toBe(true);
  });

  it("excludes travelers and fabled when opts are off", () => {
    const script: LocalScript = {
      id: "tb",
      name: "Trouble Brewing",
      isOfficial: true,
      characterIds: tb.characters,
    };
    const ids = new Set(resolveScriptCharacters(script).map(c => c.id));
    for (const id of TRAVELLER_SCRIPT_MAP.tb) expect(ids.has(id)).toBe(false);
    for (const id of fabledIds) expect(ids.has(id)).toBe(false);
  });

  it("adds no traveler-map travelers for a custom script (no map entry)", () => {
    const custom: LocalScript = {
      id: "custom-123",
      name: "Custom",
      isOfficial: false,
      characterIds: ["washerwoman", "imp"],
    };
    const ids = new Set(
      resolveScriptCharacters(custom, { includeTravellers: true, includeFabled: true }).map(c => c.id),
    );
    expect(ids.has("washerwoman")).toBe(true);
    expect(ids.has("imp")).toBe(true);
    for (const id of TRAVELLER_SCRIPT_MAP.tb) expect(ids.has(id)).toBe(false);
    for (const id of fabledIds) expect(ids.has(id)).toBe(true);
  });
});

describe("resolveCharactersForScriptFilter", () => {
  it("returns all characters for the 'all' filter", () => {
    const ids = resolveCharactersForScriptFilter("all", null).map(c => c.id);
    expect(ids).toEqual(ALL_CHARACTERS.map(c => c.id));
  });

  it("resolves an official filter id to its full roster", () => {
    const ids = new Set(
      resolveCharactersForScriptFilter("tb", null, { includeTravellers: true, includeFabled: true }).map(c => c.id),
    );
    for (const id of tb.characters) expect(ids.has(id)).toBe(true);
    for (const id of TRAVELLER_SCRIPT_MAP.tb) expect(ids.has(id)).toBe(true);
  });

  it("resolves an active custom script by its characterIds plus fabled", () => {
    const custom: LocalScript = {
      id: "abc",
      name: "Custom",
      isOfficial: false,
      characterIds: ["washerwoman", "scapegoat"],
    };
    const ids = new Set(
      resolveCharactersForScriptFilter("custom:abc", custom, { includeTravellers: true, includeFabled: true }).map(c => c.id),
    );
    expect(ids.has("washerwoman")).toBe(true);
    expect(ids.has("scapegoat")).toBe(true);
    for (const id of fabledIds) expect(ids.has(id)).toBe(true);
  });

  it("falls back to all characters for an unrecognized filter with no custom script", () => {
    const ids = resolveCharactersForScriptFilter("custom:missing", null, {
      includeTravellers: true,
      includeFabled: true,
    }).map(c => c.id);
    expect(ids).toEqual(ALL_CHARACTERS.map(c => c.id));
  });
});
