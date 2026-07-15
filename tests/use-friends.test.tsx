// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { useFriends } from "@/hooks/use-friends";

// Logged-out path: stub auth so no network call happens.
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: null, isLoading: false, isAuthenticated: false }),
}));

const FRIENDS_KEY = "clocktower_friends";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("useFriends (logged out, localStorage)", () => {
  it("starts empty with no stored friends", async () => {
    const hook = renderHook(() => useFriends(), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    expect(hook.result.current.friends).toEqual([]);
    expect(hook.result.current.isLoggedIn).toBe(false);
  });

  it("adds a friend and persists it to localStorage", async () => {
    const hook = renderHook(() => useFriends(), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    act(() => {
      hook.result.current.addFriend("Ana");
    });

    expect(hook.result.current.friends).toHaveLength(1);
    expect(hook.result.current.friends[0].name).toBe("Ana");

    const stored = JSON.parse(localStorage.getItem(FRIENDS_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Ana");
  });

  it("renames a friend and persists the change", async () => {
    const hook = renderHook(() => useFriends(), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    act(() => {
      hook.result.current.addFriend("Ana");
    });
    const id = hook.result.current.friends[0].id;

    act(() => {
      hook.result.current.renameFriend(id, "Anastasia");
    });

    expect(hook.result.current.friends[0].name).toBe("Anastasia");
    const stored = JSON.parse(localStorage.getItem(FRIENDS_KEY)!);
    expect(stored[0].name).toBe("Anastasia");
  });

  it("removes a friend and persists the removal", async () => {
    const hook = renderHook(() => useFriends(), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    act(() => {
      hook.result.current.addFriend("Ana");
    });
    act(() => {
      hook.result.current.addFriend("Bob");
    });
    const anaId = hook.result.current.friends.find((f) => f.name === "Ana")!.id;

    act(() => {
      hook.result.current.removeFriend(anaId);
    });

    expect(hook.result.current.friends.map((f) => f.name)).toEqual(["Bob"]);
    const stored = JSON.parse(localStorage.getItem(FRIENDS_KEY)!);
    expect(stored.map((f: any) => f.name)).toEqual(["Bob"]);
  });

  it("loads friends persisted from a previous session (survives reload)", async () => {
    localStorage.setItem(
      FRIENDS_KEY,
      JSON.stringify([{ id: "local-1", name: "Ana" }])
    );

    const hook = renderHook(() => useFriends(), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    expect(hook.result.current.friends).toEqual([{ id: "local-1", name: "Ana" }]);
  });

  it("recovers from corrupted localStorage data", async () => {
    localStorage.setItem(FRIENDS_KEY, "not json{{");

    const hook = renderHook(() => useFriends(), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    expect(hook.result.current.friends).toEqual([]);
  });
});
