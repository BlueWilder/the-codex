// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SetupWizard } from "@/pages/Game";
import { OFFICIAL_SCRIPTS } from "@/lib/game-data";
import { resolveScriptCharacters } from "@/lib/script-resolve";

function renderWizard(onStart: (count: number, names: string[], script?: any) => void = () => {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SetupWizard onStart={onStart} />
    </QueryClientProvider>,
  );
}

function sheetCharIds(): string[] {
  return screen
    .getAllByTestId(/^script-sheet-char-/)
    .map(el => el.getAttribute("data-testid")!.replace("script-sheet-char-", ""));
}

const TB = OFFICIAL_SCRIPTS.find(s => s.id === "tb")!;
const TB_SCRIPT = {
  id: TB.id,
  name: TB.name,
  isOfficial: true,
  characterIds: TB.characters,
};
const EXPECTED = resolveScriptCharacters(TB_SCRIPT as any, {
  includeTravellers: false,
  includeFabled: false,
}).map(c => c.id);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => cleanup());

describe("SetupWizard script-sheet setup", () => {
  it("renders the two cards, breakdown and start button without a rename hint", () => {
    renderWizard();

    expect(screen.getByTestId("card-script")).toBeTruthy();
    expect(screen.getByTestId("card-players")).toBeTruthy();
    expect(screen.getByTestId("button-script-selector")).toBeTruthy();
    expect(screen.getByTestId("text-player-count")).toBeTruthy();
    expect(screen.getByTestId("text-breakdown")).toBeTruthy();
    expect(screen.getByTestId("button-start-game")).toBeTruthy();
    expect(screen.queryByTestId("text-rename-hint")).toBeNull();

    // No player name inputs and no removed preview/player-count block markers.
    expect(screen.queryByTestId("input-player-name-0")).toBeNull();
    expect(screen.queryByTestId("button-preview-toggle")).toBeNull();
    expect(screen.queryByTestId("step-script-preview")).toBeNull();
  });

  it("shows the nudge and no sheet until a real script is selected", () => {
    renderWizard();

    // Default selection is All Characters: nudge shown, no sheet.
    expect(screen.getByTestId("text-script-nudge")).toBeTruthy();
    expect(screen.queryByTestId("script-sheet")).toBeNull();
  });

  it("opens the script picker drawer when the script card is tapped", () => {
    renderWizard();

    expect(screen.queryByTestId("button-script-tb")).toBeNull();

    fireEvent.click(screen.getByTestId("button-script-selector"));

    expect(screen.getByTestId("button-no-script")).toBeTruthy();
    expect(screen.getByTestId("button-script-tb")).toBeTruthy();
    expect(screen.getByTestId("button-create-custom-script")).toBeTruthy();
    expect(screen.getByTestId("button-scan-paper-script")).toBeTruthy();
  });

  it("paints the script sheet when a script is selected", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));

    // Nudge gone, sheet present with the sort toggle.
    expect(screen.queryByTestId("text-script-nudge")).toBeNull();
    expect(screen.getByTestId("script-sheet")).toBeTruthy();
    expect(screen.getByTestId("button-sheet-sort-team")).toBeTruthy();
    expect(screen.getByTestId("button-sheet-sort-night")).toBeTruthy();

    // The sheet shows the resolver's set (no travellers, no fabled).
    expect(EXPECTED.length).toBeGreaterThan(0);
    expect(sheetCharIds().sort()).toEqual([...EXPECTED].sort());
    expect(sheetCharIds()).toContain("washerwoman");
    expect(sheetCharIds()).toContain("imp");
  });

  it("styles a trailing setup bracket and leaves plain abilities alone", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));

    // Baron's ability ends with "[+2 Outsiders]" -> styled bracket element.
    const baronSetup = screen.getByTestId("script-sheet-setup-baron");
    expect(baronSetup).toBeTruthy();
    expect(baronSetup.textContent).toContain("+2 Outsiders");

    // The bracket text is lifted out of the ability body (not duplicated).
    const baronRow = screen.getByTestId("script-sheet-char-baron");
    expect(baronRow.textContent).toContain("There are extra Outsiders in play.");

    // A character with no trailing bracket renders no setup element.
    expect(screen.queryByTestId("script-sheet-setup-imp")).toBeNull();
  });

  it("renders a bottom Jinxes block for in-sheet pairs only", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));

    // Trouble Brewing has both Spy and Recluse, which are jinxed.
    expect(screen.getByTestId("script-sheet-jinxes")).toBeTruthy();
    expect(screen.getByTestId("script-sheet-jinx-recluse-spy")).toBeTruthy();

    // A jinx whose partner is not on this sheet does not appear (Spy/Damsel:
    // Damsel is not in Trouble Brewing).
    expect(screen.queryByTestId("script-sheet-jinx-damsel-spy")).toBeNull();
  });

  it("hides the Jinxes block when no in-sheet pair exists", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-bmr"));

    // Bad Moon Rising has no jinxed pair where both are on the sheet.
    expect(screen.queryByTestId("script-sheet-jinxes")).toBeNull();
  });

  it("renders team sections in order with counts by default", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));

    // Trouble Brewing has the four core teams.
    expect(screen.getByTestId("script-sheet-section-townsfolk")).toBeTruthy();
    expect(screen.getByTestId("script-sheet-section-outsider")).toBeTruthy();
    expect(screen.getByTestId("script-sheet-section-minion")).toBeTruthy();
    expect(screen.getByTestId("script-sheet-section-demon")).toBeTruthy();

    // Section header shows the team name and count, e.g. "Demon (1)".
    expect(screen.getByTestId("script-sheet-section-demon").textContent).toContain("Demon (1)");
  });

  it("swaps to night order and shows night numbers in the tokens", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));

    // By Team default: no flat section, the demon section exists.
    expect(screen.getByTestId("script-sheet-section-demon")).toBeTruthy();

    fireEvent.click(screen.getByTestId("button-sheet-sort-night"));

    // Team sections collapse into a single night-ordered list.
    expect(screen.queryByTestId("script-sheet-section-demon")).toBeNull();

    // The Imp wakes at night, so its token shows a number.
    const impRow = screen.getByTestId("script-sheet-char-imp");
    expect(/\d/.test(impRow.textContent || "")).toBe(true);
  });

  it("starts the game with default seat names and the chosen script", () => {
    const onStart = vi.fn();
    renderWizard(onStart);

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));
    fireEvent.click(screen.getByTestId("button-start-game"));

    expect(onStart).toHaveBeenCalledTimes(1);
    const [count, names, scriptRef] = onStart.mock.calls[0];
    expect(count).toBe(8);
    expect(names).toEqual([
      "Player 1", "Player 2", "Player 3", "Player 4",
      "Player 5", "Player 6", "Player 7", "Player 8",
    ]);
    expect(scriptRef).toEqual({ id: "tb" });
  });

  it("derives traveler seat names above 15 players", () => {
    const onStart = vi.fn();
    renderWizard(onStart);

    // Default 8 -> bump to 16 to cross the traveler threshold.
    for (let i = 0; i < 8; i++) {
      fireEvent.click(screen.getByTestId("button-increase-players"));
    }
    expect(screen.getByTestId("text-player-count").textContent).toBe("16");

    fireEvent.click(screen.getByTestId("button-start-game"));

    const [count, names, scriptRef] = onStart.mock.calls[0];
    expect(count).toBe(16);
    expect(names).toHaveLength(16);
    expect(names[14]).toBe("Player 15");
    expect(names[15]).toBe("Traveler 1");
    expect(scriptRef).toBeNull();
  });
});
