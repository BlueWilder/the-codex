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

describe("ordered claims with a primary candidate", () => {
  it("records claims in tap order, first tapped becomes primary on an empty seat", () => {
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian", "chef"]);
    });
    const player = findPlayer(hook, pid);
    expect(player.claims).toEqual(["washerwoman", "librarian", "chef"]);
    expect(player.claims[0]).toBe("washerwoman");
  });

  it("appends new claims after existing ones without changing the primary", () => {
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
    expect(player.claims[0]).toBe("washerwoman");
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

  it("removing the primary promotes the next claim to primary", () => {
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian", "chef"]);
    });
    act(() => {
      hook.result.current.removeClaim(pid, "washerwoman");
    });
    const player = findPlayer(hook, pid);
    expect(player.claims).toEqual(["librarian", "chef"]);
    expect(player.claims[0]).toBe("librarian");
  });

  it("removing a non-primary claim leaves the primary unchanged", () => {
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
    expect(player.claims[0]).toBe("washerwoman");
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

  it("the circle node primary reflects claims[0] after the primary is removed", () => {
    // The circle node reads firstClaim = player.claims[0] (Game.tsx). Removing
    // the primary promotes the next claim, which surfaces as the seat's claims[0].
    const hook = startGame();
    const pid = firstPlayerId(hook);
    act(() => {
      hook.result.current.addMultipleClaims(pid, ["washerwoman", "librarian", "chef"]);
    });
    act(() => {
      hook.result.current.removeClaim(pid, "washerwoman");
    });
    const player = findPlayer(hook, pid);
    expect(player.claims[0]).toBe("librarian");
    expect(player.claims).toEqual(["librarian", "chef"]);
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
      nominations: [],
      exileVotes: [],
      deathRecords: [],
      travelerEvents: [],
      ghostVoteEvents: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const hook = renderHook(() => usePlayerGame());
    const player = hook.result.current.game!.players[0];
    expect(player.claims).toEqual(["chef", "washerwoman", "librarian"]);
    expect(player.claims[0]).toBe("chef");
  });
});
