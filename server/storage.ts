import { db } from "./db";
import {
  scripts,
  games,
  customScripts,
  friends,
  scanRateLimits,
  type InsertScript,
  type InsertGame,
  type InsertCustomScript,
  type Friend,
  type InsertFriend,
  type Script,
  type Game,
  type CustomScript,
  type UpdateGameRequest
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Scripts
  getScripts(): Promise<Script[]>;
  getScript(id: number): Promise<Script | undefined>;
  createScript(script: InsertScript): Promise<Script>;

  // Custom Scripts (user-specific)
  getCustomScripts(userId: string): Promise<CustomScript[]>;
  createCustomScript(script: InsertCustomScript): Promise<CustomScript>;
  updateCustomScript(id: number, userId: string, updates: Partial<InsertCustomScript>): Promise<CustomScript | null>;
  deleteCustomScript(id: number, userId: string): Promise<boolean>;

  // Friends (user-specific)
  getFriends(userId: string): Promise<Friend[]>;
  createFriend(friend: InsertFriend): Promise<Friend>;
  updateFriend(id: number, userId: string, data: { name: string }): Promise<Friend | null>;
  deleteFriend(id: number, userId: string): Promise<boolean>;

  // Games
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, updates: UpdateGameRequest): Promise<Game>;
  deleteGame(id: number): Promise<void>;

  // Rate limiting. `key` identifies the bucket to count against: a per-client
  // key (user id or IP) or a shared site-wide key for the global backstop.
  checkScanRateLimit(key: string, max: number, windowMs: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Scripts
  async getScripts(): Promise<Script[]> {
    return await db.select().from(scripts);
  }

  async getScript(id: number): Promise<Script | undefined> {
    const [script] = await db.select().from(scripts).where(eq(scripts.id, id));
    return script;
  }

  async createScript(insertScript: InsertScript): Promise<Script> {
    const [script] = await db.insert(scripts).values(insertScript).returning();
    return script;
  }

  // Custom Scripts (user-specific)
  async getCustomScripts(userId: string): Promise<CustomScript[]> {
    return await db.select().from(customScripts).where(eq(customScripts.userId, userId));
  }

  async createCustomScript(insertScript: InsertCustomScript): Promise<CustomScript> {
    const [script] = await db.insert(customScripts).values(insertScript).returning();
    return script;
  }

  async updateCustomScript(id: number, userId: string, updates: Partial<InsertCustomScript>): Promise<CustomScript | null> {
    const [script] = await db.update(customScripts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(customScripts.id, id), eq(customScripts.userId, userId)))
      .returning();
    return script || null;
  }

  async deleteCustomScript(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(customScripts)
      .where(and(eq(customScripts.id, id), eq(customScripts.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Friends (user-specific)
  async getFriends(userId: string): Promise<Friend[]> {
    return await db.select().from(friends).where(eq(friends.userId, userId));
  }

  async createFriend(insertFriend: InsertFriend): Promise<Friend> {
    const [friend] = await db.insert(friends).values(insertFriend).returning();
    return friend;
  }

  async updateFriend(id: number, userId: string, data: { name: string }): Promise<Friend | null> {
    const [friend] = await db.update(friends)
      .set({ name: data.name })
      .where(and(eq(friends.id, id), eq(friends.userId, userId)))
      .returning();
    return friend || null;
  }

  async deleteFriend(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(friends)
      .where(and(eq(friends.id, id), eq(friends.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Games
  async getGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async updateGame(id: number, updates: UpdateGameRequest): Promise<Game> {
    const [updated] = await db.update(games)
      .set(updates)
      .where(eq(games.id, id))
      .returning();
    return updated;
  }

  async deleteGame(id: number): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  // Rate limiting (atomic, shared across servers/restarts via PostgreSQL)
  async checkScanRateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
    const resetAt = new Date(Date.now() + windowMs);
    // Single atomic upsert: start a fresh window when the previous one has
    // expired, otherwise increment (capped at max+1 so denied requests don't
    // grow the counter without bound). Allowed when the resulting count <= max.
    const result = await db.execute(sql`
      INSERT INTO scan_rate_limits (ip, count, reset_at)
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT (ip) DO UPDATE SET
        count = CASE
          WHEN scan_rate_limits.reset_at < now() THEN 1
          ELSE LEAST(scan_rate_limits.count + 1, ${max + 1})
        END,
        reset_at = CASE
          WHEN scan_rate_limits.reset_at < now() THEN ${resetAt}
          ELSE scan_rate_limits.reset_at
        END
      RETURNING count
    `);
    const row = (result.rows?.[0] ?? {}) as { count?: number };

    // Opportunistically clean up expired rows so the table doesn't accumulate
    // entries for IPs that never return.
    if (Math.random() < 0.01) {
      void db.delete(scanRateLimits).where(sql`${scanRateLimits.resetAt} < now()`);
    }

    return Number(row.count ?? max + 1) <= max;
  }
}

export const storage = new DatabaseStorage();
