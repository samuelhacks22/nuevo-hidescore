// Minimal serverless entry that reuses the Express app from server/app.ts
// Types for Vercel (optional, will work without them)
type VercelRequest = any;
type VercelResponse = any;

let cachedHandler: any = null;

async function getHandler(): Promise<any> {
  if (cachedHandler) return cachedHandler;

  try {
    // Create the express app using the server's createApp helper
    const mod = await import('../server/app');
    const { createApp } = mod;
    const { app } = await createApp();

    // Add error handler for serverless
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Server error:', err);
      res.status(status).json({ error: message });
    });

    // express apps are callable as (req,res) handlers
    cachedHandler = app as any;
    return cachedHandler;
  } catch (error: any) {
    console.error('Error creating handler:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // prefer the bundled server/app if available (produced by `npm run build`)
    try {
      // @ts-ignore: dist/server/app.js is a compiled JS file without type definitions
      const built = await import('../dist/server/app.js');
      if (built && typeof (built.createApp) === 'function') {
        const { createApp } = built as any;
        const { app } = await createApp();
        
        // Add error handler
        app.use((err: any, _req: any, res: any, _next: any) => {
          const status = err.status || err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          console.error('Server error:', err);
          res.status(status).json({ error: message });
        });
        
        return app(req, res);
      }
    } catch (e) {
      // fallback to runtime app (useful for local dev without build)
      console.log('Build not found, using runtime app:', e);
    }

    const h = await getHandler();
    return h(req, res);
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error',
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
    });
  }
}
