// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { usePlayerGame } from "@/hooks/use-player-game";
import { latestClaimId } from "@/features/game/claims";

const STORAGE_KEY = "clocktower_player_game";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

function startGame() {
  const hook = renderHook(() => usePlayerGame());
  act(() => {
    hook.result.current.createGame(5, ["A", "B", "C", "D", "E"]);
  });
  return hook;
}

function firstPlayerId(hook: ReturnType<typeof startGame>) {
  return hook.result.current.game!.players[0].id;
}

function findPlayer(hook: ReturnType<typeof startGame>, playerId: string) {
  return hook.result.current.game!.players.find((p) => p.id === playerId)!;
}

describe("claims in the order made, newest shown on the seat", () => {
  it("records claims in tap order; the last one tapped is the newest", () => {
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian", "chef"]);
    });
    const player = findPlayer(hook, pid);
    expect(player.claims).toEqual(["washerwoman", "librarian", "chef"]);
    expect(latestClaimId(player)).toBe("chef");
  });

  it("appends new claims after existing ones; the newest moves to the latest add", () => {
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian"]);
    });
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["chef", "investigator"]);
    });
    const player = findPlayer(hook, pid);
    expect(player.claims).toEqual(["washerwoman", "librarian", "chef", "investigator"]);
    expect(latestClaimId(player)).toBe("investigator");
  });

  it("ignores duplicate claims when appending", () => {
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian"]);
    });
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["librarian", "chef"]);
    });
    const player = findPlayer(hook, pid);
    expect(player.claims).toEqual(["washerwoman", "librarian", "chef"]);
  });

  it("removing the newest claim falls back to the one made before it", () => {
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian", "chef"]);
    });
    act(() => {
      hook.result.current.removeClaim(pid, "chef");
    });
    const player = findPlayer(hook, pid);
    expect(player.claims).toEqual(["washerwoman", "librarian"]);
    expect(latestClaimId(player)).toBe("librarian");
  });

  it("removing an older claim leaves the newest unchanged", () => {
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian", "chef"]);
    });
    act(() => {
      hook.result.current.removeClaim(pid, "librarian");
    });
    const player = findPlayer(hook, pid);
    expect(player.claims).toEqual(["washerwoman", "chef"]);
    expect(latestClaimId(player)).toBe("chef");
  });

  it("keeps claimRecords consistent with claims after add and remove", () => {
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian", "chef"]);
    });
    act(() => {
      hook.result.current.removeClaim(pid, "washerwoman");
    });
    const player = findPlayer(hook, pid);
    const recordIds = (player.claimRecords ?? []).map((r) => r.characterId).sort();
    expect(recordIds).toEqual([...player.claims].sort());
    expect(player.claims).toEqual(["librarian", "chef"]);
  });

  it("the seat's newest claim follows separate adds, not array position", () => {
    // Circle and List show latestClaimId(player). Separate adds get later
    // timestamps, so the newest is the last one added.
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addClaim(pid, "washerwoman");
    });
    act(() => {
      hook.result.current.addClaim(pid, "librarian");
    });
    act(() => {
      hook.result.current.removeClaim(pid, "librarian");
    });
    const player = findPlayer(hook, pid);
    expect(player.claims).toEqual(["washerwoman"]);
    expect(latestClaimId(player)).toBe("washerwoman");
  });

  it("latestClaimId picks the latest record even when claims were reordered", () => {
    // Saves from before the seat sheet could have moved a claim to the front.
    const player = {
      id: "p1",
      name: "A",
      isAlive: true,
      status: "alive" as const,
      notes: "",
      claims: ["chef", "washerwoman"],
      claimRecords: [
        { characterId: "washerwoman", addedAt: "2026-01-01T10:00:00.000Z", day: 1 },
        { characterId: "chef", addedAt: "2026-01-01T09:00:00.000Z", day: 1 },
      ],
    };
    expect(latestClaimId(player)).toBe("washerwoman");
  });

  it("latestClaimId is null without claims", () => {
    expect(latestClaimId({ id: "p", name: "A", isAlive: true, status: "alive", notes: "", claims: [] })).toBeNull();
  });

  it("loads an old saved game with its claim order intact", () => {
    const legacy = {
      id: "legacy-claims",
      createdAt: new Date().toISOString(),
      playerCount: 5,
      currentDay: 1,
      phase: "day",
      players: [
        {
          id: "p1",
          name: "A",
          isAlive: true,
          status: "alive",
          claims: ["chef", "washerwoman", "librarian"],
        },
      ],
      deathRecords: [],
      travelerEvents: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const hook = renderHook(() => usePlayerGame());
    const player = hook.result.current.game!.players[0];
    expect(player.claims).toEqual(["chef", "washerwoman", "librarian"]);
    // No claim records in a legacy save: the last claim counts as newest.
    expect(latestClaimId(player)).toBe("librarian");
  });
});
