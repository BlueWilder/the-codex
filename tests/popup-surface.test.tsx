// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Game, { SeatSheet } from "@/pages/Game";
import type { GamePlayer } from "@/hooks/use-player-game";

// Menus, popovers and selects portal out of the surface they open from, so
// each one checks its trigger: from parchment it takes the parchment look,
// from the dark shell it keeps the dark one.

function Fixtures({ surface }: { surface: "parchment" | "shell" }) {
  return (
    <div className={surface === "parchment" ? "parchment-scope" : "game-chrome"}>
      <DropdownMenu open>
        <DropdownMenuTrigger>menu</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="fixture-menu">
          <DropdownMenuItem data-testid="fixture-menu-item">Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover open>
        <PopoverTrigger>popover</PopoverTrigger>
        <PopoverContent data-testid="fixture-popover">body</PopoverContent>
      </Popover>
      <Select open value="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent data-testid="fixture-select">
          <SelectItem value="a" data-testid="fixture-select-item">A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  // jsdom lacks these; Radix Select and vaul call them.
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

describe("Popups opened from parchment", () => {
  it("menus, popovers and selects take raised fill, ink text, border and 10px radius", () => {
    render(<Fixtures surface="parchment" />);
    for (const id of ["fixture-menu", "fixture-popover", "fixture-select"]) {
      const el = screen.getByTestId(id);
      expect(el.getAttribute("data-surface")).toBe("parchment");
      expect(el.className).toContain("parchment-scope");
      expect(el.className).toContain("bg-[var(--parchment-raised)]");
      expect(el.className).toContain("text-[var(--parchment-ink)]");
      expect(el.className).toContain("border-[var(--parchment-border)]");
      expect(el.className).toContain("rounded-[10px]");
      expect(el.className).not.toContain("bg-popover");
    }
  });

  it("gives items 44px rows with ink-muted icons", () => {
    render(<Fixtures surface="parchment" />);
    for (const id of ["fixture-menu-item", "fixture-select-item"]) {
      const cls = screen.getByTestId(id).className;
      expect(cls).toContain("min-h-11");
      expect(cls).toContain("[&_svg]:text-[var(--parchment-ink-muted)]");
    }
  });
});

describe("Popups opened from the dark shell", () => {
  it("keep the dark popover style", () => {
    render(<Fixtures surface="shell" />);
    for (const id of ["fixture-menu", "fixture-popover", "fixture-select"]) {
      const el = screen.getByTestId(id);
      expect(el.getAttribute("data-surface")).toBeNull();
      expect(el.className).not.toContain("parchment-scope");
      expect(el.className).toContain("bg-popover");
    }
    expect(screen.getByTestId("fixture-menu-item").className).not.toContain("min-h-11");
  });
});

describe("Real menus", () => {
  function withClient(ui: React.ReactElement) {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  }

  function pointerDown(testId: string) {
    // Radix DropdownMenu opens on pointerdown, not click.
    fireEvent.pointerDown(screen.getByTestId(testId), { button: 0, ctrlKey: false, pointerType: "mouse" });
  }

  it("the seat sheet ⋮ menu is parchment, with Rename and Make Traveler in ink", async () => {
    const player = {
      id: "p1", name: "Alice", isAlive: true, status: "alive", claims: [], notes: "", isTraveler: false,
    } as GamePlayer;
    const noop = () => {};
    withClient(
      <SeatSheet
        player={player}
        players={[player]}
        scriptCharacterIds={["washerwoman", "imp"]}
        onClose={noop}
        onToggleAlive={noop}
        onAddClaim={noop}
        onRemoveClaim={noop}
        onSetNotes={noop}
        onSetPlayerName={noop}
        onConvertToTraveler={noop}
        onRemovePlayer={noop}
        canRemovePlayer
      />,
    );
    pointerDown("button-seat-menu");
    const rename = await screen.findByTestId("button-edit-player-name");
    const menu = rename.closest("[role=menu]")!;
    expect(menu.getAttribute("data-surface")).toBe("parchment");
    for (const id of ["button-edit-player-name", "button-convert-to-traveler"]) {
      expect(screen.getByTestId(id).className).toContain("text-[var(--parchment-ink)]");
    }
    // Remove Player stays red, icon included.
    expect(screen.getByTestId("button-remove-player").className).toContain("[&_svg]:text-[var(--parchment-minion)]");
  });

  it("the in-game header ⋮ menu and script dropdown stay dark", async () => {
    localStorage.setItem(
      "clocktower_player_game",
      JSON.stringify({
        id: "g",
        createdAt: new Date().toISOString(),
        playerCount: 5,
        breakdown: { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
        currentDay: 1,
        phase: "night",
        players: ["A", "B", "C", "D", "E"].map((name, i) => ({
          id: `player-${i}`, name, isAlive: true, status: "alive", notes: "", claims: [],
        })),
        script: { id: "tb" },
      }),
    );
    window.history.replaceState(null, "", "/game");
    withClient(<Game />);
    await screen.findByTestId("header-game");

    pointerDown("button-overflow-menu");
    const item = await screen.findByTestId("button-character-reference-menu");
    expect(item.closest("[role=menu]")!.getAttribute("data-surface")).toBeNull();
    expect(item.className).not.toContain("min-h-11");
    fireEvent.keyDown(item, { key: "Escape" });

    fireEvent.click(screen.getByTestId("button-change-script"));
    const none = await screen.findByTestId("button-script-none");
    expect(none.closest("[role=dialog]")!.getAttribute("data-surface")).toBeNull();
  });
});
