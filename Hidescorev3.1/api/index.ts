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
  const h = await getHandler();
  return h(req, res);
}
