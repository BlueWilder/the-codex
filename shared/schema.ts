import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

// Custom Scripts (user-created)
export const customScripts = pgTable("custom_scripts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  characterIds: text("character_ids").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scripts (Official or Custom) - legacy table
export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  author: text("author"),
  description: text("description"),
  isOfficial: boolean("is_official").default(false),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved Games / Grimoire States
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  scriptId: integer("script_id").references(() => scripts.id),
  name: text("name").notNull().default("New Game"),
  playerCount: integer("player_count").default(0),
  gameState: jsonb("game_state").notNull(), // Stores current setup, token positions, etc.
  isFinished: boolean("is_finished").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SCHEMAS ===

export const insertCustomScriptSchema = createInsertSchema(customScripts).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});

export const insertScriptSchema = createInsertSchema(scripts).omit({ 
  id: true, 
  createdAt: true 
});

export const insertGameSchema = createInsertSchema(games).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// === EXPLICIT API TYPES ===

export type CustomScript = typeof customScripts.$inferSelect;
export type InsertCustomScript = z.infer<typeof insertCustomScriptSchema>;

export type Script = typeof scripts.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

// Request Types
export type CreateScriptRequest = InsertScript;
export type UpdateScriptRequest = Partial<InsertScript>;
export type CreateGameRequest = InsertGame;
export type UpdateGameRequest = Partial<InsertGame>;

// Response Types
export type ScriptResponse = Script;
export type GameResponse = Game;
