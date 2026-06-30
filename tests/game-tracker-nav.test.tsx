// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameTrackerView } from "@/pages/Game";
import { OFFICIAL_SCRIPTS } from "@/lib/game-data";
import type { PlayerGame } from "@/hooks/use-player-game";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const TB = OFFICIAL_SCRIPTS.find(s => s.id === "tb")!;

function makeGame(overrides: Partial<PlayerGame> = {}): PlayerGame {
  return {
    id: "g1",
    createdAt: new Date().toISOString(),
    playerCount: 7,
    breakdown: { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
    players: [
      { id: "p1", name: "Alice", isAlive: true, status: "alive", notes: "", claims: [] },
      { id: "p2", name: "Bob", isAlive: true, status: "alive", notes: "", claims: [] },
    ],
    currentDay: 1,
    phase: "night",
    script: { id: "tb" },
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

describe("GameTrackerView bottom navigation", () => {
  it("renders the 4-tab bottom nav and no longer renders the old top toggle", () => {
    renderTracker(makeGame());
    expect(screen.getByTestId("nav-grim")).toBeTruthy();
    expect(screen.getByTestId("nav-list")).toBeTruthy();
    expect(screen.getByTestId("nav-notebook")).toBeTruthy();
    expect(screen.getByTestId("nav-script")).toBeTruthy();
    expect(screen.queryByTestId("tab-list")).toBeNull();
    expect(screen.queryByTestId("tab-circle")).toBeNull();
    expect(screen.queryByTestId("tab-log")).toBeNull();
  });

  it("switches to the Script tab and renders the resolved script sheet", () => {
    renderTracker(makeGame());
    fireEvent.click(screen.getByTestId("nav-script"));
    expect(screen.getByTestId("script-sheet")).toBeTruthy();
    expect(screen.getAllByTestId(/^button-script-char-/).length).toBeGreaterThan(0);
    expect(screen.queryByTestId("text-script-nudge-game")).toBeNull();
  });

  it("shows the nudge on the Script tab when no script is selected", () => {
    renderTracker(makeGame({ script: null }));
    fireEvent.click(screen.getByTestId("nav-script"));
    expect(screen.getByTestId("text-script-nudge-game")).toBeTruthy();
    expect(screen.queryByTestId("script-sheet")).toBeNull();
  });

  it("opens the character drawer with the correct CharacterCard when a script row is tapped", () => {
    renderTracker(makeGame());
    fireEvent.click(screen.getByTestId("nav-script"));
    fireEvent.click(screen.getByTestId("button-script-char-imp"));
    expect(screen.getByTestId("drawer-character-imp")).toBeTruthy();
  });

  it("resets the open sheet selection when leaving the Script tab", () => {
    renderTracker(makeGame());
    fireEvent.click(screen.getByTestId("nav-script"));
    fireEvent.click(screen.getByTestId("button-script-char-imp"));
    expect(screen.getByTestId("drawer-character-imp")).toBeTruthy();
    fireEvent.click(screen.getByTestId("nav-list"));
    expect(screen.queryByTestId("drawer-character-imp")).toBeNull();
  });
});
