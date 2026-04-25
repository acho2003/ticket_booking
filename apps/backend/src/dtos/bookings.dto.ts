import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    showtimeId: z.string().min(1),
    seatIds: z.array(z.string().min(1)).min(1)
  }),
  query: z.object({}),
  params: z.object({})
});

export const bookingIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1)
  })
});

export const adminBookingsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    theatreId: z.string().optional(),
    status: z.enum(["RESERVED", "CONFIRMED", "CANCELLED"]).optional(),
    bookingCode: z.string().optional()
  })
});
