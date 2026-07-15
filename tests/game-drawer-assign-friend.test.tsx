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

function renderTracker(game: PlayerGame, onUpdatePlayerName: (id: string, name: string) => void = () => {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const noop = () => {};
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
        onSetPrimaryClaim={noop}
        onRemoveClaim={noop}
        onSetNotes={noop}
        onUpdatePlayerName={onUpdatePlayerName}
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

async function openNameEditor(playerId: string) {
  fireEvent.click(screen.getByTestId(`button-player-name-${playerId}`));
  fireEvent.click(await screen.findByTestId("button-edit-player-name"));
  await screen.findByTestId("input-edit-player-name");
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => cleanup());

describe("Assign friend from player drawer", () => {
  it("hides the From Friends section when there are no friends", async () => {
    renderTracker(makeGame(["Player 1", "Player 2"]));

    await openNameEditor("player-0");

    expect(screen.queryByTestId("section-from-friends")).toBeNull();
  });

  it("shows friends while editing and picking one fills the name field", async () => {
    seedFriends(["Logan", "Sam"]);
    renderTracker(makeGame(["Player 1", "Player 2"]));

    await openNameEditor("player-0");

    const section = await screen.findByTestId("section-from-friends");
    expect(section).toBeTruthy();

    fireEvent.click(screen.getByTestId("button-assign-friend-local-1"));

    const input = screen.getByTestId("input-edit-player-name") as HTMLInputElement;
    expect(input.value).toBe("Logan");
  });

  it("saving after a pick persists via onUpdatePlayerName", async () => {
    seedFriends(["Logan"]);
    const onUpdatePlayerName = vi.fn();
    renderTracker(makeGame(["Player 1", "Player 2"]), onUpdatePlayerName);

    await openNameEditor("player-0");
    fireEvent.click(await screen.findByTestId("button-assign-friend-local-1"));
    fireEvent.keyDown(screen.getByTestId("input-edit-player-name"), { key: "Enter" });

    expect(onUpdatePlayerName).toHaveBeenCalledWith("player-0", "Logan");
  });

  it("greys out and disables a friend seated on another seat, case-insensitive", async () => {
    seedFriends(["Logan", "Sam"]);
    renderTracker(makeGame(["Player 1", "logan "]));

    await openNameEditor("player-0");
    await screen.findByTestId("section-from-friends");

    const loganBtn = screen.getByTestId("button-assign-friend-local-1") as HTMLButtonElement;
    const samBtn = screen.getByTestId("button-assign-friend-local-2") as HTMLButtonElement;
    expect(loganBtn.disabled).toBe(true);
    expect(loganBtn.textContent).toContain("seated");
    expect(samBtn.disabled).toBe(false);

    fireEvent.click(loganBtn);
    const input = screen.getByTestId("input-edit-player-name") as HTMLInputElement;
    expect(input.value).toBe("Player 1");
  });

  it("does not block a friend matching this seat's own name", async () => {
    seedFriends(["Logan"]);
    renderTracker(makeGame(["Logan", "Player 2"]));

    await openNameEditor("player-0");
    await screen.findByTestId("section-from-friends");

    const loganBtn = screen.getByTestId("button-assign-friend-local-1") as HTMLButtonElement;
    expect(loganBtn.disabled).toBe(false);
  });

  it("free-text rename still works unchanged", async () => {
    seedFriends(["Logan"]);
    const onUpdatePlayerName = vi.fn();
    renderTracker(makeGame(["Player 1", "Player 2"]), onUpdatePlayerName);

    await openNameEditor("player-0");
    const input = screen.getByTestId("input-edit-player-name");
    fireEvent.change(input, { target: { value: "Kara" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdatePlayerName).toHaveBeenCalledWith("player-0", "Kara");
  });
});
