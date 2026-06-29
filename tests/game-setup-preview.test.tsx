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

function cardIds(): string[] {
  return screen
    .getAllByTestId(/^card-character-/)
    .map(el => el.getAttribute("data-testid")!.replace("card-character-", ""));
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

describe("SetupWizard single-screen setup", () => {
  it("renders a single screen with no numbered stepper or names step", () => {
    renderWizard();

    // Single screen shows the script selector, player count and start button together.
    expect(screen.getByTestId("button-script-selector")).toBeTruthy();
    expect(screen.getByTestId("text-player-count")).toBeTruthy();
    expect(screen.getByTestId("button-start-game")).toBeTruthy();
    expect(screen.getByTestId("text-rename-hint")).toBeTruthy();

    // No player name inputs exist anymore.
    expect(screen.queryByTestId("input-player-name-0")).toBeNull();
  });

  it("opens the script picker drawer when the selector bar is tapped", () => {
    renderWizard();

    // Drawer list items are not present until the selector is tapped.
    expect(screen.queryByTestId("button-script-tb")).toBeNull();

    fireEvent.click(screen.getByTestId("button-script-selector"));

    expect(screen.getByTestId("button-no-script")).toBeTruthy();
    expect(screen.getByTestId("button-script-tb")).toBeTruthy();
    expect(screen.getByTestId("button-create-custom-script")).toBeTruthy();
    expect(screen.getByTestId("button-scan-paper-script")).toBeTruthy();
  });

  it("has no preview expander until a real script is selected", () => {
    renderWizard();

    // Default selection is All Characters: no preview toggle.
    expect(screen.queryByTestId("button-preview-toggle")).toBeNull();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));

    // Selecting a script reveals the preview toggle, but it stays closed by default.
    expect(screen.getByTestId("button-preview-toggle")).toBeTruthy();
    expect(screen.queryByTestId("step-script-preview")).toBeNull();
    expect(screen.queryByTestId(/^card-character-/)).toBeNull();
  });

  it("previews the selected script using the shared ScriptView when expanded", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));
    fireEvent.click(screen.getByTestId("button-preview-toggle"));

    expect(screen.getByTestId("step-script-preview")).toBeTruthy();

    // Reuses ScriptView: its sort toggle is present.
    expect(screen.getByTestId("button-sort-team")).toBeTruthy();
    expect(screen.getByTestId("button-sort-night")).toBeTruthy();

    // The previewed set matches the resolver (no travellers, no fabled).
    expect(EXPECTED.length).toBeGreaterThan(0);
    expect(cardIds().sort()).toEqual([...EXPECTED].sort());
    expect(cardIds()).toContain("washerwoman");
    expect(cardIds()).toContain("imp");
  });

  it("toggling By Night reveals the First/Other sub-toggle inside the preview", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-selector"));
    fireEvent.click(screen.getByTestId("button-script-tb"));
    fireEvent.click(screen.getByTestId("button-preview-toggle"));

    expect(screen.queryByTestId("button-night-first")).toBeNull();
    fireEvent.click(screen.getByTestId("button-sort-night"));
    expect(screen.getByTestId("button-night-first")).toBeTruthy();
    expect(screen.getByTestId("button-night-other")).toBeTruthy();
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
