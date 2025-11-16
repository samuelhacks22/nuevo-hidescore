import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import { createApp } from "./app";

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function serveStaticLocal(app: any) {
  if (process.env.VERCEL) return;

  const distPath = path.resolve(import.meta.dirname, "..", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  // import express dynamically so we don't pull Vite/dev-only deps when bundling
  // this runner only needs express.static at runtime
  const express = (await import("express")).default;
  app.use(express.static(distPath));
  app.use("*", (_req: any, res: any) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  const { app } = await createApp();

  try {
    serveStaticLocal(app);
  } catch (err) {
    log(`Warning serving static files: ${err instanceof Error ? err.message : String(err)}`);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
