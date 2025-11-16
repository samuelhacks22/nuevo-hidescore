// Minimal serverless entry that reuses the Express app from server/app.ts
// Types for Vercel (optional, will work without them)
type VercelRequest = any;
type VercelResponse = any;

let cachedHandler: any = null;

async function getHandler(): Promise<any> {
  if (cachedHandler) return cachedHandler;

  try {
    console.log('[API] Initializing handler...');
    console.log('[API] Environment check:');
    console.log('[API] - DATABASE_URL available:', !!process.env.DATABASE_URL);
    console.log('[API] - DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    console.log('[API] - VERCEL environment:', !!process.env.VERCEL);
    console.log('[API] - NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('[API] - All env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('VERCEL')));
    
    // In Vercel, we need to use the compiled version from dist
    // Try to import from dist first (production), fallback to server (dev)
    // Note: In ES modules, we must use .js extension even when importing TypeScript files
    let mod: any;
    try {
      // @ts-ignore: dist/server/app.js is a compiled JS file without type definitions
      mod = await import('../dist/server/app.js');
      console.log('[API] Using compiled app from dist/server/app.js');
    } catch (e) {
      // Fallback to server source - Vercel will compile TypeScript automatically
      // Must use .js extension for ES modules even though file is .ts
      console.log('[API] Dist not found, trying server source...');
      // @ts-ignore: Vercel compiles TypeScript, but we use .js extension for ES modules
      mod = await import('../server/app.js');
    }
    
    const { createApp } = mod;
    const { app } = await createApp();

    // Add error handler for serverless
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('[API] Server error:', {
        status,
        message,
        stack: err.stack,
        name: err.name
      });
      res.status(status).json({ error: message });
    });

    // express apps are callable as (req,res) handlers
    cachedHandler = app as any;
    console.log('[API] Handler initialized successfully');
    return cachedHandler;
  } catch (error: any) {
    console.error('[API] Error creating handler:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    });
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[API] ${req.method} ${req.url}`);

    // If DATABASE_URL is not configured, avoid importing the compiled app
    // which will throw on import. Return a clear 503 to help debugging.
    if (!process.env.DATABASE_URL) {
      console.error('[API] DATABASE_URL is not configured — returning 503');
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'DATABASE_URL is not configured on the server. Configure DATABASE_URL in your environment variables and redeploy.'
      });
      return;
    }

    // Always use the cached handler if available
    if (cachedHandler) {
      return cachedHandler(req, res);
    }

    // prefer the bundled server/app if available (produced by `npm run build`)
    try {
      // @ts-ignore: dist/server/app.js is a compiled JS file without type definitions
      const built = await import('../dist/server/app.js');
      if (built && typeof (built.createApp) === 'function') {
        console.log('[API] Using built app from dist/server/app.js');
        const { createApp } = built as any;
        const { app } = await createApp();

        // Add error handler
        app.use((err: any, _req: any, res: any, _next: any) => {
          const status = err.status || err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          console.error('[API] Server error:', {
            status,
            message,
            stack: err.stack,
            name: err.name
          });
          res.status(status).json({ error: message });
        });

        // Cache the handler
        cachedHandler = app as any;
        return app(req, res);
      }
    } catch (e: any) {
      // fallback to runtime app (useful for local dev without build)
      console.log('[API] Build not found, using runtime app:', e?.message || e);
    }

    // Use getHandler as fallback
    const h = await getHandler();
    return h(req, res);
  } catch (error: any) {
    console.error('[API] Handler error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    });
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error',
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
    });
  }
}
