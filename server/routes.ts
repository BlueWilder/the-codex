import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  registerAuthRoutes(app);

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
      const { name, characterIds } = req.body;
      if (!name || !characterIds || !Array.isArray(characterIds)) {
        return res.status(400).json({ message: "Name and characterIds are required" });
      }
      const script = await storage.createCustomScript({ userId, name, characterIds });
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
      const { name, characterIds } = req.body;
      const script = await storage.updateCustomScript(scriptId, userId, { name, characterIds });
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
