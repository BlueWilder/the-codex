import { describe, expect, it } from "vitest";
import {
  getFirstNightChars,
  getOtherNightChars,
  nightOrderValue,
  sortCharacters,
} from "@/lib/night-order";
import { ALL_CHARACTERS, type Character } from "@/lib/game-data";

function makeChar(
  id: string,
  firstNightOrder: number | null,
  otherNightOrder: number | null,
): Character {
  return {
    id,
    name: id,
    edition: "tb",
    team: "townsfolk",
    ability: "",
    firstNightOrder,
    otherNightOrder,
    setup: false,
    reminders: [],
    flavorQuote: "",
    extendedSummary: "",
    tipsAndTricks: [],
  };
}

function makeSortChar(overrides: Partial<Character> & { id: string }): Character {
  return {
    name: overrides.id,
    edition: "tb",
    team: "townsfolk",
    ability: "",
    firstNightOrder: null,
    otherNightOrder: null,
    setup: false,
    reminders: [],
    flavorQuote: "",
    extendedSummary: "",
    tipsAndTricks: [],
    ...overrides,
  };
}

describe("getFirstNightChars", () => {
  it("filters out characters with a null firstNightOrder", () => {
    const chars = [
      makeChar("a", 5, null),
      makeChar("b", null, 3),
      makeChar("c", 1, 9),
    ];
    const result = getFirstNightChars(chars);
    expect(result.map(c => c.id)).toEqual(["c", "a"]);
    expect(result.some(c => c.id === "b")).toBe(false);
  });

  it("sorts ascending by firstNightOrder", () => {
    const chars = [
      makeChar("third", 30, null),
      makeChar("first", 10, null),
      makeChar("second", 20, null),
    ];
    expect(getFirstNightChars(chars).map(c => c.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("returns an empty array when no character wakes on the first night", () => {
    const chars = [makeChar("a", null, 1), makeChar("b", null, 2)];
    expect(getFirstNightChars(chars)).toEqual([]);
  });

  it("keeps a character whose firstNightOrder is 0 (0 is not null)", () => {
    const chars = [makeChar("zero", 0, null), makeChar("one", 1, null)];
    expect(getFirstNightChars(chars).map(c => c.id)).toEqual(["zero", "one"]);
  });
});

describe("getOtherNightChars", () => {
  it("filters out characters with a null otherNightOrder", () => {
    const chars = [
      makeChar("a", 5, null),
      makeChar("b", null, 3),
      makeChar("c", 1, 9),
    ];
    const result = getOtherNightChars(chars);
    expect(result.map(c => c.id)).toEqual(["b", "c"]);
    expect(result.some(c => c.id === "a")).toBe(false);
  });

  it("sorts ascending by otherNightOrder", () => {
    const chars = [
      makeChar("third", null, 30),
      makeChar("first", null, 10),
      makeChar("second", null, 20),
    ];
    expect(getOtherNightChars(chars).map(c => c.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("returns an empty array when no character wakes on other nights", () => {
    const chars = [makeChar("a", 1, null), makeChar("b", 2, null)];
    expect(getOtherNightChars(chars)).toEqual([]);
  });
});

describe("nightOrderValue", () => {
  it("uses firstNightOrder when present", () => {
    expect(nightOrderValue(makeChar("a", 12, 50))).toBe(12);
  });

  it("falls back to otherNightOrder when firstNightOrder is null", () => {
    expect(nightOrderValue(makeChar("a", null, 50))).toBe(50);
  });

  it("falls back to 999 when both orders are null", () => {
    expect(nightOrderValue(makeChar("a", null, null))).toBe(999);
  });

  it("treats a firstNightOrder of 0 as a real value, not a fallback", () => {
    expect(nightOrderValue(makeChar("a", 0, 50))).toBe(0);
  });

  it("treats an otherNightOrder of 0 as a real value when firstNightOrder is null", () => {
    expect(nightOrderValue(makeChar("a", null, 0))).toBe(0);
  });
});

describe("sortCharacters", () => {
  it("does not mutate the input array", () => {
    const chars = [
      makeSortChar({ id: "zeta" }),
      makeSortChar({ id: "alpha" }),
    ];
    const before = chars.map(c => c.id);
    sortCharacters(chars, "alphabetical");
    expect(chars.map(c => c.id)).toEqual(before);
  });

  describe("traveler/fabled tail ordering", () => {
    it("always pushes travelers then fabled to the end, regardless of sort mode", () => {
      const chars = [
        makeSortChar({ id: "fab", team: "fabled" }),
        makeSortChar({ id: "trav", team: "traveler" }),
        makeSortChar({ id: "townie", team: "townsfolk" }),
        makeSortChar({ id: "demon", team: "demon" }),
      ];
      for (const mode of ["alphabetical", "team", "night"] as const) {
        const result = sortCharacters(chars, mode).map(c => c.id);
        expect(result.slice(-2)).toEqual(["trav", "fab"]);
        expect(result.indexOf("trav")).toBeGreaterThan(result.indexOf("townie"));
        expect(result.indexOf("trav")).toBeGreaterThan(result.indexOf("demon"));
      }
    });

    it("sorts multiple travelers and fabled alphabetically within their tail group", () => {
      const chars = [
        makeSortChar({ id: "f-zoe", name: "Zoe", team: "fabled" }),
        makeSortChar({ id: "f-amy", name: "Amy", team: "fabled" }),
        makeSortChar({ id: "t-zane", name: "Zane", team: "traveler" }),
        makeSortChar({ id: "t-abe", name: "Abe", team: "traveler" }),
        makeSortChar({ id: "townie", name: "Townie", team: "townsfolk" }),
      ];
      const result = sortCharacters(chars, "alphabetical").map(c => c.id);
      expect(result).toEqual(["townie", "t-abe", "t-zane", "f-amy", "f-zoe"]);
    });
  });

  describe("alphabetical mode", () => {
    it("sorts non-tail characters by name", () => {
      const chars = [
        makeSortChar({ id: "c", name: "Charlie" }),
        makeSortChar({ id: "a", name: "Alpha" }),
        makeSortChar({ id: "b", name: "Bravo" }),
      ];
      expect(sortCharacters(chars, "alphabetical").map(c => c.id)).toEqual([
        "a",
        "b",
        "c",
      ]);
    });
  });

  describe("night mode", () => {
    it("sorts by night order value, breaking ties alphabetically", () => {
      const chars = [
        makeSortChar({ id: "late", name: "Late", firstNightOrder: 30 }),
        makeSortChar({ id: "early", name: "Early", firstNightOrder: 10 }),
        makeSortChar({ id: "tieB", name: "Bravo", firstNightOrder: 20 }),
        makeSortChar({ id: "tieA", name: "Alpha", firstNightOrder: 20 }),
      ];
      expect(sortCharacters(chars, "night").map(c => c.id)).toEqual([
        "early",
        "tieA",
        "tieB",
        "late",
      ]);
    });

    it("falls back to otherNightOrder, then 999 for non-waking characters", () => {
      const chars = [
        makeSortChar({ id: "sleeps", name: "Sleeps" }),
        makeSortChar({ id: "other", name: "Other", otherNightOrder: 5 }),
        makeSortChar({ id: "first", name: "First", firstNightOrder: 1 }),
      ];
      expect(sortCharacters(chars, "night").map(c => c.id)).toEqual([
        "first",
        "other",
        "sleeps",
      ]);
    });
  });

  describe("team mode", () => {
    it("groups by team in townsfolk/outsider/minion/demon order", () => {
      const chars = [
        makeSortChar({ id: "d", team: "demon" }),
        makeSortChar({ id: "m", team: "minion" }),
        makeSortChar({ id: "o", team: "outsider" }),
        makeSortChar({ id: "t", team: "townsfolk" }),
      ];
      expect(sortCharacters(chars, "team").map(c => c.id)).toEqual([
        "t",
        "o",
        "m",
        "d",
      ]);
    });

    it("preserves ALL_CHARACTERS order within the same team", () => {
      const sameTeam = ALL_CHARACTERS.filter(c => c.team === "townsfolk").slice(0, 4);
      const expected = sameTeam.map(c => c.id);
      const shuffled = [...sameTeam].reverse();
      expect(sortCharacters(shuffled, "team").map(c => c.id)).toEqual(expected);
    });
  });
});
