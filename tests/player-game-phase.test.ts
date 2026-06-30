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

describe("day/night phase spine", () => {
  it("starts a new game at Night 1", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    expect(result.current.game?.phase).toBe("night");
    expect(result.current.game?.currentDay).toBe(1);
  });

  it("advances Night N to Day N without changing the day number", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.advancePhase();
    });
    expect(result.current.game?.phase).toBe("day");
    expect(result.current.game?.currentDay).toBe(1);
  });

  it("advances Day N to Night N+1, incrementing the day number", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.advancePhase(); // Night 1 -> Day 1
    });
    act(() => {
      result.current.advancePhase(); // Day 1 -> Night 2
    });
    expect(result.current.game?.phase).toBe("night");
    expect(result.current.game?.currentDay).toBe(2);
  });

  it("regresses Day N back to Night N on the same day", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.advancePhase(); // Night 1 -> Day 1
    });
    act(() => {
      result.current.regressPhase(); // Day 1 -> Night 1
    });
    expect(result.current.game?.phase).toBe("night");
    expect(result.current.game?.currentDay).toBe(1);
  });

  it("regresses Night N back to Day N-1", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.advancePhase(); // Night 1 -> Day 1
    });
    act(() => {
      result.current.advancePhase(); // Day 1 -> Night 2
    });
    act(() => {
      result.current.regressPhase(); // Night 2 -> Day 1
    });
    expect(result.current.game?.phase).toBe("day");
    expect(result.current.game?.currentDay).toBe(1);
  });

  it("never regresses before Night 1", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.regressPhase(); // already at Night 1, no-op
    });
    expect(result.current.game?.phase).toBe("night");
    expect(result.current.game?.currentDay).toBe(1);
  });
});

describe("toggleAlive death records by phase", () => {
  it("records an execution when a player is marked dead during the day", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.advancePhase(); // Night 1 -> Day 1
    });
    const target = result.current.game!.players[0].id;
    act(() => {
      result.current.toggleAlive(target);
    });
    const records = result.current.game?.deathRecords ?? [];
    expect(records[0]?.type).toBe("execution");
    expect(records[0]?.phase).toBe("day");
  });

  it("records a night death when a player is marked dead at night", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    const target = result.current.game!.players[0].id;
    act(() => {
      result.current.toggleAlive(target);
    });
    const records = result.current.game?.deathRecords ?? [];
    expect(records[0]?.type).toBe("night");
    expect(records[0]?.phase).toBe("night");
  });

  it("records an execution when setPlayerStatus marks a player dead during the day", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    act(() => {
      result.current.advancePhase(); // Night 1 -> Day 1
    });
    const target = result.current.game!.players[0].id;
    act(() => {
      result.current.setPlayerStatus(target, "dead");
    });
    const records = result.current.game?.deathRecords ?? [];
    expect(records[0]?.type).toBe("execution");
    expect(records[0]?.phase).toBe("day");
  });

  it("re-kills after a same-day revival, keeping the latest death type correct", () => {
    const { result } = renderHook(() => usePlayerGame());
    act(() => {
      result.current.createGame(5, ["A", "B", "C", "D", "E"]);
    });
    const target = result.current.game!.players[0].id;
    // Night 1: killed in the night.
    act(() => {
      result.current.toggleAlive(target);
    });
    // Revived (still Night 1).
    act(() => {
      result.current.toggleAlive(target);
    });
    // Advance to Day 1 and execute.
    act(() => {
      result.current.advancePhase();
    });
    act(() => {
      result.current.toggleAlive(target);
    });
    const records = (result.current.game?.deathRecords ?? []).filter(
      (r) => r.playerId === target,
    );
    // Both deaths recorded (night kill + day execution), latest is the execution.
    const latest = records[records.length - 1];
    expect(latest.type).toBe("execution");
    expect(latest.phase).toBe("day");
    expect(records.some((r) => r.type === "night")).toBe(true);
  });
});

describe("phase migration of legacy saves", () => {
  it("backfills a missing game phase to day", () => {
    const legacy = {
      id: "legacy-1",
      createdAt: new Date().toISOString(),
      playerCount: 5,
      currentDay: 2,
      players: [{ id: "p1", name: "A", isAlive: true, status: "alive" }],
      deathRecords: [],
      travelerEvents: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const { result } = renderHook(() => usePlayerGame());
    expect(result.current.game?.phase).toBe("day");
  });

  it("backfills each death record phase from its type", () => {
    const legacy = {
      id: "legacy-2",
      createdAt: new Date().toISOString(),
      playerCount: 5,
      currentDay: 3,
      players: [{ id: "p1", name: "A", isAlive: false, status: "dead" }],
      deathRecords: [
        { playerId: "p1", playerName: "A", type: "night", day: 2 },
        { playerId: "p2", playerName: "B", type: "execution", day: 1 },
        { playerId: "p3", playerName: "C", type: "exile", day: 1 },
      ],
      travelerEvents: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const { result } = renderHook(() => usePlayerGame());
    const records = result.current.game?.deathRecords ?? [];
    expect(records.find((r) => r.type === "night")?.phase).toBe("night");
    expect(records.find((r) => r.type === "execution")?.phase).toBe("day");
    expect(records.find((r) => r.type === "exile")?.phase).toBe("day");
  });

  it("leaves an explicit phase untouched", () => {
    const current = {
      id: "current-1",
      createdAt: new Date().toISOString(),
      playerCount: 5,
      currentDay: 1,
      phase: "night",
      players: [{ id: "p1", name: "A", isAlive: true, status: "alive" }],
      deathRecords: [],
      travelerEvents: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    const { result } = renderHook(() => usePlayerGame());
    expect(result.current.game?.phase).toBe("night");
  });
});
