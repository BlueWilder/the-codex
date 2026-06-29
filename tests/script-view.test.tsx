// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ScriptView } from "@/components/character/ScriptView";
import type { Character } from "@/lib/game-data";

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

// firstOnly wakes only on the first night, otherOnly wakes only on other
// nights, both wakes on both, and sleeper never wakes.
const CHARACTERS: Character[] = [
  makeChar("firstOnly", 5, null),
  makeChar("otherOnly", null, 5),
  makeChar("both", 10, 10),
  makeChar("sleeper", null, null),
];

function cardIds(): string[] {
  return screen
    .getAllByTestId(/^card-character-/)
    .map(el => el.getAttribute("data-testid")!.replace("card-character-", ""));
}

afterEach(() => cleanup());

describe("ScriptView By Night sub-toggle", () => {
  it("hides the First/Other sub-toggle in By Team mode", () => {
    render(<ScriptView characters={CHARACTERS} />);

    expect(screen.getByTestId("button-sort-team")).toBeTruthy();
    expect(screen.getByTestId("button-sort-night")).toBeTruthy();
    expect(screen.queryByTestId("button-night-first")).toBeNull();
    expect(screen.queryByTestId("button-night-other")).toBeNull();
  });

  it("shows the First/Other sub-toggle once By Night is selected", () => {
    render(<ScriptView characters={CHARACTERS} />);

    fireEvent.click(screen.getByTestId("button-sort-night"));

    expect(screen.getByTestId("button-night-first")).toBeTruthy();
    expect(screen.getByTestId("button-night-other")).toBeTruthy();
  });

  it("defaults to First Night and renders only first-night wakers", () => {
    render(<ScriptView characters={CHARACTERS} />);

    fireEvent.click(screen.getByTestId("button-sort-night"));

    expect(cardIds()).toEqual(["firstOnly", "both"]);
  });

  it("re-renders only other-night wakers after switching to Other Nights", () => {
    render(<ScriptView characters={CHARACTERS} />);

    fireEvent.click(screen.getByTestId("button-sort-night"));
    fireEvent.click(screen.getByTestId("button-night-other"));

    expect(cardIds()).toEqual(["otherOnly", "both"]);
  });

  it("can switch back to First Night after viewing Other Nights", () => {
    render(<ScriptView characters={CHARACTERS} />);

    fireEvent.click(screen.getByTestId("button-sort-night"));
    fireEvent.click(screen.getByTestId("button-night-other"));
    fireEvent.click(screen.getByTestId("button-night-first"));

    expect(cardIds()).toEqual(["firstOnly", "both"]);
  });

  it("shows all characters again when returning to By Team mode", () => {
    render(<ScriptView characters={CHARACTERS} />);

    fireEvent.click(screen.getByTestId("button-sort-night"));
    fireEvent.click(screen.getByTestId("button-sort-team"));

    expect(screen.queryByTestId("button-night-first")).toBeNull();
    expect(cardIds().sort()).toEqual(["both", "firstOnly", "otherOnly", "sleeper"]);
  });
});
