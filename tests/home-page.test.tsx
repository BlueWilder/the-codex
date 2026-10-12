// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import Game from "@/pages/Game";

const GAME_KEY = "clocktower_player_game";
const CUSTOM_KEY = "clocktower_custom_scripts";

function seedGame(opts: { scriptId?: string | null; seats?: number; dead?: number } = {}) {
  const seats = opts.seats ?? 8;
  const dead = opts.dead ?? 2;
  localStorage.setItem(
    GAME_KEY,
    JSON.stringify({
      id: "saved",
      createdAt: new Date().toISOString(),
      playerCount: seats,
      breakdown: { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
      currentDay: 1,
      phase: "night",
      players: Array.from({ length: seats }, (_, i) => ({
        id: `player-${i}`,
        name: `Player ${i + 1}`,
        isAlive: i >= dead,
        status: i >= dead ? "alive" : "dead",
        notes: "",
        claims: [],
      })),
      script: opts.scriptId === null ? null : { id: opts.scriptId ?? "tb" },
    }),
  );
}

function seedCustomScript() {
  localStorage.setItem(
    CUSTOM_KEY,
    JSON.stringify([
      {
        id: "custom-1",
        name: "Kitchen Table",
        isOfficial: false,
        characterIds: ["washerwoman", "chef", "empath", "drunk", "poisoner", "imp"],
      },
    ]),
  );
}

function withClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function currentUrl() {
  return window.location.pathname + window.location.search;
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  // jsdom has no pointer capture; vaul calls it on pointerdown inside a drawer.
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    Element.prototype.hasPointerCapture = () => false;
  }
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("Home brand block", () => {
  it("shows the Codex title and the quote, unchanged", () => {
    withClient(<Home />);
    const brand = screen.getByTestId("section-brand");
    expect(within(brand).getByText("Codex")).toBeTruthy();
    expect(screen.getByTestId("text-home-quote").textContent).toBe(
      '"Do not dare to hope, for the demon devours hope before all else."',
    );
  });
});

describe("Home Resume", () => {
  it("is absent when there is no saved game", () => {
    withClient(<Home />);
    expect(screen.queryByTestId("section-resume")).toBeNull();
    expect(screen.queryByTestId("card-resume")).toBeNull();
    expect(screen.queryByText("Resume")).toBeNull();
  });

  it("shows the saved game's script and seats, and opens Game Mode", async () => {
    seedGame({ scriptId: "tb", seats: 8, dead: 2 });
    withClient(<Home />);
    const card = await screen.findByTestId("card-resume");
    expect(screen.getByTestId("text-resume-script").textContent).toBe("Trouble Brewing");
    expect(screen.getByTestId("text-resume-summary").textContent).toBe("8 seats · 6 alive");
    fireEvent.click(card);
    expect(currentUrl()).toBe("/game");
  });

  it("names a saved game without a script No Script", async () => {
    seedGame({ scriptId: null, seats: 5, dead: 0 });
    withClient(<Home />);
    expect((await screen.findByTestId("text-resume-script")).textContent).toBe("No Script");
    expect(screen.getByTestId("text-resume-summary").textContent).toBe("5 seats · 5 alive");
  });
});

describe("Home Play list", () => {
  it("lists custom scripts first, then official, then community", () => {
    seedCustomScript();
    withClient(<Home />);
    const ids = Array.from(
      screen.getByTestId("panel-play").querySelectorAll('[data-testid^="button-play-script-"]'),
    ).map(el => el.getAttribute("data-testid")!.replace("button-play-script-", ""));
    expect(ids.slice(0, 4)).toEqual(["custom-1", "tb", "bmr", "snv"]);
  });

  it("shows six cards, then All N scripts expands the list in place", () => {
    seedCustomScript();
    withClient(<Home />);
    const panel = screen.getByTestId("panel-play");
    expect(panel.querySelectorAll('[data-testid^="button-play-script-"]')).toHaveLength(6);
    const all = screen.getByTestId("button-all-scripts");
    expect(all.textContent).toBe("All 7 scripts");
    fireEvent.click(all);
    expect(panel.querySelectorAll('[data-testid^="button-play-script-"]')).toHaveLength(7);
    expect(screen.queryByTestId("button-all-scripts")).toBeNull();
  });

  it("has no All N link when every script already fits", () => {
    withClient(<Home />);
    expect(screen.queryByTestId("button-all-scripts")).toBeNull();
  });

  it("shows character counts by team, and official scripts as official", () => {
    seedCustomScript();
    withClient(<Home />);
    expect(screen.getByTestId("text-play-meta-custom-1").textContent).toBe("6 characters · 3 / 1 / 1 / 1");
    expect(screen.getByTestId("text-play-meta-tb").textContent).toMatch(/^\d+ characters · official$/);
  });

  it("starts setup with the tapped script when no game is saved", () => {
    withClient(<Home />);
    fireEvent.click(screen.getByTestId("button-play-script-bmr"));
    expect(screen.queryByTestId("dialog-replace-game")).toBeNull();
    expect(currentUrl()).toBe("/game?script=bmr");
  });
});

describe("Home replace-game confirm", () => {
  it("asks before replacing a saved game, and Cancel stays put", async () => {
    seedGame();
    withClient(<Home />);
    await screen.findByTestId("card-resume");
    fireEvent.click(screen.getByTestId("button-play-script-bmr"));
    const dialog = await screen.findByTestId("dialog-replace-game");
    expect(within(dialog).getByText("Replace your current game?")).toBeTruthy();
    expect(currentUrl()).toBe("/");
    fireEvent.click(screen.getByTestId("button-cancel-replace-game"));
    await waitFor(() => expect(screen.queryByTestId("dialog-replace-game")).toBeNull());
    expect(currentUrl()).toBe("/");
  });

  it("confirming opens setup with the script and keeps the saved game until Start", async () => {
    seedGame();
    withClient(<Home />);
    await screen.findByTestId("card-resume");
    fireEvent.click(screen.getByTestId("button-play-script-bmr"));
    fireEvent.click(await screen.findByTestId("button-confirm-replace-game"));
    expect(currentUrl()).toBe("/game?script=bmr");
    expect(JSON.parse(localStorage.getItem(GAME_KEY)!).id).toBe("saved");
  });
});

describe("Game entry from a Play card", () => {
  it("opens setup with that script selected, on player count", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState(null, "", "/game?script=bmr");
    withClient(<Game />);
    const scriptCard = await screen.findByTestId("card-script");
    expect(scriptCard.textContent).toContain("Bad Moon Rising");
    expect(screen.getByTestId("card-players")).toBeTruthy();
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("shows setup over a saved game, and Start replaces it with the chosen script", async () => {
    seedGame({ scriptId: "tb" });
    window.history.replaceState(null, "", "/game?script=bmr");
    withClient(<Game />);
    expect((await screen.findByTestId("card-script")).textContent).toContain("Bad Moon Rising");
    expect(screen.queryByTestId("nav-tracker")).toBeNull();
    fireEvent.click(screen.getByTestId("button-start-game"));
    await screen.findByTestId("nav-tracker");
    const saved = JSON.parse(localStorage.getItem(GAME_KEY)!);
    expect(saved.id).not.toBe("saved");
    expect(saved.script).toEqual({ id: "bmr" });
    expect(currentUrl()).toBe("/game");
  });

  it("opens the saved game, not setup, without a script in the URL", async () => {
    seedGame({ scriptId: "tb" });
    window.history.replaceState(null, "", "/game");
    withClient(<Game />);
    expect(await screen.findByTestId("nav-tracker")).toBeTruthy();
    expect(screen.queryByTestId("card-script")).toBeNull();
  });
});

describe("Home script tools", () => {
  it("Import opens the script builder on its JSON import panel", async () => {
    withClient(<Home />);
    fireEvent.click(screen.getByTestId("button-home-import"));
    expect(await screen.findByTestId("input-import-json")).toBeTruthy();
    expect(screen.getByText("Import Script")).toBeTruthy();
  });

  it("My scripts lists custom scripts and opens the builder to create one", async () => {
    seedCustomScript();
    withClient(<Home />);
    fireEvent.click(screen.getByTestId("button-home-my-scripts"));
    const drawer = await screen.findByTestId("drawer-my-scripts");
    expect(within(drawer).getByTestId("button-script-custom-1").textContent).toContain("Kitchen Table");
    fireEvent.click(within(drawer).getByTestId("button-create-custom-script"));
    expect(await screen.findByTestId("input-script-name")).toBeTruthy();
  });

  it("My scripts edits a custom script in the builder", async () => {
    seedCustomScript();
    withClient(<Home />);
    fireEvent.click(screen.getByTestId("button-home-my-scripts"));
    fireEvent.click(await screen.findByTestId("button-edit-script-custom-1"));
    const name = (await screen.findByTestId("input-script-name")) as HTMLInputElement;
    expect(name.value).toBe("Kitchen Table");
    expect(screen.getByText("Edit Custom Script")).toBeTruthy();
  });

  it("Scan opens the photo picker", () => {
    withClient(<Home />);
    const input = screen.getByTestId("input-home-scan") as HTMLInputElement;
    const click = vi.spyOn(input, "click");
    fireEvent.click(screen.getByTestId("button-home-scan"));
    expect(click).toHaveBeenCalledTimes(1);
    expect(input.getAttribute("accept")).toBe("image/*");
  });
});
