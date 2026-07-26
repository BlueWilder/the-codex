// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalMenu } from "@/components/GlobalMenu";
import { Navigation } from "@/components/Navigation";

const FRIENDS_KEY = "clocktower_friends";

function seedFriends(names: string[]) {
  localStorage.setItem(
    FRIENDS_KEY,
    JSON.stringify(names.map((name, i) => ({ id: `local-${i + 1}`, name }))),
  );
}

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

async function openMenu() {
  const trigger = screen.getByTestId("button-global-menu");
  fireEvent.pointerDown(trigger);
  fireEvent.click(trigger);
  await screen.findByTestId("menu-item-friends");
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("GlobalMenu", () => {
  it("closes the menu on Escape while focused in the quick-add input", async () => {
    renderWithClient(<GlobalMenu />);
    await openMenu();
    const input = screen.getByTestId("input-quick-add-friend");
    input.focus();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByTestId("menu-item-friends")).toBeNull();
  });

  it("quick-add button has an accessible name", async () => {
    renderWithClient(<GlobalMenu />);
    await openMenu();
    expect(
      screen.getByTestId("button-quick-add-friend").getAttribute("aria-label"),
    ).toBe("Add friend");
  });

  it("renders the three-dot menu button in the navigation bar", () => {
    renderWithClient(<Navigation />);
    expect(screen.getByTestId("button-global-menu")).toBeTruthy();
  });

  it("opens the friends manager from the menu", async () => {
    seedFriends(["Logan"]);
    renderWithClient(<GlobalMenu />);
    await openMenu();
    fireEvent.click(screen.getByTestId("menu-item-friends"));
    await screen.findByText("Manage Friends");
    expect(screen.getByTestId("text-friend-name-local-1").textContent).toBe("Logan");
  });

  it("quick-adds a friend and persists it", async () => {
    renderWithClient(<GlobalMenu />);
    await openMenu();
    const input = screen.getByTestId("input-quick-add-friend");
    fireEvent.change(input, { target: { value: "Eddie" } });
    fireEvent.click(screen.getByTestId("button-quick-add-friend"));

    await screen.findByTestId("text-quick-add-success");
    const stored = JSON.parse(localStorage.getItem(FRIENDS_KEY) ?? "[]");
    expect(stored.map((f: { name: string }) => f.name)).toEqual(["Eddie"]);
    // input clears for the next add
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("quick-adds via Enter key", async () => {
    renderWithClient(<GlobalMenu />);
    await openMenu();
    const input = screen.getByTestId("input-quick-add-friend");
    fireEvent.change(input, { target: { value: "Russ" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await screen.findByTestId("text-quick-add-success");
    const stored = JSON.parse(localStorage.getItem(FRIENDS_KEY) ?? "[]");
    expect(stored.map((f: { name: string }) => f.name)).toEqual(["Russ"]);
  });

  it("rejects a duplicate name (case-insensitive) and keeps the list unchanged", async () => {
    seedFriends(["Eric"]);
    renderWithClient(<GlobalMenu />);
    await openMenu();
    const input = screen.getByTestId("input-quick-add-friend");
    fireEvent.change(input, { target: { value: "  eric " } });
    fireEvent.click(screen.getByTestId("button-quick-add-friend"));

    await screen.findByTestId("text-quick-add-duplicate");
    const stored = JSON.parse(localStorage.getItem(FRIENDS_KEY) ?? "[]");
    expect(stored.map((f: { name: string }) => f.name)).toEqual(["Eric"]);
    // input keeps the typed value so the user can correct it
    expect((input as HTMLInputElement).value).toBe("  eric ");
  });

  it("friend added via quick-add shows up in the manager", async () => {
    renderWithClient(<GlobalMenu />);
    await openMenu();
    fireEvent.change(screen.getByTestId("input-quick-add-friend"), {
      target: { value: "Judson" },
    });
    fireEvent.click(screen.getByTestId("button-quick-add-friend"));
    await screen.findByTestId("text-quick-add-success");

    fireEvent.click(screen.getByTestId("menu-item-friends"));
    await screen.findByText("Manage Friends");
    expect(screen.getByText("Judson")).toBeTruthy();
  });
});
