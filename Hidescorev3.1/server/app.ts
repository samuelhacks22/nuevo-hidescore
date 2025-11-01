import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";

export async function createApp(): Promise<{ app: Express }> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // simple request logger for /api routes
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    // @ts-ignore
    res.json = function (bodyJson: any, ...args: any[]) {
      capturedJsonResponse = bodyJson;
      // @ts-ignore
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          try {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          } catch (e) {
            // ignore
          }
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // register all routes (this returns an http.Server in the existing code, but
  // we ignore it here because serverless runtimes don't call listen())
  await registerRoutes(app as any);

  // error handler left to the consumer (server/index.ts attaches one for dev/production)

  return { app };
}
