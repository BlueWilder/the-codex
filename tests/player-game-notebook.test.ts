// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { usePlayerGame } from "@/hooks/use-player-game";

const STORAGE_KEY = "clocktower_player_game";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("notebook notes actions", () => {
  it("stamps an added note with the current day and phase", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    // New game is Night 1.
    act(() => {
      result.current.addNotebookNote("imp is bluffing soldier");
    });
    const notes = result.current.game?.notebookNotes ?? [];
    expect(notes).toHaveLength(1);
    expect(notes[0].day).toBe(1);
    expect(notes[0].phase).toBe("night");
    expect(notes[0].text).toBe("imp is bluffing soldier");

    // Advance to Day 1 and add another: it must stamp the new phase.
    act(() => {
      result.current.advancePhase();
    });
    act(() => {
      result.current.addNotebookNote("alice executed");
    });
    const after = result.current.game?.notebookNotes ?? [];
    expect(after).toHaveLength(2);
    expect(after[1].day).toBe(1);
    expect(after[1].phase).toBe("day");
  });

  it("ignores empty or whitespace-only notes", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.addNotebookNote("   ");
    });
    expect(result.current.game?.notebookNotes ?? []).toHaveLength(0);
  });

  it("removes a note by id and persists the change", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.addNotebookNote("keep me");
    });
    act(() => {
      result.current.addNotebookNote("delete me");
    });
    const before = result.current.game?.notebookNotes ?? [];
    expect(before).toHaveLength(2);
    const toRemove = before.find((n) => n.text === "delete me")!;
    act(() => {
      result.current.removeNotebookNote(toRemove.id);
    });
    const after = result.current.game?.notebookNotes ?? [];
    expect(after).toHaveLength(1);
    expect(after[0].text).toBe("keep me");

    // localStorage reflects the removal.
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.notebookNotes).toHaveLength(1);
    expect(stored.notebookNotes[0].text).toBe("keep me");
  });

  it("persists a note across a fresh hook mount (localStorage readback)", () => {
    const first = renderHook(() => usePlayerGame());
    act(() => {
      first.result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      first.result.current.addNotebookNote("survives reload");
    });
    // A new hook instance reads from the same localStorage key.
    const second = renderHook(() => usePlayerGame());
    const notes = second.result.current.game?.notebookNotes ?? [];
    expect(notes).toHaveLength(1);
    expect(notes[0].text).toBe("survives reload");
  });
});

describe("notebook migration of legacy saves", () => {
  it("backfills a missing notebookNotes array to empty", () => {
    const legacy = {
      id: "legacy-nb",
      createdAt: new Date().toISOString(),
      playerCount: 5,
      currentDay: 1,
      phase: "night",
      players: [{ id: "p1", name: "A", isAlive: true, status: "alive" }],
      deathRecords: [],
      travelerEvents: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const { result } = renderHook(() => usePlayerGame());
    expect(result.current.game?.notebookNotes).toEqual([]);
  });

  it("leaves existing notes untouched (idempotent migration)", () => {
    const existing = {
      id: "has-notes",
      createdAt: new Date().toISOString(),
      playerCount: 5,
      currentDay: 2,
      phase: "day",
      players: [{ id: "p1", name: "A", isAlive: true, status: "alive" }],
      deathRecords: [],
      travelerEvents: [],
      notebookNotes: [
        { id: "n1", day: 1, phase: "night", text: "old note", createdAt: new Date().toISOString() },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    const { result } = renderHook(() => usePlayerGame());
    const notes = result.current.game?.notebookNotes ?? [];
    expect(notes).toHaveLength(1);
    expect(notes[0].text).toBe("old note");
  });
});
