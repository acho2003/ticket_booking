import { z } from "zod";

export const theatreScreenParamsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    theatreId: z.string().min(1)
  })
});

export const createScreenSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    totalRows: z.number().int().positive(),
    totalColumns: z.number().int().positive()
  }),
  query: z.object({}),
  params: z.object({
    theatreId: z.string().min(1)
  })
});

export const updateScreenSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    totalRows: z.number().int().positive().optional(),
    totalColumns: z.number().int().positive().optional()
  }),
  query: z.object({}),
  params: z.object({
    screenId: z.string().min(1)
  })
});

export const screenIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    screenId: z.string().min(1)
  })
});

export const generateSeatsSchema = z.object({
  body: z.object({
    totalRows: z.number().int().positive(),
    totalColumns: z.number().int().positive(),
    seatTypeMap: z
      .array(
        z.object({
          rowLabel: z.string().min(1),
          seatNumber: z.number().int().positive(),
          seatType: z.enum(["REGULAR", "VIP", "COUPLE", "BLOCKED"]),
          isBlocked: z.boolean().optional()
        })
      )
      .optional()
  }),
  query: z.object({}),
  params: z.object({
    screenId: z.string().min(1)
  })
});
