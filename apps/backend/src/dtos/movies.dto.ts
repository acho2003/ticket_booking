import { z } from "zod";

const posterUrlSchema = z.string().refine((value) => {
  if (!value) {
    return false;
  }

  if (value.startsWith("/uploads/")) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, "Poster URL must be a valid URL or uploaded image path");

const movieBody = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  genre: z.string().min(1),
  language: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  rating: z.string().min(1),
  posterUrl: posterUrlSchema,
  trailerUrl: z.string().url().optional().or(z.literal("")).transform((value) => value || undefined),
  regularPrice: z.number().nonnegative(),
  vipPrice: z.number().nonnegative(),
  couplePrice: z.number().nonnegative().optional(),
  releaseDate: z.string().datetime(),
  status: z.enum(["NOW_SHOWING", "UPCOMING", "ENDED"])
});

export const listMoviesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    status: z.enum(["NOW_SHOWING", "UPCOMING", "ENDED"]).optional(),
    search: z.string().optional()
  })
});

export const movieIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1)
  })
});

export const createMovieSchema = z.object({
  body: movieBody,
  params: z.object({}),
  query: z.object({})
});

export const updateMovieSchema = z.object({
  body: movieBody.partial(),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({})
});
