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

// Log environment info for debugging
console.log('[DB] Environment check:');
console.log('[DB] - VERCEL:', process.env.VERCEL || 'not set');
console.log('[DB] - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('[DB] - DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[DB] - DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
console.log('[DB] - DATABASE_URL preview:', process.env.DATABASE_URL ? 
  `${process.env.DATABASE_URL.substring(0, 20)}...` : 'not set');

if (!process.env.DATABASE_URL) {
  console.error('[DB] ❌ DATABASE_URL environment variable is not set!');
  console.error('[DB] This means the variable was not configured in Vercel or not redeployed after adding it.');
  throw new Error(
    "DATABASE_URL must be set. Please configure it in Vercel Settings → Environment Variables and redeploy.",
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
  console.log(`[DB] ✅ Connecting to database at: ${hostPart.split('?')[0]}`);
  console.log(`[DB] ✅ Database URL is valid (${databaseUrl.length} characters)`);
} else {
  console.warn('[DB] ⚠️ Database URL format might be incorrect');
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });

// Test connection in Vercel environment (async, non-blocking)
if (process.env.VERCEL) {
  (async () => {
    try {
      console.log('[DB] Testing database connection...');
      const testResult = await pool.query('SELECT NOW() as current_time');
      console.log('[DB] ✅ Database connection successful!', testResult.rows[0]);
    } catch (error: any) {
      console.error('[DB] ❌ Database connection failed:', {
        message: error?.message,
        code: error?.code,
        name: error?.name
      });
      // Don't throw here, let it fail when actually querying
    }
  })();
}
