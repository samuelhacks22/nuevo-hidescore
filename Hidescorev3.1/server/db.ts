// Database connection setup - based on javascript_database blueprint
// @ts-ignore: missing type declarations for '@neondatabase/serverless'
import { Pool, neonConfig } from '@neondatabase/serverless';
// @ts-ignore: missing type declarations for 'drizzle-orm/neon-serverless'
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
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

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
