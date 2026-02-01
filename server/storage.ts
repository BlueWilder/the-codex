import { db } from "./db";
import {
  scripts,
  games,
  customScripts,
  type InsertScript,
  type InsertGame,
  type InsertCustomScript,
  type Script,
  type Game,
  type CustomScript,
  type UpdateGameRequest
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

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

  // Games
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, updates: UpdateGameRequest): Promise<Game>;
  deleteGame(id: number): Promise<void>;
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
}

export const storage = new DatabaseStorage();
