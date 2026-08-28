import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Shared module aliases. Project configs do not inherit the root-level
// `resolve` block, so each project spreads this in explicitly.
const resolve = {
  alias: {
    "@": path.resolve(import.meta.dirname, "client", "src"),
    "@shared": path.resolve(import.meta.dirname, "shared"),
  },
};

export default defineConfig({
  resolve,
  test: {
    projects: [
      {
        // Client suite. Imports no server module and no database, so it is
        // always safe to run and needs no DATABASE_URL. Files opt into jsdom
        // individually with a `// @vitest-environment jsdom` directive.
        plugins: [react()],
        resolve,
        test: {
          name: "client",
          environment: "node",
          include: ["tests/**/*.test.{ts,tsx}"],
        },
      },
      {
        // Server suite. Storage is injected and the Anthropic SDK is mocked,
        // so these tests issue no queries and are safe to run. They do still
        // import server/db.ts, which throws unless DATABASE_URL is set, but a
        // pg Pool opens no connection until something queries it. The
        // `*.integration-test.ts` files are the ones that read and write a real
        // (throwaway) database, and this `.test.ts` glob does not match them.
        resolve,
        test: {
          name: "server",
          environment: "node",
          include: ["server/**/*.test.{ts,tsx}"],
        },
      },
    ],
  },
});
