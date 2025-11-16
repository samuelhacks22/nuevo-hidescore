// Database connection setup - based on javascript_database blueprint
// @ts-ignore: missing type declarations for '@neondatabase/serverless'
import { Pool, neonConfig } from '@neondatabase/serverless';
// @ts-ignore: missing type declarations for 'drizzle-orm/neon-serverless'
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Configure WebSocket constructor only if not in Vercel environment
// In Vercel, @neondatabase/serverless uses HTTP fetch automatically
// Use a conditional import approach for better compatibility
(async () => {
  if (typeof WebSocket === 'undefined' && !process.env.VERCEL) {
    try {
      // Use dynamic import to avoid issues in serverless environments
      const wsModule = await import("ws");
      neonConfig.webSocketConstructor = wsModule.default || wsModule;
    } catch (e) {
      // In Vercel, WebSockets are not needed as it uses HTTP fetch
      console.warn('WebSocket module not available, using default configuration');
    }
  }
})();

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

// Configure fetch for Vercel serverless environment
if (process.env.VERCEL) {
  console.log('[DB] Configuring for Vercel serverless environment');
  neonConfig.fetchConnectionCache = true;
} else {
  console.log('[DB] Running in non-Vercel environment');
}

// Log connection info (without exposing credentials)
const urlParts = databaseUrl.split('@');
if (urlParts.length > 1) {
  const hostPart = urlParts[urlParts.length - 1];
  console.log(`[DB] Connecting to database at: ${hostPart.split('?')[0]}`);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
