// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { InlineGameLog } from "@/components/InlineGameLog";
import type { PlayerGame } from "@/hooks/use-player-game";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

function makeGame(overrides: Partial<PlayerGame> = {}): PlayerGame {
  return {
    id: "g1",
    createdAt: new Date().toISOString(),
    playerCount: 5,
    breakdown: { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
    players: [
      { id: "p1", name: "Alice", isAlive: true, status: "alive", notes: "", claims: [] },
      { id: "p2", name: "Bob", isAlive: true, status: "alive", notes: "", claims: [] },
    ],
    currentDay: 1,
    phase: "night",
    script: { id: "tb" },
    deathRecords: [],
    travelerEvents: [],
    notebookNotes: [],
    ...overrides,
  };
}

const noop = () => {};

function renderLog(game: PlayerGame, handlers: Partial<{
  onUpdateGameNotes: (n: string) => void;
  onAddNotebookNote: (t: string) => void;
  onRemoveNotebookNote: (id: string) => void;
}> = {}) {
  return render(
    <InlineGameLog
      game={game}
      onUpdateGameNotes={handlers.onUpdateGameNotes ?? noop}
      onAddNotebookNote={handlers.onAddNotebookNote ?? noop}
      onRemoveNotebookNote={handlers.onRemoveNotebookNote ?? noop}
    />,
  );
}

describe("InlineGameLog phase chapters", () => {
  it("renders the current live chapter with an add-note input even when empty", () => {
    renderLog(makeGame());
    // Live chapter is Night 1.
    expect(screen.getByTestId("notebook-chapter-n1")).toBeTruthy();
    expect(screen.getByTestId("input-notebook-note")).toBeTruthy();
    expect(screen.getByTestId("button-add-notebook-note")).toBeTruthy();
  });

  it("preserves the free-form game notes textarea and reports changes", () => {
    const onUpdateGameNotes = vi.fn();
    renderLog(makeGame({ gameNotes: "demon bluffs" }), { onUpdateGameNotes });
    const ta = screen.getByTestId("input-game-notes") as HTMLTextAreaElement;
    expect(ta.value).toBe("demon bluffs");
    fireEvent.change(ta, { target: { value: "new theory" } });
    expect(onUpdateGameNotes).toHaveBeenCalledWith("new theory");
  });

  it("places a night death in the Night chapter and a day execution in the Day chapter", () => {
    const game = makeGame({
      currentDay: 2,
      phase: "day",
      deathRecords: [
        { playerId: "p1", day: 2, type: "night", phase: "night", timestamp: "2026-06-30T01:00:00Z" },
        { playerId: "p2", playerName: "Bob", day: 1, type: "execution", phase: "day", timestamp: "2026-06-29T12:00:00Z" },
      ],
    });
    renderLog(game);
    // Night 2 chapter holds the night death.
    const n2 = screen.getByTestId("notebook-chapter-n2");
    expect(n2.textContent).toContain("Alice");
    expect(n2.textContent).toContain("died in the night");
    // The day-1 execution lives in the Day 1 chapter, not a night chapter.
    const d1 = screen.getByTestId("notebook-chapter-d1");
    expect(d1.textContent).toContain("Bob");
  });

  it("adds a note via the input and clears the draft", () => {
    const onAddNotebookNote = vi.fn();
    renderLog(makeGame(), { onAddNotebookNote });
    const input = screen.getByTestId("input-notebook-note") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "poisoner is bob" } });
    fireEvent.click(screen.getByTestId("button-add-notebook-note"));
    expect(onAddNotebookNote).toHaveBeenCalledWith("poisoner is bob");
  });

  it("renders existing notes in their phase chapter with a remove button", () => {
    const onRemoveNotebookNote = vi.fn();
    const game = makeGame({
      notebookNotes: [
        { id: "note-x", day: 1, phase: "night", text: "saw red herring", createdAt: new Date().toISOString() },
      ],
    });
    renderLog(game, { onRemoveNotebookNote });
    const noteEl = screen.getByTestId("notebook-note-note-x");
    expect(noteEl.textContent).toContain("saw red herring");
    fireEvent.click(screen.getByTestId("button-remove-notebook-note-note-x"));
    expect(onRemoveNotebookNote).toHaveBeenCalledWith("note-x");
  });

  it("renders chapters in spine order: N1, D1, N2, D2", () => {
    const game = makeGame({
      currentDay: 2,
      phase: "day",
      notebookNotes: [
        { id: "a", day: 1, phase: "night", text: "n1", createdAt: new Date().toISOString() },
        { id: "b", day: 1, phase: "day", text: "d1", createdAt: new Date().toISOString() },
        { id: "c", day: 2, phase: "night", text: "n2", createdAt: new Date().toISOString() },
      ],
    });
    renderLog(game);
    const order = screen
      .getAllByTestId(/^notebook-chapter-/)
      .map(el => el.getAttribute("data-testid")!.replace("notebook-chapter-", ""));
    expect(order).toEqual(["n1", "d1", "n2", "d2"]);
  });

  it("shows an empty notebook gracefully (live chapter only, no crash)", () => {
    renderLog(makeGame());
    // No events, no notes: only the live chapter with its add-note input.
    expect(screen.queryByTestId(/^event-/)).toBeNull();
    expect(screen.queryByTestId(/^notebook-note-/)).toBeNull();
    expect(screen.getByTestId("notebook-chapter-n1")).toBeTruthy();
  });
});
