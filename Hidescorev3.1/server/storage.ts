import { 
  users, movies, series, ratings, comments,
  type User, type InsertUser,
  type Movie, type InsertMovie,
  type Series, type InsertSeries,
  type Rating, type InsertRating,
  type Comment, type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, gte, lte, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Movies
  getMovie(id: string): Promise<Movie | undefined>;
  getAllMovies(filters?: MovieFilters): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: string, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: string): Promise<void>;

  // Series
  getSeries(id: string): Promise<Series | undefined>;
  getAllSeries(filters?: SeriesFilters): Promise<Series[]>;
  createSeries(series: InsertSeries): Promise<Series>;
  updateSeries(id: string, series: Partial<InsertSeries>): Promise<Series | undefined>;
  deleteSeries(id: string): Promise<void>;

  // Ratings
  getRating(id: string): Promise<Rating | undefined>;
  getRatingsByContent(movieId?: string, seriesId?: string): Promise<Rating[]>;
  getRatingsByUser(userId: string): Promise<Rating[]>;
  getUserRatingForContent(userId: string, movieId?: string, seriesId?: string): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: string, rating: Partial<InsertRating>): Promise<Rating | undefined>;
  deleteRating(id: string): Promise<void>;

  // Comments
  getComment(id: string): Promise<Comment | undefined>;
  getCommentsByContent(movieId?: string, seriesId?: string): Promise<Comment[]>;
  getCommentsByUser(userId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
}

export interface MovieFilters {
  genre?: string;
  platform?: string;
  yearFrom?: number;
  yearTo?: number;
  ratingFrom?: number;
  ratingTo?: number;
  sortBy?: string;
}

export interface SeriesFilters {
  genre?: string;
  platform?: string;
  yearFrom?: number;
  yearTo?: number;
  ratingFrom?: number;
  ratingTo?: number;
  sortBy?: string;
}

export class DatabaseStorage implements IStorage {
  // Users
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Movies
  async getMovie(id: string): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie || undefined;
  }

  async getAllMovies(filters?: MovieFilters): Promise<Movie[]> {
    let query = db.select().from(movies);
    const conditions: any[] = [];

    if (filters) {
      if (filters.genre && filters.genre !== 'all') {
        conditions.push(sql`${movies.genre} && ARRAY[${filters.genre}]::text[]`);
      }
      if (filters.platform && filters.platform !== 'all') {
        conditions.push(sql`${movies.platform} && ARRAY[${filters.platform}]::text[]`);
      }
      if (filters.yearFrom) {
        conditions.push(gte(movies.releaseYear, filters.yearFrom));
      }
      if (filters.yearTo) {
        conditions.push(lte(movies.releaseYear, filters.yearTo));
      }
      if (filters.ratingFrom) {
        conditions.push(gte(movies.averageRating, filters.ratingFrom));
      }
      if (filters.ratingTo) {
        conditions.push(lte(movies.averageRating, filters.ratingTo));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          query = query.orderBy(desc(movies.averageRating)) as any;
          break;
        case 'year-desc':
          query = query.orderBy(desc(movies.releaseYear)) as any;
          break;
        case 'year-asc':
          query = query.orderBy(asc(movies.releaseYear)) as any;
          break;
        case 'recent':
          query = query.orderBy(desc(movies.createdAt)) as any;
          break;
        default:
          query = query.orderBy(desc(movies.ratingCount)) as any;
      }
    } else {
      query = query.orderBy(desc(movies.ratingCount)) as any;
    }

    return await query;
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const [movie] = await db.insert(movies).values(insertMovie).returning();
    return movie;
  }

  async updateMovie(id: string, updateData: Partial<InsertMovie>): Promise<Movie | undefined> {
    const [movie] = await db
      .update(movies)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(movies.id, id))
      .returning();
    return movie || undefined;
  }

  async deleteMovie(id: string): Promise<void> {
    await db.delete(movies).where(eq(movies.id, id));
  }

  // Series
  async getSeries(id: string): Promise<Series | undefined> {
    const [s] = await db.select().from(series).where(eq(series.id, id));
    return s || undefined;
  }

  async getAllSeries(filters?: SeriesFilters): Promise<Series[]> {
    let query = db.select().from(series);
    const conditions: any[] = [];

    if (filters) {
      if (filters.genre && filters.genre !== 'all') {
        conditions.push(sql`${series.genre} && ARRAY[${filters.genre}]::text[]`);
      }
      if (filters.platform && filters.platform !== 'all') {
        conditions.push(sql`${series.platform} && ARRAY[${filters.platform}]::text[]`);
      }
      if (filters.yearFrom) {
        conditions.push(gte(series.releaseYear, filters.yearFrom));
      }
      if (filters.yearTo) {
        conditions.push(lte(series.releaseYear, filters.yearTo));
      }
      if (filters.ratingFrom) {
        conditions.push(gte(series.averageRating, filters.ratingFrom));
      }
      if (filters.ratingTo) {
        conditions.push(lte(series.averageRating, filters.ratingTo));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          query = query.orderBy(desc(series.averageRating)) as any;
          break;
        case 'year-desc':
          query = query.orderBy(desc(series.releaseYear)) as any;
          break;
        case 'year-asc':
          query = query.orderBy(asc(series.releaseYear)) as any;
          break;
        case 'recent':
          query = query.orderBy(desc(series.createdAt)) as any;
          break;
        default:
          query = query.orderBy(desc(series.ratingCount)) as any;
      }
    } else {
      query = query.orderBy(desc(series.ratingCount)) as any;
    }

    return await query;
  }

  async createSeries(insertSeries: InsertSeries): Promise<Series> {
    const [s] = await db.insert(series).values(insertSeries).returning();
    return s;
  }

  async updateSeries(id: string, updateData: Partial<InsertSeries>): Promise<Series | undefined> {
    const [s] = await db
      .update(series)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(series.id, id))
      .returning();
    return s || undefined;
  }

  async deleteSeries(id: string): Promise<void> {
    await db.delete(series).where(eq(series.id, id));
  }

  // Ratings
  async getRating(id: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating || undefined;
  }

  async getRatingsByContent(movieId?: string, seriesId?: string): Promise<Rating[]> {
    if (movieId) {
      return await db.select().from(ratings).where(eq(ratings.movieId, movieId));
    } else if (seriesId) {
      return await db.select().from(ratings).where(eq(ratings.seriesId, seriesId));
    }
    return [];
  }

  async getRatingsByUser(userId: string): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.userId, userId));
  }

  async getUserRatingForContent(userId: string, movieId?: string, seriesId?: string): Promise<Rating | undefined> {
  let query: any = db.select().from(ratings).where(eq(ratings.userId, userId));
    
    if (movieId) {
      query = query.where(eq(ratings.movieId, movieId)) as any;
    } else if (seriesId) {
      query = query.where(eq(ratings.seriesId, seriesId)) as any;
    }

    const [rating] = await query;
    return rating || undefined;
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(insertRating).returning();
    
    // Update average rating and count for the content
    if (insertRating.movieId) {
      await this.updateMovieRatings(insertRating.movieId);
    } else if (insertRating.seriesId) {
      await this.updateSeriesRatings(insertRating.seriesId);
    }
    
    return rating;
  }

  async updateRating(id: string, updateData: Partial<InsertRating>): Promise<Rating | undefined> {
    const [rating] = await db
      .update(ratings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(ratings.id, id))
      .returning();
    
    if (rating) {
      if (rating.movieId) {
        await this.updateMovieRatings(rating.movieId);
      } else if (rating.seriesId) {
        await this.updateSeriesRatings(rating.seriesId);
      }
    }
    
    return rating || undefined;
  }

  async deleteRating(id: string): Promise<void> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    await db.delete(ratings).where(eq(ratings.id, id));
    
    if (rating) {
      if (rating.movieId) {
        await this.updateMovieRatings(rating.movieId);
      } else if (rating.seriesId) {
        await this.updateSeriesRatings(rating.seriesId);
      }
    }
  }

  private async updateMovieRatings(movieId: string): Promise<void> {
    const movieRatings = await db.select().from(ratings).where(eq(ratings.movieId, movieId));
    const avgRating = movieRatings.length > 0
      ? movieRatings.reduce((sum, r) => sum + r.rating, 0) / movieRatings.length
      : 0;
    
    await db
      .update(movies)
      .set({
        averageRating: avgRating,
        ratingCount: movieRatings.length,
        updatedAt: new Date(),
      })
      .where(eq(movies.id, movieId));
  }

  private async updateSeriesRatings(seriesId: string): Promise<void> {
    const seriesRatings = await db.select().from(ratings).where(eq(ratings.seriesId, seriesId));
    const avgRating = seriesRatings.length > 0
      ? seriesRatings.reduce((sum, r) => sum + r.rating, 0) / seriesRatings.length
      : 0;
    
    await db
      .update(series)
      .set({
        averageRating: avgRating,
        ratingCount: seriesRatings.length,
        updatedAt: new Date(),
      })
      .where(eq(series.id, seriesId));
  }

  // Comments
  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  async getCommentsByContent(movieId?: string, seriesId?: string): Promise<Comment[]> {
    if (movieId) {
      return await db.select().from(comments).where(eq(comments.movieId, movieId)).orderBy(desc(comments.createdAt));
    } else if (seriesId) {
      return await db.select().from(comments).where(eq(comments.seriesId, seriesId)).orderBy(desc(comments.createdAt));
    }
    return [];
  }

  async getCommentsByUser(userId: string): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.userId, userId)).orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }
}

export const storage = new DatabaseStorage();
