// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeatSheet, GameTrackerView } from "@/pages/Game";
import { useGameTracker } from "@/features/game/state/use-game-tracker";
import type { GamePlayer } from "@/hooks/use-player-game";

function makePlayer(overrides: Partial<GamePlayer> & { id: string; name: string }): GamePlayer {
  return {
    isAlive: true,
    status: "alive",
    claims: [],
    notes: "",
    isTraveler: false,
    ...overrides,
  } as GamePlayer;
}

type SheetProps = Parameters<typeof SeatSheet>[0];

function renderSheet(player: GamePlayer, props: Partial<SheetProps> = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const noop = () => {};
  return render(
    <QueryClientProvider client={client}>
      <SeatSheet
        player={player}
        players={props.players ?? [player]}
        scriptCharacterIds={props.scriptCharacterIds ?? ["washerwoman", "chef", "drunk", "poisoner", "imp"]}
        onClose={props.onClose ?? noop}
        onToggleAlive={props.onToggleAlive ?? noop}
        onSetPlayerStatus={props.onSetPlayerStatus}
        onAddClaim={props.onAddClaim ?? noop}
        onRemoveClaim={props.onRemoveClaim ?? noop}
        onSetNotes={props.onSetNotes ?? noop}
        onSetPlayerName={props.onSetPlayerName ?? noop}
        onConvertToTraveler={props.onConvertToTraveler}
        onRemovePlayer={props.onRemovePlayer}
        canRemovePlayer={props.canRemovePlayer}
      />
    </QueryClientProvider>,
  );
}

function openSeatMenu() {
  // Radix DropdownMenu opens on pointerdown, not click.
  fireEvent.pointerDown(screen.getByTestId("button-seat-menu"), {
    button: 0,
    ctrlKey: false,
    pointerType: "mouse",
  });
}

// jsdom has no pointer capture; vaul calls it when a pointerdown (the seat
// menu trigger) bubbles through the sheet.
beforeEach(() => {
  localStorage.clear();
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    Element.prototype.hasPointerCapture = () => false;
  }
});
afterEach(cleanup);

describe("Seat sheet header", () => {
  it("shows the player name and no seat number", () => {
    const other = makePlayer({ id: "p0", name: "Zed" });
    const player = makePlayer({ id: "p1", name: "Alice" });
    renderSheet(player, { players: [other, player] });
    expect(screen.getByTestId("sheet-seat-p1")).toBeTruthy();
    expect(screen.getByTestId("text-seat-sheet-name").textContent).toBe("Alice");
    expect(screen.queryByTestId("medallion-seat-detail")).toBeNull();
    expect(screen.queryByText("2")).toBeNull();
  });

  it("names an unnamed seat Player N", () => {
    const other = makePlayer({ id: "p0", name: "Zed" });
    const player = makePlayer({ id: "p1", name: "  " });
    renderSheet(player, { players: [other, player] });
    expect(screen.getByTestId("text-seat-sheet-name").textContent).toBe("Player 2");
  });

  it("toggles alive and dead with a smiley or a skull", () => {
    const onToggleAlive = vi.fn();
    const { unmount } = renderSheet(makePlayer({ id: "p1", name: "Alice" }), { onToggleAlive });
    const toggle = screen.getByTestId("button-toggle-alive");
    expect(toggle.getAttribute("data-state")).toBe("alive");
    expect(toggle.querySelector(".lucide-smile")).not.toBeNull();
    fireEvent.click(toggle);
    expect(onToggleAlive).toHaveBeenCalledTimes(1);
    unmount();

    renderSheet(makePlayer({ id: "p2", name: "Bob", status: "dead", isAlive: false }));
    const deadToggle = screen.getByTestId("button-toggle-alive");
    expect(deadToggle.getAttribute("data-state")).toBe("dead");
    expect(deadToggle.querySelector(".lucide-skull")).not.toBeNull();
  });

  it("holds Rename, Make Traveler and Remove Player in the seat menu", async () => {
    const onConvertToTraveler = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice" }), {
      onConvertToTraveler,
      onRemovePlayer: vi.fn(),
    });
    openSeatMenu();
    expect(await screen.findByTestId("button-edit-player-name")).toBeTruthy();
    expect(screen.getByTestId("button-remove-player").textContent).toContain("Remove Player");
    fireEvent.click(screen.getByTestId("button-convert-to-traveler"));
    expect(onConvertToTraveler).toHaveBeenCalledTimes(1);
  });

  it("renames from the seat menu", async () => {
    const onSetPlayerName = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice" }), { onSetPlayerName });
    openSeatMenu();
    fireEvent.click(await screen.findByTestId("button-edit-player-name"));
    const input = await screen.findByTestId("input-edit-player-name");
    fireEvent.change(input, { target: { value: "Alicia" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSetPlayerName).toHaveBeenCalledWith("Alicia");
  });

  it("confirms before removing a player", async () => {
    const onRemovePlayer = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice" }), { onRemovePlayer });
    openSeatMenu();
    fireEvent.click(await screen.findByTestId("button-remove-player"));
    expect(onRemovePlayer).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByTestId("button-confirm-remove"));
    expect(onRemovePlayer).toHaveBeenCalledTimes(1);
  });
});

describe("Seat sheet claims", () => {
  it("shows every claim as a team chip, with no believed tag or was label", () => {
    renderSheet(makePlayer({ id: "p1", name: "Alice", claims: ["chef", "imp"] }));
    const chef = screen.getByTestId("chip-claim-chef-p1");
    const imp = screen.getByTestId("chip-claim-imp-p1");
    expect(chef.getAttribute("data-team")).toBe("townsfolk");
    expect(imp.getAttribute("data-team")).toBe("demon");
    expect(chef.className).toContain("border-[1.5px]");
    expect(screen.queryByTestId("tag-believed-p1")).toBeNull();
    expect(screen.queryByTestId("chip-primary-p1")).toBeNull();
    expect(screen.queryByText(/believed/i)).toBeNull();
    expect(screen.queryByText(/^was /)).toBeNull();
  });

  it("removes a claim with the x on its chip", () => {
    const onRemoveClaim = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice", claims: ["chef", "imp"] }), { onRemoveClaim });
    fireEvent.click(screen.getByTestId("button-remove-claim-imp-p1"));
    expect(onRemoveClaim).toHaveBeenCalledWith("imp");
  });

  it("tapping a chip does nothing but its x", () => {
    const onRemoveClaim = vi.fn();
    const onAddClaim = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice", claims: ["chef", "imp"] }), { onRemoveClaim, onAddClaim });
    fireEvent.click(screen.getByTestId("chip-claim-imp-p1"));
    expect(onRemoveClaim).not.toHaveBeenCalled();
    expect(onAddClaim).not.toHaveBeenCalled();
  });

  it("shows an empty state without claims", () => {
    renderSheet(makePlayer({ id: "p1", name: "Alice" }));
    expect(screen.getByTestId("text-no-claims-p1")).toBeTruthy();
  });
});

describe("Seat sheet character list", () => {
  it("groups the script's characters by team", () => {
    renderSheet(makePlayer({ id: "p1", name: "Alice" }));
    const townsfolk = screen.getByTestId("section-team-townsfolk");
    expect(within(townsfolk).getByTestId("button-select-character-washerwoman")).toBeTruthy();
    expect(within(townsfolk).getByTestId("button-select-character-chef")).toBeTruthy();
    expect(within(screen.getByTestId("section-team-outsider")).getByTestId("button-select-character-drunk")).toBeTruthy();
    expect(within(screen.getByTestId("section-team-minion")).getByTestId("button-select-character-poisoner")).toBeTruthy();
    expect(within(screen.getByTestId("section-team-demon")).getByTestId("button-select-character-imp")).toBeTruthy();
    // Off-script characters are not offered.
    expect(screen.queryByTestId("button-select-character-baron")).toBeNull();
    // Each card shows the ability text.
    expect(screen.getByTestId("button-select-character-imp").textContent).toContain("Each night*");
  });

  it("adds a claim on tap and stays open", () => {
    const onAddClaim = vi.fn();
    const onClose = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice" }), { onAddClaim, onClose });
    fireEvent.click(screen.getByTestId("button-select-character-chef"));
    expect(onAddClaim).toHaveBeenCalledWith("chef");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("sheet-seat-p1")).toBeTruthy();
  });

  it("dims characters this player already claimed and ignores taps on them", () => {
    const onAddClaim = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice", claims: ["chef"] }), { onAddClaim });
    const chef = screen.getByTestId("button-select-character-chef");
    expect(chef.className).toContain("opacity-60");
    expect(chef.getAttribute("data-claimed")).toBe("true");
    fireEvent.click(chef);
    expect(onAddClaim).not.toHaveBeenCalled();
    expect(screen.getByTestId("button-select-character-washerwoman").className).not.toContain("opacity-60");
  });

  it("filters by search", () => {
    renderSheet(makePlayer({ id: "p1", name: "Alice" }));
    fireEvent.change(screen.getByTestId("input-search-character"), { target: { value: "poi" } });
    expect(screen.getByTestId("button-select-character-poisoner")).toBeTruthy();
    expect(screen.queryByTestId("button-select-character-chef")).toBeNull();
    expect(screen.queryByTestId("section-team-townsfolk")).toBeNull();
  });
});

describe("Seat sheet note", () => {
  it("edits the player's note and expands on focus", () => {
    const onSetNotes = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice", notes: "quiet" }), { onSetNotes });
    const note = screen.getByTestId("textarea-notes") as HTMLTextAreaElement;
    expect(note.value).toBe("quiet");
    expect(note.getAttribute("data-state")).toBe("closed");
    fireEvent.focus(note);
    expect(note.getAttribute("data-state")).toBe("open");
    fireEvent.change(note, { target: { value: "quiet, claimed chef" } });
    expect(onSetNotes).toHaveBeenCalledWith("quiet, claimed chef");
  });
});

describe("Seat sheet with live game state", () => {
  const GAME_KEY = "clocktower_player_game";

  function seedGame() {
    localStorage.setItem(
      GAME_KEY,
      JSON.stringify({
        id: "flow",
        createdAt: new Date().toISOString(),
        playerCount: 5,
        breakdown: { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
        currentDay: 1,
        phase: "night",
        players: ["Alice", "Bob", "Cara", "Dan", "Eve"].map((name, i) => ({
          id: `player-${i}`,
          name,
          isAlive: true,
          status: "alive",
          notes: "",
          claims: [],
        })),
        script: null,
      }),
    );
  }

  function Harness() {
    const t = useGameTracker();
    if (!t.game) return null;
    return (
      <GameTrackerView
        game={t.game}
        onEndGame={t.endGame}
        onPlayAgain={t.playAgain}
        onToggleAlive={t.toggleAlive}
        onSetPlayerStatus={t.setPlayerStatus}
        onAddClaim={t.addClaim}
        onRemoveClaim={t.removeClaim}
        onSetNotes={t.setNotes}
        onUpdatePlayerName={t.updatePlayerName}
        onReorderPlayers={t.reorderPlayers}
        onReversePlayers={t.reversePlayers}
        onClearScript={t.clearScript}
        onSetScript={t.setScript}
        onAddTraveler={t.addTraveler}
        onConvertToTraveler={t.convertToTraveler}
        onRemoveTraveler={t.removeTraveler}
        onSetGameNotes={t.setGameNotes}
        onAddNotebookNote={t.addNotebookNote}
        onRemoveNotebookNote={t.removeNotebookNote}
        onAddPlayer={t.addPlayer}
        onRemovePlayer={t.removePlayer}
        onSetCirclePosition={t.setCirclePosition}
        onSetMultipleCirclePositions={t.setMultipleCirclePositions}
        onResetCirclePositions={t.resetCirclePositions}
      />
    );
  }

  it("adds and removes claims, toggles dead and keeps a note, then List and Circle show the newest claim", async () => {
    seedGame();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId("card-player-player-1"));
    const sheet = await screen.findByTestId("sheet-seat-player-1");
    expect(within(sheet).getByTestId("text-seat-sheet-name").textContent).toBe("Bob");

    // Add two claims; the sheet stays open and each becomes a chip.
    fireEvent.click(within(sheet).getByTestId("button-select-character-chef"));
    fireEvent.click(within(sheet).getByTestId("button-select-character-imp"));
    expect(within(sheet).getByTestId("chip-claim-chef-player-1")).toBeTruthy();
    expect(within(sheet).getByTestId("chip-claim-imp-player-1")).toBeTruthy();
    expect(within(sheet).getByTestId("button-select-character-imp").getAttribute("data-claimed")).toBe("true");
    expect(screen.getByTestId("text-claim-player-1").textContent).toBe("Imp");

    // Remove one; the newest remaining claim shows on the row.
    fireEvent.click(within(sheet).getByTestId("button-remove-claim-imp-player-1"));
    expect(within(sheet).queryByTestId("chip-claim-imp-player-1")).toBeNull();
    expect(screen.getByTestId("text-claim-player-1").textContent).toBe("Chef");

    // Toggle dead from the sheet header.
    fireEvent.click(within(sheet).getByTestId("button-toggle-alive"));
    expect(within(sheet).getByTestId("button-toggle-alive").getAttribute("data-state")).toBe("dead");

    // Write a note.
    fireEvent.change(within(sheet).getByTestId("textarea-notes"), { target: { value: "Bluffing?" } });

    // Close the sheet.
    fireEvent.keyDown(sheet, { key: "Escape" });
    await waitFor(() => expect(screen.queryByTestId("sheet-seat-player-1")).toBeNull());

    // List: newest claim in team color, dimmed row, shared toggle on skull, no skull medallion.
    expect(screen.getByTestId("text-claim-player-1").textContent).toBe("Chef");
    expect(screen.queryByTestId("overlay-shroud-player-1")).toBeNull();
    expect(screen.getByTestId("card-player-player-1").className).toContain("opacity-[0.55]");
    expect(screen.getByTestId("button-toggle-dead-player-1").getAttribute("data-state")).toBe("dead");

    // Circle: the same claim's icon in the medallion, dead seat under the shroud.
    fireEvent.click(screen.getByTestId("nav-grim"));
    expect((await screen.findByTestId("icon-seat-claim-player-1")).getAttribute("data-character")).toBe("chef");
    expect(screen.getByTestId("overlay-shroud-player-1")).toBeTruthy();

    // Tapping the circle seat opens the same sheet.
    fireEvent.click(screen.getByTestId("button-seat-token-player-1"));
    expect(await screen.findByTestId("sheet-seat-player-1")).toBeTruthy();

    // Everything persisted under the existing storage key.
    const saved = JSON.parse(localStorage.getItem(GAME_KEY)!);
    const bob = saved.players.find((p: GamePlayer) => p.id === "player-1");
    expect(bob.claims).toEqual(["chef"]);
    expect(bob.status).toBe("dead");
    expect(bob.notes).toBe("Bluffing?");
  });
});
