// Minimal serverless entry that reuses the Express app from server/app.ts
// Types for Vercel (optional, will work without them)
type VercelRequest = any;
type VercelResponse = any;

let cachedHandler: any = null;

async function getHandler(): Promise<any> {
  if (cachedHandler) return cachedHandler;

  // Create the express app using the server's createApp helper
  const mod = await import('../server/app');
  const { createApp } = mod;
  const { app } = await createApp();

  // Add error handler for serverless
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ error: message });
  });

  // express apps are callable as (req,res) handlers
  cachedHandler = app as any;
  return cachedHandler;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // prefer the bundled server/app if available (produced by `npm run build`)
  try {
    // runtime require of the built JS; use conditional import so local dev still works
    // Path is relative to project root when running on Vercel after build
    const built = await import('../dist/server/app.js');
    if (built && typeof (built.createApp) === 'function') {
      const { createApp } = built as any;
      const { app } = await createApp();
      
      // Add error handler
      app.use((err: any, _req: any, res: any, _next: any) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ error: message });
      });
      
      return app(req, res);
    }
  } catch (e) {
    // fallback to runtime app (useful for local dev without build)
    console.log('Using runtime app (build not found):', e);
  }

  const h = await getHandler();
  return h(req, res);
}
