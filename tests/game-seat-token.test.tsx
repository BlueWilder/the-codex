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
  SeatSheet,
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
  } = {},
) {
  return render(
    <CircleSeatingChart
      players={players}
      currentDay={1}
      deathRecords={deathRecords}
      onSelectPlayer={opts.onSelectPlayer ?? noop}
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
  it("shows the claim's team and name for a single claim", () => {
    renderChart([makePlayer({ id: "p1", name: "Alice", claims: ["imp"] })]);
    const seat = screen.getByTestId("token-seat-p1");
    expect(within(seat).getByTestId("text-seat-role-p1").textContent).toContain("Imp");
    expect(seat.querySelector("[data-team='demon']")).not.toBeNull();
    expect(screen.queryByTestId("badge-candidates-p1")).toBeNull();
  });

  it("shows only the most recently added claim under the name", () => {
    renderChart([
      makePlayer({
        id: "p2",
        name: "Bob",
        claims: ["imp", "poisoner", "baron"],
        claimRecords: [
          { characterId: "imp", addedAt: "2026-01-01T09:00:00.000Z", day: 1 },
          { characterId: "poisoner", addedAt: "2026-01-01T11:00:00.000Z", day: 1 },
          { characterId: "baron", addedAt: "2026-01-01T10:00:00.000Z", day: 1 },
        ],
      }),
    ]);
    const seat = screen.getByTestId("token-seat-p2");
    expect(within(seat).getByTestId("text-seat-role-p2").textContent).toBe("Poisoner");
    expect(seat.querySelector("[data-team='minion']")).not.toBeNull();
    // Older claims are not listed on the seat; the sheet holds them.
    expect(screen.queryByTestId("badge-candidates-p2")).toBeNull();
    expect(screen.queryAllByTestId(/^chip-seat-extra-/)).toHaveLength(0);
    expect(screen.queryByText(/^was /)).toBeNull();
  });

  it("falls back to the last claim in a legacy save without claim records", () => {
    renderChart([makePlayer({ id: "p6", name: "Fay", claims: ["imp", "poisoner", "baron"] })]);
    expect(screen.getByTestId("text-seat-role-p6").textContent).toBe("Baron");
  });

  it("opens the seat sheet when the seat token is tapped", () => {
    const onSelectPlayer = vi.fn();
    renderChart([makePlayer({ id: "p4", name: "Dana", claims: ["imp"] })], [], { onSelectPlayer });
    fireEvent.click(screen.getByTestId("button-seat-token-p4"));
    expect(onSelectPlayer).toHaveBeenCalledWith("p4");
  });

  it("has no separate seat options button; the seat itself opens the sheet", () => {
    renderChart([makePlayer({ id: "p5", name: "Evan", claims: ["imp"] })]);
    expect(screen.queryByTestId("button-seat-more-p5")).toBeNull();
  });

  it("shows a no-claim placeholder for an empty seat", () => {
    renderChart([makePlayer({ id: "p3", name: "Cara", claims: [] })]);
    expect(screen.getByTestId("text-seat-noclaim-p3")).not.toBeNull();
    expect(screen.queryByTestId("text-seat-role-p3")).toBeNull();
  });

  it("shows a dead seat with no death phase stamp", () => {
    renderChart(
      [makePlayer({ id: "p4", name: "Dan", status: "dead", claims: ["imp"] })],
      [{ playerId: "p4", day: 2, type: "night", phase: "night" }],
    );
    expect(screen.getByTestId("overlay-shroud-p4")).not.toBeNull();
    expect(screen.queryByTestId("text-seat-death-p4")).toBeNull();
  });

  it("shows no death phase stamp when death records share a day", () => {
    renderChart(
      [makePlayer({ id: "p5", name: "Eve", status: "dead", claims: ["imp"] })],
      [
        { playerId: "p5", day: 3, type: "execution", phase: "day" },
        { playerId: "p5", day: 3, type: "night", phase: "night" },
      ],
    );
    // Day/night is no longer tracked or shown, so there is no stamp.
    expect(screen.queryByTestId("text-seat-death-p5")).toBeNull();
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
    onToggleAlive?: () => void;
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
          onToggleAlive={opts.onToggleAlive ?? noop}
        />
      </SortableContext>
    </DndContext>,
  );
}

describe("List row states", () => {
  it("shows the name with no seat medallion, and the claim in team color for a single claim", () => {
    renderRow(makePlayer({ id: "p1", name: "Alice", claims: ["imp"] }), { seatNumber: 4 });
    expect(screen.queryByTestId("text-seat-number-p1")).toBeNull();
    expect(screen.queryByTestId("token-list-p1")).toBeNull();
    const name = screen.getByTestId("button-player-name-p1");
    expect(name.textContent).toBe("Alice");
    expect(name.className).toContain("font-display");
    expect(name.className).toContain("text-[18px]");
    const claim = screen.getByTestId("text-claim-p1");
    expect(claim.getAttribute("data-team")).toBe("demon");
    expect(claim.textContent).toBe("Imp");
    expect(claim.className).toContain("text-[var(--parchment-demon)]");
    expect(screen.queryByTestId("text-no-claim-p1")).toBeNull();
  });

  it("shows only the most recently added claim, with no believed or was labels", () => {
    renderRow(
      makePlayer({
        id: "p2",
        name: "Bob",
        claims: ["imp", "poisoner"],
        claimRecords: [
          { characterId: "imp", addedAt: "2026-01-01T09:00:00.000Z", day: 1 },
          { characterId: "poisoner", addedAt: "2026-01-01T10:00:00.000Z", day: 1 },
        ],
      }),
    );
    expect(screen.getByTestId("text-claim-p2").textContent).toBe("Poisoner");
    expect(screen.getByTestId("text-claim-p2").getAttribute("data-team")).toBe("minion");
    expect(screen.queryByText("Imp")).toBeNull();
    expect(screen.queryByText(/^was /)).toBeNull();
    expect(screen.queryByTestId("text-primary-claim-p2")).toBeNull();
    expect(screen.queryByTestId("button-set-primary-poisoner")).toBeNull();
  });

  it("names an unnamed seat Player N", () => {
    renderRow(makePlayer({ id: "p7", name: "  ", claims: [] }), { seatNumber: 3 });
    expect(screen.getByTestId("button-player-name-p7").textContent).toBe("Player 3");
  });

  it("shows a no-claim hint for an empty seat", () => {
    renderRow(makePlayer({ id: "p3", name: "Cara", claims: [] }));
    expect(screen.queryByTestId("token-list-p3")).toBeNull();
    expect(screen.getByTestId("text-no-claim-p3")).not.toBeNull();
    expect(screen.queryAllByTestId(/^chip-candidate-p3-/)).toHaveLength(0);
    // Claims are added in the seat sheet, not from the row.
    expect(screen.queryByTestId("button-add-claim-p3")).toBeNull();
  });

  it("uses the shared alive/dead toggle: a smiley while alive, a skull when dead", () => {
    const { unmount } = renderRow(makePlayer({ id: "p5", name: "Eve", claims: [] }));
    const alive = screen.getByTestId("button-toggle-dead-p5");
    expect(alive.getAttribute("data-state")).toBe("alive");
    expect(alive.querySelector(".lucide-smile")).not.toBeNull();
    unmount();
    renderRow(makePlayer({ id: "p6", name: "Fin", status: "dead", claims: [] }));
    const dead = screen.getByTestId("button-toggle-dead-p6");
    expect(dead.getAttribute("data-state")).toBe("dead");
    expect(dead.querySelector(".lucide-skull")).not.toBeNull();
  });

  it("greys a dead seat with the skull in its toggle, no skull medallion and no phase stamp", () => {
    renderRow(makePlayer({ id: "p4", name: "Dan", status: "dead", claims: ["imp"] }), {
      deathRecords: [{ playerId: "p4", day: 2, type: "night", phase: "night" }],
    });
    expect(screen.queryByTestId("overlay-shroud-p4")).toBeNull();
    expect(screen.getByTestId("card-player-p4").className).toContain("opacity-[0.55]");
    expect(screen.getByTestId("button-toggle-dead-p4").querySelector(".lucide-skull")).not.toBeNull();
    expect(screen.queryByTestId("text-seat-death-p4")).toBeNull();
  });
});

describe("List row tap isolation", () => {
  it("tapping the row background opens the seat sheet", () => {
    const onSelect = vi.fn();
    renderRow(makePlayer({ id: "p0", name: "Zed", claims: ["imp"] }), { onSelect });
    fireEvent.click(screen.getByTestId("card-player-p0"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("toggling alive does not open the seat sheet", () => {
    const onSelect = vi.fn();
    const onToggleAlive = vi.fn();
    renderRow(makePlayer({ id: "p1", name: "Alice", claims: ["imp"] }), {
      onSelect,
      onToggleAlive,
    });
    fireEvent.click(screen.getByTestId("button-toggle-dead-p1"));
    expect(onToggleAlive).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("Seat sheet replaces the Set Claim picker", () => {
  it("dims a character already claimed, with no check or tap-to-remove, and ignores taps", () => {
    const onAddClaim = vi.fn();
    const onRemoveClaim = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice", claims: ["imp"] }), { onAddClaim, onRemoveClaim });
    expect(screen.queryByTestId("icon-current-claim-imp")).toBeNull();
    expect(screen.queryByTestId("text-tap-to-remove-imp")).toBeNull();
    const imp = screen.getByTestId("button-select-character-imp");
    expect(imp.className).toContain("opacity-60");
    fireEvent.click(imp);
    expect(onRemoveClaim).not.toHaveBeenCalled();
    expect(onAddClaim).not.toHaveBeenCalled();
  });

  it("adds a different character alongside instead of setting it as primary", () => {
    const onAddClaim = vi.fn();
    const onRemoveClaim = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice", claims: ["imp"] }), { onAddClaim, onRemoveClaim });
    fireEvent.click(screen.getByTestId("button-select-character-poisoner"));
    expect(onAddClaim).toHaveBeenCalledWith("poisoner");
    expect(onRemoveClaim).not.toHaveBeenCalled();
  });
});

function renderSheet(
  player: GamePlayer,
  opts: { onRemoveClaim?: (id: string) => void; onAddClaim?: (id: string) => void } = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SeatSheet
        player={player}
        players={[player]}
        onClose={noop}
        onToggleAlive={noop}
        onAddClaim={opts.onAddClaim ?? noop}
        onRemoveClaim={opts.onRemoveClaim ?? noop}
        onSetNotes={noop}
        onSetPlayerName={noop}
      />
    </QueryClientProvider>,
  );
}

describe("Seat sheet claims", () => {
  it("removes a claim via the x on each chip", () => {
    const onRemoveClaim = vi.fn();
    renderSheet(makePlayer({ id: "p1", name: "Alice", claims: ["imp", "poisoner"] }), {
      onRemoveClaim,
    });
    fireEvent.click(screen.getByTestId("button-remove-claim-imp-p1"));
    expect(onRemoveClaim).toHaveBeenCalledWith("imp");
    fireEvent.click(screen.getByTestId("button-remove-claim-poisoner-p1"));
    expect(onRemoveClaim).toHaveBeenCalledWith("poisoner");
  });

  it("tapping a claim chip neither removes nor promotes it", () => {
    const onRemoveClaim = vi.fn();
    renderSheet(makePlayer({ id: "p2", name: "Bob", claims: ["imp", "poisoner"] }), { onRemoveClaim });
    fireEvent.click(screen.getByTestId("chip-claim-poisoner-p2"));
    expect(onRemoveClaim).not.toHaveBeenCalled();
    expect(screen.queryByTestId("tag-believed-p2")).toBeNull();
  });

  it("shows an empty state when the seat has no claims", () => {
    renderSheet(makePlayer({ id: "p3", name: "Cara", claims: [] }));
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

  it("shows a re-killed player as dead with no death phase stamp", () => {
    renderRow(makePlayer({ id: "p2", name: "Bob", status: "dead", claims: ["imp"] }), {
      deathRecords: [
        { playerId: "p2", day: 1, type: "night", phase: "night" },
        { playerId: "p2", day: 2, type: "execution", phase: "day" },
      ],
    });
    expect(screen.queryByTestId("overlay-shroud-p2")).toBeNull();
    expect(screen.getByTestId("card-player-p2").className).toContain("opacity-[0.55]");
    expect(screen.getByTestId("button-toggle-dead-p2").getAttribute("data-state")).toBe("dead");
    expect(screen.queryByTestId("text-seat-death-p2")).toBeNull();
  });
});
