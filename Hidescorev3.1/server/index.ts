// Load environment variables from .env early
import dotenv from 'dotenv';
dotenv.config();

import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { createApp } from "./app";

(async () => {
  // Seed database with sample data (only for the long-running server)
  await seedDatabase();

  const { app } = await createApp();

  // attach an error handler similar to previous behavior
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // createServer is used inside registerRoutes for the http.Server; we need it here to pass into setupVite
    // re-create a server only for local dev run
    const { createServer } = await import("http");
    const server = createServer(app);
    await setupVite(app, server as any);

    const port = parseInt(process.env.PORT || '5000', 10);
    const listenOptions: any = { port, host: "0.0.0.0" };
    if (process.platform !== "win32") {
      listenOptions.reusePort = true;
    }

    server.listen(listenOptions, () => {
      log(`serving on port ${port}`);
    });
  } else {
    // production: serve the built static files
    serveStatic(app);

    // when running as a standalone server (not serverless) listen on the port
    const port = parseInt(process.env.PORT || '5000', 10);
    app.listen(port, () => {
      log(`serving on port ${port}`);
    });
  }
})();
