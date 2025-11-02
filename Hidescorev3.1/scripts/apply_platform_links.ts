#!/usr/bin/env -S tsx
/**
 * Apply platform_links migration and populate existing rows.
 * Usage (PowerShell):
 *   $Env:DATABASE_URL = "<your_database_url>"; npx tsx .\scripts\apply_platform_links.ts
 */
import { pool } from "../server/db";

async function run() {
  console.log("Starting migration: add platform_links columns and populate existing rows...");

  const statements = [
    `ALTER TABLE movies ADD COLUMN IF NOT EXISTS platform_links text[] DEFAULT ARRAY[]::text[];`,
    `ALTER TABLE series ADD COLUMN IF NOT EXISTS platform_links text[] DEFAULT ARRAY[]::text[];`,
    // populate platform_links with empty strings array having same length as platform when platform exists
    `UPDATE movies
     SET platform_links = array_fill(''::text, ARRAY[array_length(platform,1)])
     WHERE (platform_links IS NULL OR cardinality(platform_links) = 0)
       AND platform IS NOT NULL
       AND cardinality(platform) > 0;`,
    `UPDATE series
     SET platform_links = array_fill(''::text, ARRAY[array_length(platform,1)])
     WHERE (platform_links IS NULL OR cardinality(platform_links) = 0)
       AND platform IS NOT NULL
       AND cardinality(platform) > 0;`,
    `ALTER TABLE movies ALTER COLUMN platform_links DROP DEFAULT;`,
    `ALTER TABLE series ALTER COLUMN platform_links DROP DEFAULT;`,
  ];

  try {
    for (const s of statements) {
      console.log("Running:", s.split("\n")[0].slice(0, 120));
      // @ts-ignore - pool.query typing differs across environments
      const res = await pool.query(s);
      console.log("OK");
    }
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(2);
  } finally {
    try {
      // close pool if available
      if (typeof (pool as any).end === 'function') await (pool as any).end();
    } catch {}
  }
}

run();
