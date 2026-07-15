// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameTrackerView } from "@/pages/Game";
import type { PlayerGame } from "@/hooks/use-player-game";

function makeGame(names: string[]): PlayerGame {
  return {
    id: "test-game",
    createdAt: new Date().toISOString(),
    playerCount: names.length,
    breakdown: { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
    currentDay: 1,
    phase: "day",
    players: names.map((name, i) => ({
      id: `player-${i}`,
      name,
      isAlive: true,
      status: "alive" as const,
      notes: "",
      claims: [],
    })),
    script: null,
  };
}

function renderTracker(game: PlayerGame, onEndGame: () => void) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const noop = () => {};
  return render(
    <QueryClientProvider client={client}>
      <GameTrackerView
        game={game}
        onEndGame={onEndGame}
        onPlayAgain={noop}
        onToggleAlive={noop}
        onSetPlayerStatus={noop}
        onAddClaim={noop}
        onAddMultipleClaims={noop}
        onSetPrimaryClaim={noop}
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

function seedFriends(names: string[]) {
  localStorage.setItem(
    "clocktower_friends",
    JSON.stringify(names.map((name, i) => ({ id: `local-${i + 1}`, name }))),
  );
}

function getFriendNames(): string[] {
  const stored = localStorage.getItem("clocktower_friends");
  return stored ? JSON.parse(stored).map((f: { name: string }) => f.name) : [];
}

async function clickConfirmEnd() {
  // Radix DropdownMenu opens on pointerdown, not click.
  fireEvent.pointerDown(
    screen.getByTestId("button-overflow-menu"),
    { button: 0, ctrlKey: false, pointerType: "mouse" },
  );
  fireEvent.click(await screen.findByTestId("button-end-game"));
  fireEvent.click(await screen.findByTestId("button-confirm-end"));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => cleanup());

describe("End Game friend capture", () => {
  it("ends immediately with no dialog when all names are placeholders", async () => {
    const onEndGame = vi.fn();
    renderTracker(makeGame(["Player 1", "Player 2", "Traveler 1"]), onEndGame);

    await clickConfirmEnd();

    expect(onEndGame).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("dialog-capture-friends")).toBeNull();
  });

  it("ends immediately when every typed name is already a friend", async () => {
    seedFriends(["Eddie", "Eric"]);
    const onEndGame = vi.fn();
    renderTracker(makeGame(["eddie", "ERIC", "Player 3"]), onEndGame);

    await clickConfirmEnd();

    expect(onEndGame).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("dialog-capture-friends")).toBeNull();
  });

  it("shows only new names, excluding placeholders, friends, and duplicates", async () => {
    seedFriends(["Eddie"]);
    const onEndGame = vi.fn();
    renderTracker(
      makeGame(["Eddie", "Logan", "logan", "Sam", "Player 5"]),
      onEndGame,
    );

    await clickConfirmEnd();

    expect(onEndGame).not.toHaveBeenCalled();
    await screen.findByTestId("dialog-capture-friends");
    expect(screen.getByTestId("capture-chip-Logan")).toBeTruthy();
    expect(screen.getByTestId("capture-chip-Sam")).toBeTruthy();
    expect(screen.queryByTestId("capture-chip-Eddie")).toBeNull();
    expect(screen.queryByTestId("capture-chip-logan")).toBeNull();
    expect(screen.queryByTestId("capture-chip-Player 5")).toBeNull();
  });

  it("Save adds the still-selected names then ends the game", async () => {
    seedFriends(["Eddie"]);
    const onEndGame = vi.fn();
    renderTracker(makeGame(["Logan", "Sam"]), onEndGame);

    await clickConfirmEnd();
    await screen.findByTestId("dialog-capture-friends");

    // Deselect Sam; only Logan should be saved.
    fireEvent.click(screen.getByTestId("capture-chip-Sam"));
    fireEvent.click(screen.getByTestId("button-capture-save"));

    expect(onEndGame).toHaveBeenCalledTimes(1);
    expect(getFriendNames()).toEqual(["Eddie", "Logan"]);
  });

  it("Save persists multiple selected names at once when logged out", async () => {
    seedFriends(["Eddie"]);
    const onEndGame = vi.fn();
    renderTracker(makeGame(["Logan", "Sam", "Kara"]), onEndGame);

    await clickConfirmEnd();
    await screen.findByTestId("dialog-capture-friends");

    fireEvent.click(screen.getByTestId("button-capture-save"));

    expect(onEndGame).toHaveBeenCalledTimes(1);
    expect(getFriendNames()).toEqual(["Eddie", "Logan", "Sam", "Kara"]);
  });

  it("Not now ends the game without adding anyone", async () => {
    const onEndGame = vi.fn();
    renderTracker(makeGame(["Logan"]), onEndGame);

    await clickConfirmEnd();
    await screen.findByTestId("dialog-capture-friends");

    fireEvent.click(screen.getByTestId("button-capture-skip"));

    expect(onEndGame).toHaveBeenCalledTimes(1);
    expect(getFriendNames()).toEqual([]);
  });

  it("dismissing with Escape ends the game without adding anyone", async () => {
    const onEndGame = vi.fn();
    renderTracker(makeGame(["Logan"]), onEndGame);

    await clickConfirmEnd();
    const dialog = await screen.findByTestId("dialog-capture-friends");

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(onEndGame).toHaveBeenCalledTimes(1);
    expect(getFriendNames()).toEqual([]);
  });
});
