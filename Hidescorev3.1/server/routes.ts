import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMovieSchema, insertSeriesSchema, insertRatingSchema, insertCommentSchema } from "@shared/schema";
// Try to dynamically load Google Generative AI; if not available, use a safe stub.
let generativeModel: any = null;
(async () => {
  try {
    // Suppress TypeScript error if the optional package or its types are missing,
    // and attempt a runtime import that may fail in environments without the package.
    // @ts-ignore -- optional dependency
    const mod = await import("@google/generative-ai");
    const GoogleGenerativeAI = mod?.GoogleGenerativeAI;
    if (GoogleGenerativeAI) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      generativeModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    } else {
      // Fallback stub if the module did not expose the expected export
      generativeModel = {
        generate: async () => ({ candidates: [] }),
      };
    }
  } catch (err) {
    // Fallback stub: generate() returns an empty response — safe for development without the package/key
    generativeModel = {
      generate: async () => ({ candidates: [] }),
    };
  }
})();


export async function registerRoutes(app: Express): Promise<Server> {
  // Helper to require admin by checking a provided user id (no real auth)
  // The client should send the acting user's id in the `x-user-id` header or `userId` query/body field.
  async function requireAdmin(req: any, res: any) {
    const userId = (req.header?.('x-user-id') || req.query?.userId || req.body?.userId) as string | undefined;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required (provide x-user-id header or userId param)' });
      return null;
    }
    try {
      const user = await storage.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return null;
      }
      const rank = String(user.rank || '').toLowerCase();
      if (rank !== 'admin') {
        res.status(403).json({ error: 'Forbidden: admin required' });
        return null;
      }
      return user;
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Server error' });
      return null;
    }
  }
  
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
      }

      const user = await storage.getUserByEmail(email.trim());
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Movies endpoints
  app.get("/api/movies", async (req, res) => {
    try {
      const filters = {
        genre: req.query.genre as string,
        platform: req.query.platform as string,
        yearFrom: req.query.yearFrom ? parseInt(req.query.yearFrom as string) : undefined,
        yearTo: req.query.yearTo ? parseInt(req.query.yearTo as string) : undefined,
        ratingFrom: req.query.ratingFrom ? parseFloat(req.query.ratingFrom as string) : undefined,
        ratingTo: req.query.ratingTo ? parseFloat(req.query.ratingTo as string) : undefined,
        sortBy: req.query.sortBy as string,
      };

      const movies = await storage.getAllMovies(filters);
      res.json(movies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/movies/trending", async (req, res) => {
    try {
      const movies = await storage.getAllMovies({ sortBy: 'popularity' });
      res.json(movies.slice(0, 12));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.getMovie(req.params.id);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.json(movie);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/movies/:id/ratings", async (req, res) => {
    try {
      const ratings = await storage.getRatingsByContent(req.params.id);
      res.json(ratings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/movies/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByContent(req.params.id);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/movies/:id/similar", async (req, res) => {
    try {
      const movie = await storage.getMovie(req.params.id);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      // Find similar movies based on genre
      const allMovies = await storage.getAllMovies();
      const similar = allMovies
        .filter(m => 
          m.id !== movie.id && 
          m.genre.some(g => movie.genre.includes(g))
        )
        .slice(0, 4);

      res.json(similar);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Series endpoints
  app.get("/api/series", async (req, res) => {
    try {
      const filters = {
        genre: req.query.genre as string,
        platform: req.query.platform as string,
        yearFrom: req.query.yearFrom ? parseInt(req.query.yearFrom as string) : undefined,
        yearTo: req.query.yearTo ? parseInt(req.query.yearTo as string) : undefined,
        ratingFrom: req.query.ratingFrom ? parseFloat(req.query.ratingFrom as string) : undefined,
        ratingTo: req.query.ratingTo ? parseFloat(req.query.ratingTo as string) : undefined,
        sortBy: req.query.sortBy as string,
      };

      const series = await storage.getAllSeries(filters);
      res.json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/series/trending", async (req, res) => {
    try {
      const series = await storage.getAllSeries({ sortBy: 'popularity' });
      res.json(series.slice(0, 12));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/series/:id", async (req, res) => {
    try {
      const series = await storage.getSeries(req.params.id);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/series/:id/ratings", async (req, res) => {
    try {
      const ratings = await storage.getRatingsByContent(undefined, req.params.id);
      res.json(ratings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/series/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByContent(undefined, req.params.id);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/series/:id/similar", async (req, res) => {
    try {
      const series = await storage.getSeries(req.params.id);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }

      const allSeries = await storage.getAllSeries();
      const similar = allSeries
        .filter(s => 
          s.id !== series.id && 
          s.genre.some(g => series.genre.includes(g))
        )
        .slice(0, 4);

      res.json(similar);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Ratings endpoints
  app.post("/api/ratings", async (req, res) => {
    try {
      const validated = insertRatingSchema.parse(req.body);
      const rating = await storage.createRating(validated);
      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Comments endpoints
  app.post("/api/comments", async (req, res) => {
    try {
      const validated = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validated);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Recommendations endpoint (AI-powered, stub for now)
  app.get("/api/recommendations", async (req, res) => {
    try {
      // If Gemini is configured and user has ratings, generate personalized recommendations
      // For now, return trending content as a fallback
      const movies = await storage.getAllMovies({ sortBy: 'rating' });
      const series = await storage.getAllSeries({ sortBy: 'rating' });
      
      const combined = [
        ...movies.slice(0, 4).map(m => ({ ...m, type: 'movie' as const })),
        ...series.slice(0, 4).map(s => ({ ...s, type: 'series' as const })),
      ];

      
      res.json(combined);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", async (req, res) => {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;
    try {
      const movies = await storage.getAllMovies();
      const series = await storage.getAllSeries();
      const users = await storage.getAllUsers();
      
      // Count all ratings
      let totalRatings = 0;
      for (const movie of movies) {
        totalRatings += movie.ratingCount;
      }
      for (const s of series) {
        totalRatings += s.ratingCount;
      }

      res.json({
        totalMovies: movies.length,
        totalSeries: series.length,
        totalUsers: users.length,
        totalRatings,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/movies", async (req, res) => {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/movies", async (req, res) => {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;
    try {
      const validated = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validated);
      res.json(movie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/movies/:id", async (req, res) => {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;
    try {
      await storage.deleteMovie(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/series", async (req, res) => {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;
    try {
      const series = await storage.getAllSeries();
      res.json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/series", async (req, res) => {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;
    try {
      const validated = insertSeriesSchema.parse(req.body);
      const series = await storage.createSeries(validated);
      res.json(series);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/series/:id", async (req, res) => {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;
    try {
      await storage.deleteSeries(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;
    try {
      const users = await storage.getAllUsers();
      const mapped = users.map(u => ({
        ...u,
        isAdmin: String(u.rank || '').toLowerCase() === 'admin' || String(u.rank) === '1'
      }));
      res.json(mapped);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
