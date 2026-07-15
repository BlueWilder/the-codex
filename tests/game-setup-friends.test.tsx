// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SetupWizard } from "@/pages/Game";

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

function seedFriends(names: string[]) {
  localStorage.setItem(
    "clocktower_friends",
    JSON.stringify(names.map((name, i) => ({ id: `local-${i + 1}`, name }))),
  );
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => cleanup());

describe("SetupWizard add from friends", async () => {
  it("shows an empty state hinting at Manage Friends when no friends exist", async () => {
    renderWizard();

    fireEvent.click(screen.getByTestId("button-add-from-friends"));

    expect((await screen.findByTestId("text-friends-picker-empty")).textContent).toContain("Manage Friends");
    expect(screen.queryByTestId("text-assigned-friends")).toBeNull();
  });

  it("assigns picked friends to the first seats in pick order", async () => {
    seedFriends(["Eddie", "Eric", "Logan"]);
    const onStart = vi.fn();
    renderWizard(onStart);

    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    fireEvent.click(await screen.findByTestId("friend-pick-local-2"));
    fireEvent.click(screen.getByTestId("friend-pick-local-1"));
    fireEvent.click(screen.getByTestId("button-confirm-friends"));

    const summary = screen.getByTestId("text-assigned-friends");
    expect(summary.textContent).toContain("2 added: Eric, Eddie");

    fireEvent.click(screen.getByTestId("button-start-game"));
    const [count, names] = onStart.mock.calls[0];
    expect(count).toBe(8);
    expect(names).toEqual([
      "Eric", "Eddie", "Player 3", "Player 4",
      "Player 5", "Player 6", "Player 7", "Player 8",
    ]);
  });

  it("bumps the player count up to fit assigned friends but never lowers it", async () => {
    seedFriends(Array.from({ length: 10 }, (_, i) => `Friend ${i + 1}`));
    renderWizard();

    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    await screen.findByTestId("friend-pick-local-1");
    for (let i = 1; i <= 10; i++) {
      fireEvent.click(screen.getByTestId(`friend-pick-local-${i}`));
    }
    fireEvent.click(screen.getByTestId("button-confirm-friends"));

    // Default was 8, 10 friends were picked, count bumped to 10.
    expect(screen.getByTestId("text-player-count").textContent).toBe("10");

    // Re-open and unpick down to 2; count stays at 10 (never auto-lowers).
    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    for (let i = 3; i <= 10; i++) {
      fireEvent.click(screen.getByTestId(`friend-pick-local-${i}`));
    }
    fireEvent.click(screen.getByTestId("button-confirm-friends"));
    expect(screen.getByTestId("text-player-count").textContent).toBe("10");
  });

  it("lowering the count below assigned friends truncates names without crashing", async () => {
    seedFriends(["Eddie", "Eric", "Logan"]);
    const onStart = vi.fn();
    renderWizard(onStart);

    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    fireEvent.click(await screen.findByTestId("friend-pick-local-1"));
    fireEvent.click(screen.getByTestId("friend-pick-local-2"));
    fireEvent.click(screen.getByTestId("friend-pick-local-3"));
    fireEvent.click(screen.getByTestId("button-confirm-friends"));

    // Lower from 8 to 5 (below is not possible, min is 5) then to check truncation, drop to 5 seats with 3 friends still fine; drop count to minimum.
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByTestId("button-decrease-players"));
    }
    expect(screen.getByTestId("text-player-count").textContent).toBe("5");

    fireEvent.click(screen.getByTestId("button-start-game"));
    const [count, names] = onStart.mock.calls[0];
    expect(count).toBe(5);
    expect(names).toEqual(["Eddie", "Eric", "Logan", "Player 4", "Player 5"]);
  });

  it("clear restores default names and hides the summary", async () => {
    seedFriends(["Eddie", "Eric"]);
    const onStart = vi.fn();
    renderWizard(onStart);

    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    fireEvent.click(await screen.findByTestId("friend-pick-local-1"));
    fireEvent.click(screen.getByTestId("friend-pick-local-2"));
    fireEvent.click(screen.getByTestId("button-confirm-friends"));
    expect(screen.getByTestId("text-assigned-friends")).toBeTruthy();

    fireEvent.click(screen.getByTestId("button-clear-assigned-friends"));
    expect(screen.queryByTestId("text-assigned-friends")).toBeNull();

    fireEvent.click(screen.getByTestId("button-start-game"));
    const [count, names] = onStart.mock.calls[0];
    expect(count).toBe(8);
    expect(names).toEqual([
      "Player 1", "Player 2", "Player 3", "Player 4",
      "Player 5", "Player 6", "Player 7", "Player 8",
    ]);
  });

  it("preserves duplicate-name selections by id when reopening the picker", async () => {
    // Two friends both named Sam plus one Eddie.
    localStorage.setItem(
      "clocktower_friends",
      JSON.stringify([
        { id: "local-1", name: "Sam" },
        { id: "local-2", name: "Sam" },
        { id: "local-3", name: "Eddie" },
      ]),
    );
    renderWizard();

    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    fireEvent.click(await screen.findByTestId("friend-pick-local-2"));
    fireEvent.click(screen.getByTestId("friend-pick-local-3"));
    fireEvent.click(screen.getByTestId("button-confirm-friends"));

    expect(screen.getByTestId("text-assigned-friends").textContent).toContain("2 added: Sam, Eddie");

    // Reopen: the second Sam (local-2) is still the one preselected.
    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    expect((await screen.findByTestId("friend-pick-local-2")).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("friend-pick-local-1").getAttribute("aria-pressed")).toBe("false");
  });

  it("caps picks at 20 so the summary matches the seats", async () => {
    seedFriends(Array.from({ length: 22 }, (_, i) => `Friend ${i + 1}`));
    renderWizard();

    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    await screen.findByTestId("friend-pick-local-1");
    for (let i = 1; i <= 22; i++) {
      fireEvent.click(screen.getByTestId(`friend-pick-local-${i}`));
    }
    // Picks 21 and 22 are rejected; their buttons are disabled at the cap.
    expect((screen.getByTestId("friend-pick-local-21") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByTestId("button-confirm-friends"));

    expect(screen.getByTestId("text-player-count").textContent).toBe("20");
    expect(screen.getByTestId("text-assigned-friends").textContent).toContain("20 added:");
  });

  it("keeps traveler naming for unassigned seats above 15", async () => {
    seedFriends(["Eddie"]);
    const onStart = vi.fn();
    renderWizard(onStart);

    fireEvent.click(screen.getByTestId("button-add-from-friends"));
    fireEvent.click(await screen.findByTestId("friend-pick-local-1"));
    fireEvent.click(screen.getByTestId("button-confirm-friends"));

    for (let i = 0; i < 8; i++) {
      fireEvent.click(screen.getByTestId("button-increase-players"));
    }
    expect(screen.getByTestId("text-player-count").textContent).toBe("16");

    fireEvent.click(screen.getByTestId("button-start-game"));
    const [count, names] = onStart.mock.calls[0];
    expect(count).toBe(16);
    expect(names[0]).toBe("Eddie");
    expect(names[14]).toBe("Player 15");
    expect(names[15]).toBe("Traveler 1");
  });
});
