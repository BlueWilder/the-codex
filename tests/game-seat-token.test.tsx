// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { CharacterToken } from "@/components/character/CharacterToken";
import {
  CircleSeatingChart,
  SortablePlayerCard,
  CharacterPicker,
  PlayerDetailDrawer,
} from "@/pages/Game";
import { latestDeathRecord, deathPhaseLabel } from "@/lib/death-phase";
import type { GamePlayer, DeathRecord } from "@/hooks/use-player-game";

afterEach(cleanup);

function makePlayer(overrides: Partial<GamePlayer> & { id: string; name: string }): GamePlayer {
  return {
    seatNumber: 1,
    status: "alive",
    claims: [],
    notes: "",
    isTraveler: false,
    ...overrides,
  } as GamePlayer;
}

const noop = () => {};

function renderChart(
  players: GamePlayer[],
  deathRecords: DeathRecord[] = [],
  opts: {
    onSelectPlayer?: (playerId: string) => void;
    onOpenPrimaryPicker?: (playerId: string) => void;
  } = {},
) {
  return render(
    <CircleSeatingChart
      players={players}
      currentDay={1}
      deathRecords={deathRecords}
      onSelectPlayer={opts.onSelectPlayer ?? noop}
      onOpenPrimaryPicker={opts.onOpenPrimaryPicker ?? noop}
      onReorderPlayers={noop}
      onSetCirclePosition={noop}
      onSetMultipleCirclePositions={noop}
      onResetCirclePositions={noop}
    />,
  );
}

describe("CharacterToken", () => {
  it("resolves the team from a character id", () => {
    render(<CharacterToken characterId="imp" data-testid="tok" />);
    expect(screen.getByTestId("tok").getAttribute("data-team")).toBe("demon");
  });

  it("honors an explicit team override (generic traveller has no id)", () => {
    render(<CharacterToken team="traveler" data-testid="tok" />);
    expect(screen.getByTestId("tok").getAttribute("data-team")).toBe("traveler");
  });

  it("renders official token art when the character has an icon", () => {
    render(<CharacterToken characterId="washerwoman" data-testid="tok" />);
    const tok = screen.getByTestId("tok");
    expect(tok.getAttribute("data-team")).toBe("townsfolk");
    expect(tok.getAttribute("data-glyph")).toBe("image");
    const img = tok.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("/characters/tb/washerwoman_g.webp");
  });

  it("falls back to a placeholder glyph when there is no icon art", () => {
    render(<CharacterToken team="townsfolk" data-testid="tok" />);
    const tok = screen.getByTestId("tok");
    expect(tok.getAttribute("data-team")).toBe("townsfolk");
    expect(tok.getAttribute("data-glyph")).toBe("glyph");
    expect(tok.querySelector("svg")).not.toBeNull();
  });

  it("renders a glyph for each team category", () => {
    for (const team of ["townsfolk", "outsider", "minion", "demon", "traveler", "fabled"]) {
      render(<CharacterToken team={team} data-testid={`tok-${team}`} />);
      const tok = screen.getByTestId(`tok-${team}`);
      expect(tok.getAttribute("data-team")).toBe(team);
      expect(tok.querySelector("svg")).not.toBeNull();
    }
  });
});

describe("Circle seat states", () => {
  it("shows the primary sigil and role for a single claim", () => {
    renderChart([makePlayer({ id: "p1", name: "Alice", claims: ["imp"] })]);
    const seat = screen.getByTestId("token-seat-p1");
    expect(within(seat).getByTestId("text-seat-role-p1").textContent).toContain("Imp");
    expect(seat.querySelector("[data-team='demon']")).not.toBeNull();
    expect(screen.queryByTestId("badge-candidates-p1")).toBeNull();
  });

  it("shows extra claims as small chips under the name (no +N badge)", () => {
    renderChart([makePlayer({ id: "p2", name: "Bob", claims: ["imp", "poisoner", "baron"] })]);
    // The old +N badge is gone; extras render as chips beneath the player name.
    expect(screen.queryByTestId("badge-candidates-p2")).toBeNull();
    expect(screen.getByTestId("chip-seat-extra-poisoner-p2")).not.toBeNull();
    expect(screen.getByTestId("chip-seat-extra-baron-p2")).not.toBeNull();
    // The primary (imp) is not shown as an extra chip.
    expect(screen.queryByTestId("chip-seat-extra-imp-p2")).toBeNull();
  });

  it("collapses more than three extra claims into an overflow chip", () => {
    renderChart([
      makePlayer({
        id: "p6",
        name: "Fay",
        claims: ["imp", "poisoner", "baron", "spy", "washerwoman"],
      }),
    ]);
    // Four extras: three chips shown, the fourth folded into a +1 overflow chip.
    expect(screen.getByTestId("chip-seat-extra-more-p6").textContent).toContain("+1");
  });

  it("opens the primary claim picker when the seat token is tapped", () => {
    const onOpenPrimaryPicker = vi.fn();
    renderChart([makePlayer({ id: "p4", name: "Dana", claims: ["imp"] })], [], { onOpenPrimaryPicker });
    fireEvent.click(screen.getByTestId("button-seat-token-p4"));
    expect(onOpenPrimaryPicker).toHaveBeenCalledWith("p4");
  });

  it("opens the player detail via the + button", () => {
    const onSelectPlayer = vi.fn();
    renderChart([makePlayer({ id: "p5", name: "Evan", claims: ["imp"] })], [], { onSelectPlayer });
    fireEvent.click(screen.getByTestId("button-seat-more-p5"));
    expect(onSelectPlayer).toHaveBeenCalledWith("p5");
  });

  it("shows a no-claim placeholder for an empty seat", () => {
    renderChart([makePlayer({ id: "p3", name: "Cara", claims: [] })]);
    expect(screen.getByTestId("text-seat-noclaim-p3")).not.toBeNull();
    expect(screen.queryByTestId("text-seat-role-p3")).toBeNull();
  });

  it("stamps the death phase as a dagger label for a dead player", () => {
    renderChart(
      [makePlayer({ id: "p4", name: "Dan", status: "dead", claims: ["imp"] })],
      [{ playerId: "p4", day: 2, type: "night", phase: "night" }],
    );
    expect(screen.getByTestId("overlay-shroud-p4")).not.toBeNull();
    expect(screen.getByTestId("text-seat-death-p4").textContent).toContain("N2");
  });

  it("picks the final death deterministically when records share a day", () => {
    renderChart(
      [makePlayer({ id: "p5", name: "Eve", status: "dead", claims: ["imp"] })],
      [
        { playerId: "p5", day: 3, type: "execution", phase: "day" },
        { playerId: "p5", day: 3, type: "night", phase: "night" },
      ],
    );
    // Same day: the 'day' phase is later than 'night', so the stamp must be D3.
    expect(screen.getByTestId("text-seat-death-p5").textContent).toContain("D3");
  });
});

describe("death-label helpers", () => {
  const records: DeathRecord[] = [
    { playerId: "a", day: 1, type: "night", phase: "night" },
    { playerId: "a", day: 2, type: "execution", phase: "day" },
    { playerId: "b", day: 1, type: "night", phase: "night" },
  ];

  it("latestDeathRecord returns null when the player has no record", () => {
    expect(latestDeathRecord(records, "c")).toBeNull();
    expect(latestDeathRecord([], "a")).toBeNull();
  });

  it("latestDeathRecord picks the highest day for a player", () => {
    expect(latestDeathRecord(records, "a")?.day).toBe(2);
  });

  it("latestDeathRecord prefers the day phase over night within the same day", () => {
    const sameDay: DeathRecord[] = [
      { playerId: "a", day: 3, type: "night", phase: "night" },
      { playerId: "a", day: 3, type: "execution", phase: "day" },
    ];
    expect(latestDeathRecord(sameDay, "a")?.phase).toBe("day");
  });

  it("deathPhaseLabel formats night and day stamps", () => {
    expect(deathPhaseLabel({ playerId: "a", day: 1, type: "night", phase: "night" })).toBe("N1");
    expect(deathPhaseLabel({ playerId: "a", day: 2, type: "execution", phase: "day" })).toBe("D2");
    expect(deathPhaseLabel(null)).toBeNull();
  });
});

type RowGame = Parameters<typeof SortablePlayerCard>[0]["game"];

function makeGame(players: GamePlayer[], deathRecords: DeathRecord[] = []): RowGame {
  return { players, deathRecords } as unknown as RowGame;
}

function renderRow(
  player: GamePlayer,
  opts: {
    seatNumber?: number;
    deathRecords?: DeathRecord[];
    onSelect?: () => void;
    onRemoveClaim?: (id: string) => void;
  } = {},
) {
  const game = makeGame([player], opts.deathRecords ?? []);
  return render(
    <DndContext>
      <SortableContext items={[player.id]} strategy={rectSortingStrategy}>
        <SortablePlayerCard
          player={player}
          game={game}
          seatNumber={opts.seatNumber ?? 1}
          onSelect={opts.onSelect ?? noop}
          onToggleAlive={noop}
          onOpenClaimPicker={noop}
          onRemoveClaim={opts.onRemoveClaim ?? noop}
        />
      </SortableContext>
    </DndContext>,
  );
}

describe("List row states", () => {
  it("shows the seat number, a primary token, and a filled primary chip for a single claim", () => {
    renderRow(makePlayer({ id: "p1", name: "Alice", claims: ["imp"] }), { seatNumber: 4 });
    expect(screen.getByTestId("text-seat-number-p1").textContent).toBe("4");
    const token = screen.getByTestId("token-list-p1");
    expect(token.getAttribute("data-team")).toBe("demon");
    const chip = screen.getByTestId("button-claim-badge-imp-p1");
    // The primary chip is filled: it carries the team badge background, not bg-transparent.
    expect(chip.className).not.toContain("bg-transparent");
    expect(screen.queryByTestId("text-no-claim-p1")).toBeNull();
  });

  it("renders the primary filled and alternates outlined", () => {
    renderRow(makePlayer({ id: "p2", name: "Bob", claims: ["imp", "poisoner"] }));
    const primary = screen.getByTestId("button-claim-badge-imp-p2");
    const alternate = screen.getByTestId("button-claim-badge-poisoner-p2");
    expect(primary.className).not.toContain("bg-transparent");
    expect(alternate.className).toContain("bg-transparent");
    // No crown marker renders; the primary is shown by the filled chip alone.
    expect(screen.queryByTestId("text-primary-claim-p2")).toBeNull();
    expect(screen.queryByTestId("button-set-primary-poisoner")).toBeNull();
  });

  it("shows a dashed token and a no-claim hint for an empty seat", () => {
    renderRow(makePlayer({ id: "p3", name: "Cara", claims: [] }));
    expect(screen.getByTestId("token-list-p3")).not.toBeNull();
    expect(screen.getByTestId("text-no-claim-p3")).not.toBeNull();
    expect(screen.queryAllByTestId(/^chip-candidate-p3-/)).toHaveLength(0);
    expect(screen.getByTestId("button-add-claim-p3")).not.toBeNull();
  });

  it("greys a dead seat with a shroud and a dagger phase stamp", () => {
    renderRow(makePlayer({ id: "p4", name: "Dan", status: "dead", claims: ["imp"] }), {
      deathRecords: [{ playerId: "p4", day: 2, type: "night", phase: "night" }],
    });
    expect(screen.getByTestId("overlay-shroud-p4")).not.toBeNull();
    expect(screen.getByTestId("text-seat-death-p4").textContent).toContain("N2");
  });
});

describe("List row tap isolation", () => {
  it("tapping the row background opens the drawer", () => {
    const onSelect = vi.fn();
    renderRow(makePlayer({ id: "p0", name: "Zed", claims: ["imp"] }), { onSelect });
    fireEvent.click(screen.getByTestId("card-player-p0"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("removing a claim does not open the drawer", () => {
    const onSelect = vi.fn();
    const onRemoveClaim = vi.fn();
    renderRow(makePlayer({ id: "p1", name: "Alice", claims: ["imp"] }), {
      onSelect,
      onRemoveClaim,
    });
    fireEvent.click(screen.getByTestId("button-claim-badge-imp-p1"));
    expect(onRemoveClaim).toHaveBeenCalledWith("imp");
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("Set Claim picker (single select)", () => {
  it("marks the current primary claim and removes it when tapped again", () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();
    render(
      <CharacterPicker
        open
        onClose={noop}
        singleSelect
        primaryClaimId="imp"
        onSelect={onSelect}
        onRemove={onRemove}
      />,
    );
    // The current primary is marked with a check and a "tap to remove" hint.
    expect(screen.getByTestId("icon-current-claim-imp")).not.toBeNull();
    expect(screen.getByTestId("text-tap-to-remove-imp")).not.toBeNull();
    // Tapping the current primary removes it (deselect), not re-select.
    fireEvent.click(screen.getByTestId("button-select-character-imp"));
    expect(onRemove).toHaveBeenCalledWith("imp");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("sets a different character as the new primary", () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();
    render(
      <CharacterPicker
        open
        onClose={noop}
        singleSelect
        primaryClaimId="imp"
        onSelect={onSelect}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByTestId("button-select-character-poisoner"));
    expect(onSelect).toHaveBeenCalledWith(["poisoner"]);
    expect(onRemove).not.toHaveBeenCalled();
  });
});

function renderDrawer(
  player: GamePlayer,
  opts: { onRemoveClaim?: (id: string) => void } = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PlayerDetailDrawer
        player={player}
        players={[player]}
        onClose={noop}
        onToggleAlive={noop}
        onAddMultipleClaims={noop}
        onRemoveClaim={opts.onRemoveClaim ?? noop}
        onSetNotes={noop}
        onSetPlayerName={noop}
      />
    </QueryClientProvider>,
  );
}

describe("Player detail drawer claims", () => {
  it("removes a claim via the x on each chip (primary and extra)", () => {
    const onRemoveClaim = vi.fn();
    renderDrawer(makePlayer({ id: "p1", name: "Alice", claims: ["imp", "poisoner"] }), {
      onRemoveClaim,
    });
    fireEvent.click(screen.getByTestId("button-remove-claim-imp-p1"));
    expect(onRemoveClaim).toHaveBeenCalledWith("imp");
    fireEvent.click(screen.getByTestId("button-remove-claim-poisoner-p1"));
    expect(onRemoveClaim).toHaveBeenCalledWith("poisoner");
  });

  it("keeps the info button distinct from the remove control", () => {
    const onRemoveClaim = vi.fn();
    renderDrawer(makePlayer({ id: "p2", name: "Bob", claims: ["imp"] }), { onRemoveClaim });
    // The info button opens the preview and must not trigger removal.
    fireEvent.click(screen.getByTestId("button-claim-info-imp-p2"));
    expect(onRemoveClaim).not.toHaveBeenCalled();
  });

  it("shows an empty state when the seat has no claims", () => {
    renderDrawer(makePlayer({ id: "p3", name: "Cara", claims: [] }));
    expect(screen.getByTestId("text-no-claims-p3")).not.toBeNull();
    expect(screen.queryByTestId("chip-primary-p3")).toBeNull();
  });
});

describe("List row resurrection", () => {
  it("renders no shroud or dagger for an alive player with a stale death record", () => {
    renderRow(makePlayer({ id: "p1", name: "Alice", status: "alive", claims: ["imp"] }), {
      deathRecords: [{ playerId: "p1", day: 1, type: "night", phase: "night" }],
    });
    expect(screen.queryByTestId("overlay-shroud-p1")).toBeNull();
    expect(screen.queryByTestId("text-seat-death-p1")).toBeNull();
  });

  it("shows the latest death phase for a player who re-dies after resurrection", () => {
    renderRow(makePlayer({ id: "p2", name: "Bob", status: "dead", claims: ["imp"] }), {
      deathRecords: [
        { playerId: "p2", day: 1, type: "night", phase: "night" },
        { playerId: "p2", day: 2, type: "execution", phase: "day" },
      ],
    });
    expect(screen.getByTestId("text-seat-death-p2").textContent).toContain("D2");
  });
});
