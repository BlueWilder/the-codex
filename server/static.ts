import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectRouteMetadata } from "./seo";

let cachedHtml: string | null = null;

function getIndexHtml(distPath: string): string {
  if (!cachedHtml) {
    cachedHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
  }
  return cachedHtml;
}

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
    const baseHtml = getIndexHtml(distPath);
    const injected = injectRouteMetadata(baseHtml, req.path || "/");
    res.setHeader("Content-Type", "text/html");
    if (!SPA_ROUTES.has(req.path)) {
      res.status(404);
    }
    res.send(injected);
  });
}
