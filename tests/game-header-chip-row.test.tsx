// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameTrackerView } from "@/pages/Game";
import type { PlayerGame, GamePlayer } from "@/hooks/use-player-game";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

function makePlayers(count: number, deadIds: string[] = []): GamePlayer[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `p${i + 1}`;
    const dead = deadIds.includes(id);
    return {
      id,
      name: `Player ${i + 1}`,
      isAlive: !dead,
      status: dead ? ("dead" as const) : ("alive" as const),
      notes: "",
      claims: [],
    };
  });
}

function makeGame(overrides: Partial<PlayerGame> = {}): PlayerGame {
  return {
    id: "g1",
    createdAt: new Date().toISOString(),
    playerCount: 7,
    breakdown: { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
    players: makePlayers(7),
    currentDay: 1,
    phase: "day",
    script: null,
    deathRecords: [],
    travelerEvents: [],
    ...overrides,
  };
}

const noop = () => {};

function renderTracker(game: PlayerGame) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GameTrackerView
        game={game}
        onEndGame={noop}
        onPlayAgain={noop}
        onToggleAlive={noop}
        onSetPlayerStatus={noop}
        onAddClaim={noop}
        onAddMultipleClaims={noop}
        onRemoveClaim={noop}
        onSetNotes={noop}
        onUpdatePlayerName={noop}
        onAdvancePhase={noop}
        onRegressPhase={noop}
        onReorderPlayers={noop}
        onReversePlayers={noop}
        onClearScript={noop}
        onSetScript={noop}
        onAddTraveler={noop}
        onConvertToTraveler={noop}
        onRemoveTraveler={noop}
        onSetGameNotes={noop}
        onAddNotebookNote={noop}
        onRemoveNotebookNote={noop}
        onAddPlayer={noop}
        onRemovePlayer={noop}
        onSetCirclePosition={noop}
        onSetMultipleCirclePositions={noop}
        onResetCirclePositions={noop}
      />
    </QueryClientProvider>,
  );
}

describe("GameTrackerView merged header chip row", () => {
  it("renders one row with alive/dead filters and team dots, not the old verbose text", () => {
    renderTracker(makeGame());
    expect(screen.getByTestId("filter-alive")).toBeTruthy();
    expect(screen.getByTestId("filter-dead")).toBeTruthy();
    const dots = screen.getByTestId("section-role-count");
    expect(dots).toBeTruthy();
    // Old verbose format is gone
    expect(screen.queryByText(/5 Townsfolk/)).toBeNull();
    expect(screen.queryByTestId("text-townsfolk-count")).toBeNull();
    // Dots + counts (7 players: 5/0/1/1)
    expect(screen.getByTestId("role-dot-townsfolk").textContent).toBe("5");
    expect(screen.getByTestId("role-dot-outsider").textContent).toBe("0");
    expect(screen.getByTestId("role-dot-minion").textContent).toBe("1");
    expect(screen.getByTestId("role-dot-demon").textContent).toBe("1");
    // No travelers, so no traveler dot
    expect(screen.queryByTestId("role-dot-traveler")).toBeNull();
  });

  it("shows the traveler dot only when travelers exist", () => {
    const players = makePlayers(7);
    players.push({
      id: "t1",
      name: "Trav",
      isAlive: true,
      status: "alive",
      notes: "",
      claims: [],
      isTraveler: true,
    });
    renderTracker(makeGame({ players, playerCount: 8 }));
    expect(screen.getByTestId("role-dot-traveler").textContent).toBe("1");
  });

  it("shows correct alive/dead counts and filters the seat list on tap, toggling off on second tap", () => {
    const game = makeGame({ players: makePlayers(7, ["p2", "p5"]) });
    renderTracker(game);
    const alive = screen.getByTestId("filter-alive");
    const dead = screen.getByTestId("filter-dead");
    expect(alive.textContent).toContain("5");
    expect(dead.textContent).toContain("2");

    // All 7 seats visible initially
    expect(screen.getAllByTestId(/^card-player-/).length).toBe(7);

    // Filter alive
    fireEvent.click(alive);
    expect(screen.getAllByTestId(/^card-player-/).length).toBe(5);
    // Toggle off
    fireEvent.click(alive);
    expect(screen.getAllByTestId(/^card-player-/).length).toBe(7);

    // Filter dead
    fireEvent.click(dead);
    expect(screen.getAllByTestId(/^card-player-/).length).toBe(2);
    fireEvent.click(dead);
    expect(screen.getAllByTestId(/^card-player-/).length).toBe(7);
  });
});
