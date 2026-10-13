// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Reference from "@/pages/Reference";
import Home from "@/pages/Home";
import { SeatSheet } from "@/pages/Game";
import type { GamePlayer } from "@/hooks/use-player-game";

function withClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});
afterEach(cleanup);

describe("UI rule 5: Reference filters", () => {
  it("puts By Team / By Night at the end of the team filter row, with no toolbar above the cards", () => {
    withClient(<Reference />);
    const teamRow = screen.getByTestId("row-team-filters");
    const row = teamRow.parentElement!;
    expect(within(row).getByTestId("button-sort-team")).toBeTruthy();
    expect(within(row).getByTestId("button-sort-night")).toBeTruthy();
    // The sort pair is not inside the scrolling chips; it is the row's last child.
    expect(within(teamRow).queryByTestId("button-sort-team")).toBeNull();
    expect(row.lastElementChild?.contains(screen.getByTestId("button-sort-night"))).toBe(true);
    // Exactly one sort pair on the page (the old toolbar is gone).
    expect(screen.getAllByTestId("button-sort-team")).toHaveLength(1);
  });

  it("styles script and team filters as secondary pills with the active one marked", () => {
    withClient(<Reference />);
    const all = screen.getByTestId("button-filter-all");
    const demon = screen.getByTestId("button-filter-demon");
    expect(all.className).toContain("btn-secondary");
    expect(all.getAttribute("data-active")).toBe("true");
    expect(demon.getAttribute("data-active")).toBeNull();
    fireEvent.click(demon);
    expect(demon.getAttribute("data-active")).toBe("true");
    expect(all.getAttribute("data-active")).toBeNull();
    expect(screen.getByTestId("button-script-all").getAttribute("data-active")).toBe("true");
    expect(screen.getByTestId("row-script-filters").className).toContain("scrollbar-hide");
    expect(screen.getByTestId("row-team-filters").className).toContain("scrollbar-hide");
  });

  it("shows the First / Other Nights pair only in By Night mode", () => {
    withClient(<Reference />);
    expect(screen.queryByTestId("button-night-first")).toBeNull();
    fireEvent.click(screen.getByTestId("button-sort-night"));
    expect(screen.getByTestId("button-night-first").getAttribute("data-active")).toBe("true");
    fireEvent.click(screen.getByTestId("button-night-other"));
    expect(screen.getByTestId("button-night-other").getAttribute("data-active")).toBe("true");
  });

  it("titles the page Character Reference as the page title", () => {
    withClient(<Reference />);
    const title = screen.getByRole("heading", { level: 1, name: "Character Reference" });
    expect(title.className).toContain("page-title");
  });
});

describe("UI rule 4: chevrons on tappable cards", () => {
  it("Home Play cards each end in a chevron", () => {
    withClient(<Home />);
    const card = screen.getByTestId("button-play-script-tb");
    expect(card.lastElementChild?.classList.contains("lucide-chevron-right")).toBe(true);
  });

  it("seat sheet character cards show a chevron, claimed ones do not", () => {
    const player = {
      id: "p1",
      name: "Alice",
      isAlive: true,
      status: "alive",
      notes: "",
      claims: ["chef"],
    } as GamePlayer;
    withClient(
      <SeatSheet
        player={player}
        players={[player]}
        scriptCharacterIds={["chef", "empath", "imp"]}
        onClose={() => {}}
        onToggleAlive={() => {}}
        onAddClaim={() => {}}
        onRemoveClaim={() => {}}
        onSetNotes={() => {}}
        onSetPlayerName={() => {}}
      />,
    );
    expect(screen.getByTestId("chevron-character-empath")).toBeTruthy();
    expect(screen.queryByTestId("chevron-character-chef")).toBeNull();
  });
});

describe("UI rules 2 and 3 on Home", () => {
  it("uses section labels and three secondary pills for the script tools", () => {
    withClient(<Home />);
    const play = screen.getByTestId("section-play");
    expect(within(play).getByText("Play").className).toContain("section-label");
    for (const id of ["button-home-scan", "button-home-import", "button-home-my-scripts"]) {
      expect(screen.getByTestId(id).className).toContain("btn-secondary");
    }
  });
});
