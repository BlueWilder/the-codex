/**
 * INTEGRATION TEST. Requires a real, throwaway PostgreSQL database.
 *
 * Not matched by any vitest project: the filename ends in `-test.ts`, not
 * `.test.ts`, so `npx vitest run` will never pick it up. That is deliberate.
 * It truncates the scan_rate_limits table, which must never happen against
 * production.
 *
 * To enable it (Option A):
 *   1. Provision a throwaway database and set TEST_DATABASE_URL.
 *   2. Teach server/db.ts to resolve TEST_DATABASE_URL when process.env.VITEST
 *      is set, and to refuse to start if it resolves equal to DATABASE_URL.
 *   3. Add an `integration` project to vitest.config.ts whose include matches
 *      `server/**\/*.integration-test.ts`.
 *   4. Rename this file to `.integration.test.ts` if you want the default
 *      glob to see it, or keep the include explicit.
 *
 * What this pins that the in-memory fake cannot: the atomic upsert in
 * DatabaseStorage.checkScanRateLimit (ON CONFLICT / CASE / LEAST window
 * logic), which is the most intricate SQL in the repo.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { DatabaseStorage } from "./storage";
import { db } from "./db";
import { scanRateLimits } from "@shared/schema";

const storage = new DatabaseStorage();

beforeEach(async () => {
  await db.delete(scanRateLimits);
});

describe("DatabaseStorage.checkScanRateLimit (real SQL)", () => {
  it("allows up to max within a window, then denies", async () => {
    const key = `test:${Date.now()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(await storage.checkScanRateLimit(key, 3, 60_000)).toBe(true);
    }
    expect(await storage.checkScanRateLimit(key, 3, 60_000)).toBe(false);
  });

  it("keeps separate keys independent", async () => {
    const a = `test-a:${Date.now()}`;
    const b = `test-b:${Date.now()}`;
    expect(await storage.checkScanRateLimit(a, 1, 60_000)).toBe(true);
    expect(await storage.checkScanRateLimit(a, 1, 60_000)).toBe(false);
    expect(await storage.checkScanRateLimit(b, 1, 60_000)).toBe(true);
  });

  it("starts a fresh window once the previous one has expired", async () => {
    const key = `test-expiry:${Date.now()}`;
    // A zero-length window is already expired on the next call.
    expect(await storage.checkScanRateLimit(key, 1, 0)).toBe(true);
    expect(await storage.checkScanRateLimit(key, 1, 0)).toBe(true);
  });

  it("caps the stored count so denied requests cannot grow it without bound", async () => {
    const key = `test-cap:${Date.now()}`;
    for (let i = 0; i < 10; i += 1) {
      await storage.checkScanRateLimit(key, 2, 60_000);
    }
    const rows = await db.select().from(scanRateLimits);
    const row = rows.find((r) => r.ip === key);
    expect(row?.count).toBe(3); // max + 1
  });
});
