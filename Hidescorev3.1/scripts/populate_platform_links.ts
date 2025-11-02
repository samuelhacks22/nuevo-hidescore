#!/usr/bin/env -S tsx
/**
 * Populate platform_links for existing movies/series by generating search URLs
 * based on platform names and the title. Run with DATABASE_URL set.
 * Usage (PowerShell):
 *   $Env:DATABASE_URL = "postgresql://..."; npx tsx .\scripts\populate_platform_links.ts
 */
import { storage } from "../server/storage";

function platformSearchUrl(platform: string, title: string) {
  const t = encodeURIComponent(title);
  const p = platform.toLowerCase();
  if (p.includes("netflix")) return `https://www.netflix.com/search?q=${t}`;
  if (p.includes("amazon") || p.includes("prime")) return `https://www.amazon.com/s?k=${t}&i=instant-video`;
  if (p.includes("hbo" ) || p.includes("max")) return `https://www.hbomax.com/search?q=${t}`;
  if (p.includes("disney")) return `https://www.disneyplus.com/search?q=${t}`;
  if (p.includes("paramount")) return `https://www.paramountplus.com/search/?q=${t}`;
  if (p.includes("apple")) return `https://tv.apple.com/search?q=${t}`;
  // fallback: use Google search
  return `https://www.google.com/search?q=${t}+${encodeURIComponent(platform)}`;
}

async function run() {
  console.log("Populating platform_links for movies...");
  try {
    const movies = await storage.getAllMovies();
    for (const m of movies) {
      const platforms = m.platform || [];
      const existing = m.platformLinks || [];
      // if links already present and length matches, skip
  if (platforms.length > 0 && existing && existing.length === platforms.length && existing.some((l: string) => l && l.length > 0)) {
        console.log(`Skipping movie ${m.title} (already has links)`);
        continue;
      }

      const links = platforms.map((p: string) => platformSearchUrl(p, m.title));
      await storage.updateMovie(m.id, { platformLinks: links });
      console.log(`Updated movie ${m.title} -> ${links.join(', ')}`);
    }

    console.log("Populating platform_links for series...");
    const series = await storage.getAllSeries();
    for (const s of series) {
      const platforms = s.platform || [];
      const existing = s.platformLinks || [];
  if (platforms.length > 0 && existing && existing.length === platforms.length && existing.some((l: string) => l && l.length > 0)) {
        console.log(`Skipping series ${s.title} (already has links)`);
        continue;
      }

      const links = platforms.map((p: string) => platformSearchUrl(p, s.title));
      await storage.updateSeries(s.id, { platformLinks: links });
      console.log(`Updated series ${s.title} -> ${links.join(', ')}`);
    }

    console.log("Done populating platform_links.");
  } catch (err) {
    console.error("Failed to populate platform_links:", err);
    process.exit(1);
  }
}

run();
