#!/usr/bin/env -S tsx
/**
 * Quick test: insert a movie with platformLinks using the server storage layer.
 * Run with DATABASE_URL set (PowerShell):
 *   $Env:DATABASE_URL = "postgresql://..."; npx tsx .\scripts\test_save_platform_links.ts
 */
import { storage } from "../server/storage";

async function run() {
  try {
    console.log("Creating test movie with platformLinks...");
    const movie = await storage.createMovie({
      title: `TEST Movie ${Date.now()}`,
      description: "Test movie for platformLinks",
      posterUrl: null,
      releaseYear: 2025,
      genre: ["Test"],
      platform: ["Netflix", "HBO Max"],
      platformLinks: [
        `https://www.netflix.com/search?q=${encodeURIComponent("TEST Movie")}`,
        `https://www.hbomax.com/search?q=${encodeURIComponent("TEST Movie")}`,
      ],
      director: null,
      cast: [],
      runtime: null,
      language: null,
      country: null,
    } as any);

    console.log("Inserted movie:", movie.id);
    console.log("platform:", movie.platform);
    console.log("platformLinks:", movie.platformLinks);

    console.log("Fetching back to verify...");
    const fetched = await storage.getMovie(movie.id);
    console.log("Fetched platformLinks:", fetched?.platformLinks);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
