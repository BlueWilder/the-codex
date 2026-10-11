import type { IStorage } from "./storage";
import type {
  Script,
  CustomScript,
  Friend,
  InsertScript,
  InsertCustomScript,
  InsertFriend,
} from "@shared/schema";

/**
 * In-memory IStorage for tests.
 *
 * Route tests care about how a handler behaves given what storage returns
 * (auth gating, validation, 409/404 mapping, rate-limit responses), not about
 * how Postgres stores it. Injecting this keeps those tests hermetic: no
 * DATABASE_URL, no cleanup between tests, no chance of touching live data.
 *
 * The SQL implementation itself (the atomic upsert in DatabaseStorage
 * .checkScanRateLimit, and the Drizzle scoping predicates) is NOT covered by
 * this fake. Those are pinned by the `*.integration-test.ts` files, which need
 * a real throwaway database. See their headers.
 */
export class InMemoryStorage implements IStorage {
  private scripts: Script[] = [];
  private customScripts: CustomScript[] = [];
  private friends: Friend[] = [];
  private rateLimits = new Map<string, { count: number; resetAt: number }>();
  private nextId = 1;

  /** Drop all state. Call between tests instead of deleting database rows. */
  reset(): void {
    this.scripts = [];
    this.customScripts = [];
    this.friends = [];
    this.rateLimits.clear();
    this.nextId = 1;
  }

  // Scripts
  async getScripts(): Promise<Script[]> {
    return [...this.scripts];
  }

  async createScript(script: InsertScript): Promise<Script> {
    const row = {
      ...script,
      id: this.nextId++,
      author: script.author ?? null,
      description: script.description ?? null,
      isOfficial: script.isOfficial ?? false,
      createdAt: new Date(),
    } as Script;
    this.scripts.push(row);
    return row;
  }

  // Custom Scripts (user-specific)
  async getCustomScripts(userId: string): Promise<CustomScript[]> {
    return this.customScripts.filter((s) => s.userId === userId);
  }

  async createCustomScript(script: InsertCustomScript): Promise<CustomScript> {
    const row = {
      ...script,
      id: this.nextId++,
      synopsis: script.synopsis ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as CustomScript;
    this.customScripts.push(row);
    return row;
  }

  async updateCustomScript(
    id: number,
    userId: string,
    updates: Partial<InsertCustomScript>
  ): Promise<CustomScript | null> {
    const row = this.customScripts.find((s) => s.id === id && s.userId === userId);
    if (!row) return null;
    Object.assign(row, updates, { updatedAt: new Date() });
    return row;
  }

  async deleteCustomScript(id: number, userId: string): Promise<boolean> {
    const i = this.customScripts.findIndex((s) => s.id === id && s.userId === userId);
    if (i === -1) return false;
    this.customScripts.splice(i, 1);
    return true;
  }

  // Friends (user-specific)
  async getFriends(userId: string): Promise<Friend[]> {
    return this.friends.filter((f) => f.userId === userId);
  }

  async createFriend(friend: InsertFriend): Promise<Friend> {
    const row: Friend = {
      id: this.nextId++,
      userId: friend.userId,
      name: friend.name,
      createdAt: new Date(),
    };
    this.friends.push(row);
    return row;
  }

  async updateFriend(id: number, userId: string, data: { name: string }): Promise<Friend | null> {
    const row = this.friends.find((f) => f.id === id && f.userId === userId);
    if (!row) return null;
    row.name = data.name;
    return row;
  }

  async deleteFriend(id: number, userId: string): Promise<boolean> {
    const i = this.friends.findIndex((f) => f.id === id && f.userId === userId);
    if (i === -1) return false;
    this.friends.splice(i, 1);
    return true;
  }

  /**
   * Mirrors the contract of the SQL upsert in DatabaseStorage: a fresh window
   * starts the count at 1, otherwise the count increments capped at max+1, and
   * the request is allowed when the resulting count is <= max.
   */
  async checkScanRateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const entry = this.rateLimits.get(key);
    if (!entry || entry.resetAt < now) {
      this.rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return 1 <= max;
    }
    entry.count = Math.min(entry.count + 1, max + 1);
    return entry.count <= max;
  }
}
