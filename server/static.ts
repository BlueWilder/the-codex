import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const SPA_ROUTES = new Set(["/", "/reference", "/game", "/introduction"]);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (req, res) => {
    const pathname = req.path;
    if (SPA_ROUTES.has(pathname)) {
      res.sendFile(path.resolve(distPath, "index.html"));
    } else {
      res.status(404).sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
