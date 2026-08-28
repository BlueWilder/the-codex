import type { IStorage } from "./storage";
import type {
  Script,
  Game,
  CustomScript,
  Friend,
  InsertScript,
  InsertGame,
  InsertCustomScript,
  InsertFriend,
  UpdateGameRequest,
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
  private games: Game[] = [];
  private rateLimits = new Map<string, { count: number; resetAt: number }>();
  private nextId = 1;

  /** Drop all state. Call between tests instead of deleting database rows. */
  reset(): void {
    this.scripts = [];
    this.customScripts = [];
    this.friends = [];
    this.games = [];
    this.rateLimits.clear();
    this.nextId = 1;
  }

  // Scripts
  async getScripts(): Promise<Script[]> {
    return [...this.scripts];
  }

  async getScript(id: number): Promise<Script | undefined> {
    return this.scripts.find((s) => s.id === id);
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

  // Games
  async getGames(): Promise<Game[]> {
    return [...this.games];
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.find((g) => g.id === id);
  }

  async createGame(game: InsertGame): Promise<Game> {
    const row = {
      ...game,
      id: this.nextId++,
      name: game.name ?? "New Game",
      scriptId: game.scriptId ?? null,
      playerCount: game.playerCount ?? 0,
      isFinished: game.isFinished ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Game;
    this.games.push(row);
    return row;
  }

  async updateGame(id: number, updates: UpdateGameRequest): Promise<Game> {
    const row = this.games.find((g) => g.id === id);
    if (!row) throw new Error(`Game ${id} not found`);
    Object.assign(row, updates, { updatedAt: new Date() });
    return row;
  }

  async deleteGame(id: number): Promise<void> {
    const i = this.games.findIndex((g) => g.id === id);
    if (i !== -1) this.games.splice(i, 1);
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
