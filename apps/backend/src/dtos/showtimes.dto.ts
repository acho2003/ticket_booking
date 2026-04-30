import { z } from "zod";

const showtimeBody = z.object({
  movieId: z.string().min(1),
  theatreId: z.string().min(1),
  screenId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  regularPrice: z.number().nonnegative(),
  vipPrice: z.number().nonnegative(),
  couplePrice: z.number().nonnegative().optional(),
  status: z.enum(["ACTIVE", "CANCELLED", "COMPLETED"]).optional(),
  confirmTimeChangeWithBookings: z.boolean().optional()
});

export const listShowtimesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    movieId: z.string().optional(),
    theatreId: z.string().optional(),
    date: z.string().optional()
  })
});

export const showtimeIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1)
  })
});

export const movieShowtimesSchema = z.object({
  body: z.object({}),
  query: z.object({
    theatreId: z.string().optional(),
    date: z.string().optional()
  }),
  params: z.object({
    movieId: z.string().min(1)
  })
});

export const createShowtimeSchema = z.object({
  body: showtimeBody,
  query: z.object({}),
  params: z.object({})
});

export const updateShowtimeSchema = z.object({
  body: showtimeBody.partial(),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1)
  })
});
