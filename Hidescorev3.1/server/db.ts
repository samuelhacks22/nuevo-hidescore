// Database connection setup - based on javascript_database blueprint
// @ts-ignore: missing type declarations for '@neondatabase/serverless'
import { Pool, neonConfig } from '@neondatabase/serverless';
// @ts-ignore: missing type declarations for 'drizzle-orm/neon-serverless'
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Configure for Vercel serverless environment
// In Vercel, @neondatabase/serverless uses HTTP fetch automatically, no WebSocket needed
if (process.env.VERCEL) {
  console.log('[DB] Configuring for Vercel serverless environment');
  neonConfig.fetchConnectionCache = true;
} else {
  // Only configure WebSocket for non-Vercel environments
  // Use a try-catch to handle cases where ws might not be available
  try {
    // @ts-ignore: ws might not be available in all environments
    const ws = require("ws");
    if (typeof WebSocket === 'undefined' && ws) {
      neonConfig.webSocketConstructor = ws.default || ws;
    }
  } catch (e) {
    // WebSocket not available, but that's OK for Vercel
    console.warn('[DB] WebSocket module not available, using default configuration');
  }
}

if (!process.env.DATABASE_URL) {
  console.error('[DB] DATABASE_URL environment variable is not set');
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Clean DATABASE_URL: remove quotes and unescape HTML entities
const cleanDatabaseUrl = (url: string): string => {
  return url
    .replace(/^['"]|['"]$/g, '') // Remove surrounding quotes
    .replace(/&amp;/g, '&')      // Unescape &amp; to &
    .replace(/&lt;/g, '<')       // Unescape &lt; to <
    .replace(/&gt;/g, '>')       // Unescape &gt; to >
    .replace(/&quot;/g, '"');    // Unescape &quot; to "
};

const databaseUrl = cleanDatabaseUrl(process.env.DATABASE_URL);

// Log connection info (without exposing credentials)
const urlParts = databaseUrl.split('@');
if (urlParts.length > 1) {
  const hostPart = urlParts[urlParts.length - 1];
  console.log(`[DB] Connecting to database at: ${hostPart.split('?')[0]}`);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
