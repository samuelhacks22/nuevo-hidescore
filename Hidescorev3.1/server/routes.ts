import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMovieSchema, insertSeriesSchema, insertRatingSchema, insertCommentSchema } from "@shared/schema";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
  
  // Authentication - Firebase sync endpoint
  app.post("/api/auth/sync", async (req, res) => {
    try {
      const { firebaseUid, email, displayName, photoURL } = req.body;
      
      if (!firebaseUid || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user exists
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          firebaseUid,
          email,
          displayName: displayName || email.split('@')[0],
          photoURL: photoURL || null,
          isAdmin: false,
        });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Auth sync error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Register with email/password (Neon DB)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await storage.createUser({
        firebaseUid: null as any,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
        isAdmin: false,
        passwordHash,
      } as any);

      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

      res.json({ user: newUser, token });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Login with email/password (Neon DB)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !('passwordHash' in user) || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.passwordHash as string);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

      res.json({ user, token });
    } catch (error: any) {
      console.error('Login error:', error);
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
  app.get("/api/ratings/user", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.json([]);
      }
      
      const ratings = await storage.getRatingsByUser(userId);
      
      // Include content details
      const ratingsWithContent = await Promise.all(
        ratings.map(async (r) => {
          if (r.movieId) {
            const movie = await storage.getMovie(r.movieId);
            return { ...r, movie };
          } else if (r.seriesId) {
            const series = await storage.getSeries(r.seriesId);
            return { ...r, series };
          }
          return r;
        })
      );
      
      res.json(ratingsWithContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ratings", async (req, res) => {
    try {
      const validated = insertRatingSchema.parse(req.body);
      
      if (!validated.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const rating = await storage.createRating(validated);
      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Comments endpoints
  app.get("/api/comments/user", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.json([]);
      }

      const comments = await storage.getCommentsByUser(userId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validated = insertCommentSchema.parse(req.body);
      
      if (!validated.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

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

      // If Gemini is available and we have user context, we could generate better recommendations
      // TODO: Implement AI-powered recommendations when GEMINI_API_KEY is set
      
      res.json(combined);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", async (req, res) => {
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
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/movies", async (req, res) => {
    try {
      const validated = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(validated);
      res.json(movie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/movies/:id", async (req, res) => {
    try {
      await storage.deleteMovie(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/series", async (req, res) => {
    try {
      const series = await storage.getAllSeries();
      res.json(series);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/series", async (req, res) => {
    try {
      const validated = insertSeriesSchema.parse(req.body);
      const series = await storage.createSeries(validated);
      res.json(series);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/series/:id", async (req, res) => {
    try {
      await storage.deleteSeries(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
