// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { CharacterToken } from "@/components/character/CharacterToken";
import { CircleSeatingChart } from "@/pages/Game";
import type { GamePlayer, DeathRecord } from "@/hooks/use-player-game";

afterEach(cleanup);

function makePlayer(overrides: Partial<GamePlayer> & { id: string; name: string }): GamePlayer {
  return {
    seatNumber: 1,
    status: "alive",
    hasGhostVote: true,
    claims: [],
    notes: "",
    isTraveler: false,
    ...overrides,
  } as GamePlayer;
}

const noop = () => {};

function renderChart(players: GamePlayer[], deathRecords: DeathRecord[] = []) {
  return render(
    <CircleSeatingChart
      players={players}
      nominations={[]}
      currentDay={1}
      deathRecords={deathRecords}
      onSelectPlayer={noop}
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

  it("falls back to a placeholder glyph when there is no icon art", () => {
    render(<CharacterToken characterId="washerwoman" data-testid="tok" />);
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

  it("shows a +N badge for multiple claims", () => {
    renderChart([makePlayer({ id: "p2", name: "Bob", claims: ["imp", "poisoner", "baron"] })]);
    expect(screen.getByTestId("badge-candidates-p2").textContent).toContain("+2");
  });

  it("shows a no-guess placeholder for an empty seat", () => {
    renderChart([makePlayer({ id: "p3", name: "Cara", claims: [] })]);
    expect(screen.getByTestId("text-seat-noguess-p3")).not.toBeNull();
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
