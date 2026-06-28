import { describe, expect, it } from "vitest";
import {
  getFirstNightChars,
  getOtherNightChars,
  nightOrderValue,
} from "@/lib/night-order";
import { type Character } from "@/lib/game-data";

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
