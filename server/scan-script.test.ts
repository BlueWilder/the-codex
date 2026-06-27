import express, { type Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Anthropic SDK so no real network/paid API call happens. The mocked
// `messages.create` is controlled per-test to simulate what the model returns.
const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: createMock };
  },
}));

// The route short-circuits with 503 unless an API key is configured. Set a
// dummy one so requests reach the (mocked) scanning logic.
process.env.ANTHROPIC_API_KEY = "test-key";

let app: Express;
let VALID_CHARACTER_NAMES: string[];
let db: typeof import("./db").db;
let scanRateLimits: typeof import("@shared/schema").scanRateLimits;

// Each test uses a distinct client IP so the per-client rate limiter state does
// not bleed between tests. `trust proxy` makes Express honour X-Forwarded-For.
let ipCounter = 0;
function freshIp(): string {
  ipCounter += 1;
  return `10.1.0.${ipCounter}`;
}

function modelReturns(names: unknown): void {
  createMock.mockResolvedValue({
    content: [{ type: "text", text: JSON.stringify({ names }) }],
  });
}

beforeAll(async () => {
  const { registerScanScriptRoute } = await import("./routes");
  ({ VALID_CHARACTER_NAMES } = await import("./character-names"));
  ({ db } = await import("./db"));
  ({ scanRateLimits } = await import("@shared/schema"));

  app = express();
  app.use(express.json({ limit: "12mb" }));
  app.set("trust proxy", true);
  registerScanScriptRoute(app);
});

beforeEach(async () => {
  createMock.mockReset();
  // Clear persisted rate-limit counters (per-client AND the shared global
  // backstop) so tests are deterministic and don't bleed across runs.
  await db.delete(scanRateLimits);
  // Default the global backstop high so per-client tests aren't affected by it;
  // individual tests override SCAN_GLOBAL_MAX when exercising the backstop.
  process.env.SCAN_GLOBAL_MAX = "10000";
});

const TINY_IMAGE = "aGVsbG8="; // base64 of "hello"

describe("POST /api/scan-script", () => {
  it("only returns allowlisted character names, dropping anything not on the list", async () => {
    const realName = VALID_CHARACTER_NAMES[0];
    const anotherRealName = VALID_CHARACTER_NAMES[1];
    // Model output mixes valid names with a bogus name and a non-string.
    modelReturns([realName, "Totally Made Up Character", anotherRealName, 42]);

    const res = await request(app)
      .post("/api/scan-script")
      .set("X-Forwarded-For", freshIp())
      .send({ image: TINY_IMAGE, mediaType: "image/jpeg" });

    expect(res.status).toBe(200);
    expect(res.body.names).toEqual([realName, anotherRealName]);
    expect(res.body.names).not.toContain("Totally Made Up Character");
  });

  it("maps fuzzy / differently-cased model output back to canonical names", async () => {
    const realName = VALID_CHARACTER_NAMES[0];
    // Lowercased + punctuation/space stripped should still match the allowlist.
    modelReturns([realName.toLowerCase().replace(/[^a-z0-9]/gi, " ")]);

    const res = await request(app)
      .post("/api/scan-script")
      .set("X-Forwarded-For", freshIp())
      .send({ image: TINY_IMAGE, mediaType: "image/jpeg" });

    expect(res.status).toBe(200);
    expect(res.body.names).toEqual([realName]);
  });

  it("rejects oversized image payloads with a 400 before calling the model", async () => {
    const oversized = "a".repeat(11_000_001);

    const res = await request(app)
      .post("/api/scan-script")
      .set("X-Forwarded-For", freshIp())
      .send({ image: oversized, mediaType: "image/jpeg" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too large/i);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects an unsupported media type with a 400", async () => {
    const res = await request(app)
      .post("/api/scan-script")
      .set("X-Forwarded-For", freshIp())
      .send({ image: TINY_IMAGE, mediaType: "image/tiff" });

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 429 once a single IP exceeds the rate-limit threshold", async () => {
    const ip = freshIp();
    modelReturns([VALID_CHARACTER_NAMES[0]]);

    const SCAN_RATE_MAX = 15;
    // The first SCAN_RATE_MAX requests should be allowed.
    for (let i = 0; i < SCAN_RATE_MAX; i += 1) {
      const ok = await request(app)
        .post("/api/scan-script")
        .set("X-Forwarded-For", ip)
        .send({ image: TINY_IMAGE, mediaType: "image/jpeg" });
      expect(ok.status).toBe(200);
    }

    // The next request from the same IP within the window is throttled.
    const blocked = await request(app)
      .post("/api/scan-script")
      .set("X-Forwarded-For", ip)
      .send({ image: TINY_IMAGE, mediaType: "image/jpeg" });

    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/too many/i);

    // A different IP is unaffected by the first IP's exhausted budget.
    const otherIp = await request(app)
      .post("/api/scan-script")
      .set("X-Forwarded-For", freshIp())
      .send({ image: TINY_IMAGE, mediaType: "image/jpeg" });
    expect(otherIp.status).toBe(200);
  });

  it("enforces a site-wide global budget even across many distinct IPs", async () => {
    modelReturns([VALID_CHARACTER_NAMES[0]]);

    // Tighten the global backstop so it trips well before any per-client cap.
    const GLOBAL_MAX = 5;
    process.env.SCAN_GLOBAL_MAX = String(GLOBAL_MAX);

    // Each request comes from a brand-new IP, so the per-client cap never fires;
    // only the shared global budget can stop them.
    for (let i = 0; i < GLOBAL_MAX; i += 1) {
      const ok = await request(app)
        .post("/api/scan-script")
        .set("X-Forwarded-For", freshIp())
        .send({ image: TINY_IMAGE, mediaType: "image/jpeg" });
      expect(ok.status).toBe(200);
    }

    // The next request from yet another fresh IP is blocked by the global cap.
    const blocked = await request(app)
      .post("/api/scan-script")
      .set("X-Forwarded-For", freshIp())
      .send({ image: TINY_IMAGE, mediaType: "image/jpeg" });

    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/scanner is busy/i);
  });
});
