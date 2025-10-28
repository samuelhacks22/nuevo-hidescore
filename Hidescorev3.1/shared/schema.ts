import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - integrated with Firebase Authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: varchar("firebase_uid").unique(),
  // Optional password hash for email/password authentication (Neon DB)
  passwordHash: text("password_hash"),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  photoURL: text("photo_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Movies table
export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  posterUrl: text("poster_url"),
  releaseYear: integer("release_year").notNull(),
  genre: text("genre").array().notNull().default(sql`ARRAY[]::text[]`),
  platform: text("platform").array().notNull().default(sql`ARRAY[]::text[]`),
  director: text("director"),
  cast: text("cast").array().notNull().default(sql`ARRAY[]::text[]`),
  runtime: integer("runtime"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  revenue: decimal("revenue", { precision: 15, scale: 2 }),
  language: text("language"),
  country: text("country"),
  averageRating: real("average_rating").default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Series table
export const series = pgTable("series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  posterUrl: text("poster_url"),
  releaseYear: integer("release_year").notNull(),
  endYear: integer("end_year"),
  genre: text("genre").array().notNull().default(sql`ARRAY[]::text[]`),
  platform: text("platform").array().notNull().default(sql`ARRAY[]::text[]`),
  creator: text("creator"),
  cast: text("cast").array().notNull().default(sql`ARRAY[]::text[]`),
  seasons: integer("seasons").notNull().default(1),
  episodes: integer("episodes").notNull().default(1),
  language: text("language"),
  country: text("country"),
  averageRating: real("average_rating").default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ratings table (for both movies and series)
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: varchar("movie_id").references(() => movies.id, { onDelete: "cascade" }),
  seriesId: varchar("series_id").references(() => series.id, { onDelete: "cascade" }),
  rating: real("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Ensure either movieId or seriesId is set, but not both
  checkRatingTarget: sql`CHECK ((${table.movieId} IS NOT NULL AND ${table.seriesId} IS NULL) OR (${table.movieId} IS NULL AND ${table.seriesId} IS NOT NULL))`,
}));

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  movieId: varchar("movie_id").references(() => movies.id, { onDelete: "cascade" }),
  seriesId: varchar("series_id").references(() => series.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Ensure either movieId or seriesId is set, but not both
  checkCommentTarget: sql`CHECK ((${table.movieId} IS NOT NULL AND ${table.seriesId} IS NULL) OR (${table.movieId} IS NULL AND ${table.seriesId} IS NOT NULL))`,
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
  comments: many(comments),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  ratings: many(ratings),
  comments: many(comments),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  ratings: many(ratings),
  comments: many(comments),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [ratings.movieId],
    references: [movies.id],
  }),
  series: one(series, {
    fields: [ratings.seriesId],
    references: [series.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [comments.movieId],
    references: [movies.id],
  }),
  series: one(series, {
    fields: [comments.seriesId],
    references: [series.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  averageRating: true,
  ratingCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSeriesSchema = createInsertSchema(series).omit({
  id: true,
  averageRating: true,
  ratingCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rating: z.number().min(0).max(5),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;

export type Series = typeof series.$inferSelect;
export type InsertSeries = z.infer<typeof insertSeriesSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Helper types for combined content
export type Content = (Movie | Series) & { type: 'movie' | 'series' };
