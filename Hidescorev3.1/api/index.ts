// Minimal serverless entry that reuses the Express app from server/app.ts
// Types for Vercel (optional, will work without them)
type VercelRequest = any;
type VercelResponse = any;

let cachedHandler: any = null;

async function getHandler(): Promise<any> {
  if (cachedHandler) return cachedHandler;

  try {
    console.log('[API] Initializing handler...');
    console.log('[API] DATABASE_URL available:', !!process.env.DATABASE_URL);
    console.log('[API] VERCEL environment:', !!process.env.VERCEL);
    
    // Create the express app using the server's createApp helper
    const mod = await import('../server/app');
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
        
        return app(req, res);
      }
    } catch (e: any) {
      // fallback to runtime app (useful for local dev without build)
      console.log('[API] Build not found, using runtime app:', e?.message || e);
    }

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
