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
  it("renders no alive/dead filter or team-count row, and not the old verbose text", () => {
    renderTracker(makeGame());
    expect(screen.queryByTestId("filter-alive")).toBeNull();
    expect(screen.queryByTestId("filter-dead")).toBeNull();
    expect(screen.queryByTestId("section-role-count")).toBeNull();
    // Old verbose format is gone
    expect(screen.queryByText(/5 Townsfolk/)).toBeNull();
    expect(screen.queryByTestId("text-townsfolk-count")).toBeNull();
    // No team-count dots
    expect(screen.queryByTestId("role-dot-townsfolk")).toBeNull();
    expect(screen.queryByTestId("role-dot-outsider")).toBeNull();
    expect(screen.queryByTestId("role-dot-minion")).toBeNull();
    expect(screen.queryByTestId("role-dot-demon")).toBeNull();
    expect(screen.queryByTestId("role-dot-traveler")).toBeNull();
  });

  it("lists a traveler seat without a traveler count dot", () => {
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
    expect(screen.queryByTestId("role-dot-traveler")).toBeNull();
    expect(screen.getByTestId("card-player-t1")).toBeTruthy();
  });

  it("shows every seat, alive and dead, with no filter controls", () => {
    const game = makeGame({ players: makePlayers(7, ["p2", "p5"]) });
    renderTracker(game);
    expect(screen.queryByTestId("filter-alive")).toBeNull();
    expect(screen.queryByTestId("filter-dead")).toBeNull();

    // All 7 seats visible, including the two dead ones
    expect(screen.getAllByTestId(/^card-player-/).length).toBe(7);
  });
});
