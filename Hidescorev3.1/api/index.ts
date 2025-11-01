// Minimal serverless entry that reuses the Express app from server/app.ts
let cachedHandler: any = null;

async function getHandler(): Promise<any> {
  if (cachedHandler) return cachedHandler;

  // Create the express app using the server's createApp helper
  const mod = await import('../server/app');
  const { createApp } = mod;
  const { app } = await createApp();

  // express apps are callable as (req,res) handlers
  cachedHandler = app as any;
  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  // prefer the bundled server/app if available (produced by `npm run build`)
  try {
    // runtime require of the built JS; use conditional import so local dev still works
    // Path is relative to project root when running on Vercel after build
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const built = await import('../dist/server/app.js');
    if (built && built.createApp) {
      const { createApp } = built as any;
      const { app } = await createApp();
      return app(req, res);
    }
  } catch (e) {
    // fallback to runtime app (useful for local dev without build)
  }

  const h = await getHandler();
  return h(req, res);
}
