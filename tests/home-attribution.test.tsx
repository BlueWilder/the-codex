// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";

afterEach(cleanup);

function renderHome() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <Home />
    </QueryClientProvider>,
  );
}

describe("Home landing colophon", () => {
  it("shows the attribution colophon with both external links", () => {
    renderHome();

    expect(screen.getByTestId("text-attribution")).toBeTruthy();

    const mage = screen.getByTestId("link-mage-productions");
    expect(mage.getAttribute("href")).toBe("https://mageproductions.com");
    expect(mage.getAttribute("target")).toBe("_blank");
    expect(mage.getAttribute("rel")).toBe("noopener noreferrer");

    const botc = screen.getByTestId("link-botc-official");
    expect(botc.getAttribute("href")).toBe("https://bloodontheclocktower.com");
    expect(botc.getAttribute("target")).toBe("_blank");
    expect(botc.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("keeps the existing Enter Game Mode CTA", () => {
    renderHome();
    expect(screen.getByTestId("link-enter-game-mode")).toBeTruthy();
  });
});
