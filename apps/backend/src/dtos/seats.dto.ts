import { z } from "zod";

export const publicScreenSeatsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    screenId: z.string().min(1)
  })
});

export const updateSeatSchema = z.object({
  body: z.object({
    seatType: z.enum(["REGULAR", "VIP", "COUPLE", "BLOCKED"]).optional(),
    isBlocked: z.boolean().optional()
  }),
  query: z.object({}),
  params: z.object({
    seatId: z.string().min(1)
  })
});
