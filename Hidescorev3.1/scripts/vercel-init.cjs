#!/usr/bin/env node
// Build-time helper for Vercel: run migrations (drizzle-kit) and seed DB if DATABASE_URL is set.
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(...args) { console.log('[vercel-init]', ...args); }

const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!databaseUrl) {
  log('DATABASE_URL not set — skipping migrations and seed.');
  process.exit(0);
}

// Skip migrations - tables are already created in the database
// The drizzle-kit version (0.18.1) doesn't support the 'push' command
// Tables should be created manually or via SQL scripts before deployment
log('DATABASE_URL detected — skipping migrations (tables should exist in database)');

// attempt to run compiled seed script if present
const seedPath = path.resolve(__dirname, '..', 'dist', 'server', 'seed.js');
if (fs.existsSync(seedPath)) {
  log('Found seed script at', seedPath, '- executing');
  const r = spawnSync('node', [seedPath], { stdio: 'inherit', env: process.env });
  if (r.error) {
    console.error('[vercel-init] Error executing seed script:', r.error);
    process.exit(1);
  }
  if (r.status !== 0) {
    console.error('[vercel-init] Seed script exited with code', r.status);
    process.exit(r.status || 1);
  }
  log('Seed script executed successfully');
} else {
  log('No compiled seed found at', seedPath, '- skipping seed.');
}

log('vercel-init completed successfully');
