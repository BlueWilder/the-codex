// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SetupWizard } from "@/pages/Game";
import { OFFICIAL_SCRIPTS } from "@/lib/game-data";
import { resolveScriptCharacters } from "@/lib/script-resolve";

function renderWizard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SetupWizard onStart={() => {}} />
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

describe("SetupWizard script-first preview", () => {
  it("starts on the Select Script step (script-first flow)", () => {
    renderWizard();

    expect(screen.getByTestId("button-script-tb")).toBeTruthy();
    expect(screen.getByTestId("button-next-step")).toBeTruthy();
    // Count and names steps are not the entry point anymore.
    expect(screen.queryByTestId("text-player-count")).toBeNull();
  });

  it("previews the selected script using the shared ScriptView", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-tb"));
    fireEvent.click(screen.getByTestId("button-next-step"));

    const preview = screen.getByTestId("step-script-preview");
    expect(preview).toBeTruthy();

    // Reuses ScriptView: its sort toggle is present.
    expect(screen.getByTestId("button-sort-team")).toBeTruthy();
    expect(screen.getByTestId("button-sort-night")).toBeTruthy();

    // The previewed set matches the resolver (no travellers, no fabled).
    expect(EXPECTED.length).toBeGreaterThan(0);
    expect(cardIds().sort()).toEqual([...EXPECTED].sort());
    // Spot-check a couple of known Trouble Brewing characters.
    expect(cardIds()).toContain("washerwoman");
    expect(cardIds()).toContain("imp");
  });

  it("toggling By Night reveals the First/Other sub-toggle inside the preview", () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-script-tb"));
    fireEvent.click(screen.getByTestId("button-next-step"));

    expect(screen.queryByTestId("button-night-first")).toBeNull();
    fireEvent.click(screen.getByTestId("button-sort-night"));
    expect(screen.getByTestId("button-night-first")).toBeTruthy();
    expect(screen.getByTestId("button-night-other")).toBeTruthy();
  });

  it("skips the roster preview for All Characters", () => {
    renderWizard();

    // All Characters is selected by default; advance to the preview step.
    fireEvent.click(screen.getByTestId("button-next-step"));

    expect(screen.getByTestId("text-preview-all-characters")).toBeTruthy();
    expect(screen.queryByTestId(/^card-character-/)).toBeNull();
  });
});
