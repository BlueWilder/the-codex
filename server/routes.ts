import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { updateCustomScriptSchema, updateFriendSchema } from "@shared/schema";
import { scanScriptImage } from "./anthropic";
import { VALID_CHARACTER_NAMES } from "./character-names";

const createCustomScriptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  characterIds: z.array(z.string()).min(1, "At least one character is required"),
  synopsis: z.string().nullable().optional(),
});

// ~11MB of base64 keeps us under the 12MB body limit while allowing a
// reasonably sized photo. The client downscales to ~1600px JPEG anyway.
const MAX_IMAGE_BASE64_LENGTH = 11_000_000;

const scanScriptSchema = z.object({
  image: z.string().min(1, "Image is required").max(MAX_IMAGE_BASE64_LENGTH, "Image is too large"),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
});

// Rate limiter config for the scan endpoint. The route calls a paid external
// API and is public, so we cap how often it can be hit. Counters are stored in
// PostgreSQL (see storage.checkScanRateLimit) so the limits hold across server
// restarts and are shared across multiple servers.
//
// Two layers of protection:
//  1. Per-client cap: keyed by user id for logged-in users (so rotating IPs
//     behind one account can't bypass it) and by IP otherwise.
//  2. Global backstop: a site-wide cap across ALL clients per window. This
//     guards the paid endpoint against an abuser rotating through many IPs,
//     which would otherwise defeat any per-IP limit.
//
// Limits are read dynamically (with defaults) so tests can tune them.
const GLOBAL_SCAN_KEY = "__global__";

function getScanLimits() {
  return {
    perMax: Number(process.env.SCAN_RATE_MAX ?? 15),
    perWindowMs: Number(process.env.SCAN_RATE_WINDOW_MS ?? 5 * 60 * 1000),
    globalMax: Number(process.env.SCAN_GLOBAL_MAX ?? 500),
    globalWindowMs: Number(process.env.SCAN_GLOBAL_WINDOW_MS ?? 60 * 60 * 1000),
  };
}

const createFriendSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// Friends routes (user-specific). Exported separately so tests can mount them
// with a stubbed auth middleware, mirroring registerScanScriptRoute.
export function registerFriendRoutes(
  app: Express,
  auth: typeof isAuthenticated = isAuthenticated
): void {
  app.get("/api/friends", auth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const friendsList = await storage.getFriends(userId);
      res.json(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.post("/api/friends", auth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const parsed = createFriendSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.errors[0].message,
          field: parsed.error.errors[0].path.join('.')
        });
      }
      const friend = await storage.createFriend({ userId, name: parsed.data.name });
      res.status(201).json(friend);
    } catch (error) {
      console.error("Error creating friend:", error);
      res.status(500).json({ message: "Failed to create friend" });
    }
  });

  app.put("/api/friends/:id", auth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const friendId = Number(req.params.id);
      const parsed = updateFriendSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.errors[0].message,
          field: parsed.error.errors[0].path.join('.')
        });
      }
      const friend = await storage.updateFriend(friendId, userId, parsed.data);
      if (!friend) {
        return res.status(404).json({ message: "Friend not found or unauthorized" });
      }
      res.json(friend);
    } catch (error) {
      console.error("Error updating friend:", error);
      res.status(500).json({ message: "Failed to update friend" });
    }
  });

  app.delete("/api/friends/:id", auth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const friendId = Number(req.params.id);
      const deleted = await storage.deleteFriend(friendId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Friend not found or unauthorized" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting friend:", error);
      res.status(500).json({ message: "Failed to delete friend" });
    }
  });
}

// Registers the public photo-to-script scanning endpoint. Extracted so it can
// be mounted in isolation (without auth/DB setup) by integration tests.
export function registerScanScriptRoute(app: Express): void {
  // === Scan paper script (Claude vision) ===
  app.post("/api/scan-script", async (req, res) => {
    const { perMax, perWindowMs, globalMax, globalWindowMs } = getScanLimits();

    // Prefer the authenticated user id so a single account can't dodge the cap
    // by switching networks/IPs; fall back to the client IP for anonymous users.
    const userId = (req.user as any)?.claims?.sub as string | undefined;
    const clientKey = userId
      ? `user:${userId}`
      : `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;

    const clientAllowed = await storage.checkScanRateLimit(clientKey, perMax, perWindowMs);
    if (!clientAllowed) {
      return res.status(429).json({ message: "Too many scans. Please wait a few minutes and try again." });
    }

    // Global backstop: only counts requests that already passed the per-client
    // cap, so an abuser rotating IPs still drains a shared site-wide budget.
    const globalAllowed = await storage.checkScanRateLimit(GLOBAL_SCAN_KEY, globalMax, globalWindowMs);
    if (!globalAllowed) {
      return res.status(429).json({ message: "The scanner is busy right now. Please try again in a little while." });
    }

    const parsed = scanScriptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ message: "Scanning is not configured. Missing Anthropic API key." });
    }
    try {
      const { image, mediaType } = parsed.data;
      const result = await scanScriptImage(image, mediaType, VALID_CHARACTER_NAMES);
      res.json(result);
    } catch (error) {
      console.error("Error scanning script:", error);
      const message = error instanceof Error ? error.message : "Failed to scan the script. Please try again.";
      res.status(502).json({ message });
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  registerAuthRoutes(app);

  registerScanScriptRoute(app);
  registerFriendRoutes(app);

  // === Custom Scripts (user-specific) ===
  app.get("/api/custom-scripts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const scripts = await storage.getCustomScripts(userId);
      res.json(scripts);
    } catch (error) {
      console.error("Error fetching custom scripts:", error);
      res.status(500).json({ message: "Failed to fetch custom scripts" });
    }
  });

  app.post("/api/custom-scripts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const parsed = createCustomScriptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: parsed.error.errors[0].message,
          field: parsed.error.errors[0].path.join('.')
        });
      }
      const { name, characterIds, synopsis } = parsed.data;
      const script = await storage.createCustomScript({ userId, name, characterIds, synopsis: synopsis || null });
      res.status(201).json(script);
    } catch (error) {
      console.error("Error creating custom script:", error);
      res.status(500).json({ message: "Failed to create custom script" });
    }
  });

  app.put("/api/custom-scripts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const scriptId = Number(req.params.id);
      const parsed = updateCustomScriptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: parsed.error.errors[0].message,
          field: parsed.error.errors[0].path.join('.')
        });
      }
      const script = await storage.updateCustomScript(scriptId, userId, parsed.data);
      if (!script) {
        return res.status(404).json({ message: "Script not found or unauthorized" });
      }
      res.json(script);
    } catch (error) {
      console.error("Error updating custom script:", error);
      res.status(500).json({ message: "Failed to update custom script" });
    }
  });

  app.delete("/api/custom-scripts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const scriptId = Number(req.params.id);
      const deleted = await storage.deleteCustomScript(scriptId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Script not found or unauthorized" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting custom script:", error);
      res.status(500).json({ message: "Failed to delete custom script" });
    }
  });

  // === Scripts ===
  app.get(api.scripts.list.path, async (_req, res) => {
    const scripts = await storage.getScripts();
    res.json(scripts);
  });

  app.get(api.scripts.get.path, async (req, res) => {
    const script = await storage.getScript(Number(req.params.id));
    if (!script) {
      return res.status(404).json({ message: 'Script not found' });
    }
    res.json(script);
  });

  app.post(api.scripts.create.path, async (req, res) => {
    try {
      const input = api.scripts.create.input.parse(req.body);
      const script = await storage.createScript(input);
      res.status(201).json(script);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Games ===
  app.get(api.games.list.path, async (_req, res) => {
    const games = await storage.getGames();
    res.json(games);
  });

  app.get(api.games.get.path, async (req, res) => {
    const game = await storage.getGame(Number(req.params.id));
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  });

  app.post(api.games.create.path, async (req, res) => {
    try {
      const input = api.games.create.input.parse(req.body);
      const game = await storage.createGame(input);
      res.status(201).json(game);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.games.update.path, async (req, res) => {
    try {
      const input = api.games.update.input.parse(req.body);
      const game = await storage.updateGame(Number(req.params.id), input);
      res.json(game);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.games.delete.path, async (req, res) => {
    await storage.deleteGame(Number(req.params.id));
    res.status(204).send();
  });

  // Seed default data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingScripts = await storage.getScripts();
  if (existingScripts.length === 0) {
    // Seed the classic "Trouble Brewing" script
    await storage.createScript({
      name: "Trouble Brewing",
      author: "The Pandemonium Institute",
      description: "A beginner-friendly script featuring some of the most classic characters.",
      isOfficial: true,
      content: {
        townsfolk: ["Washerwoman", "Librarian", "Investigator", "Chef", "Empath", "Fortune Teller", "Undertaker", "Monk", "Ravenkeeper", "Virgin", "Slayer", "Soldier", "Mayor"],
        outsiders: ["Butler", "Drunk", "Recluse", "Saint"],
        minions: ["Poisoner", "Spy", "Scarlet Woman", "Baron"],
        demons: ["Imp"]
      }
    });

    await storage.createScript({
      name: "Sects & Violets",
      author: "The Pandemonium Institute",
      description: "A more complex script with crazy interactions.",
      isOfficial: true,
      content: {
        townsfolk: ["Clockmaker", "Dreamer", "Snake Charmer", "Mathematician", "Flowergirl", "Town Crier", "Oracle", "Savant", "Seamstress", "Philosopher", "Artist", "Juggler", "Sage"],
        outsiders: ["Mutant", "Sweetheart", "Barber", "Klutz"],
        minions: ["Witch", "Cerenovus", "Pit-Hag", "Evil Twin"],
        demons: ["Fang Gu", "Vigormortis", "No Dashii", "Vortox"]
      }
    });
  }
}
