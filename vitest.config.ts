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
        // Server suite. These tests currently connect to the live DATABASE_URL
        // and one of them truncates a table, so do NOT run this project until
        // the storage layer is injectable. Run `--project client` instead.
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
