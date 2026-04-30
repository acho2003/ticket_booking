import { z } from "zod";

const seatOverrideSchema = z.object({
  seatNumber: z.number().int().positive(),
  seatType: z.enum(["REGULAR", "VIP", "COUPLE", "BLOCKED"]),
  isBlocked: z.boolean().optional()
});

const layoutRowSchema = z.object({
  rowLabel: z.string().min(1),
  seatCount: z.number().int().positive(),
  leftOffset: z.number().int().min(0).optional(),
  rightOffset: z.number().int().min(0).optional(),
  aisleAfter: z.array(z.number().int().positive()).optional(),
  defaultSeatType: z.enum(["REGULAR", "VIP", "COUPLE", "BLOCKED"]).optional(),
  overrides: z.array(seatOverrideSchema).optional()
});

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
  body: z.union([
    z.object({
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
    z.object({
      totalRows: z.number().int().positive().optional(),
      totalColumns: z.number().int().positive().optional(),
      seatTypeMap: z
        .array(
          z.object({
            rowLabel: z.string().min(1),
            seatNumber: z.number().int().positive(),
            seatType: z.enum(["REGULAR", "VIP", "COUPLE", "BLOCKED"]),
            isBlocked: z.boolean().optional()
          })
        )
        .optional(),
      layout: z.object({
        rows: z.array(layoutRowSchema).min(1)
      })
    })
  ]),
  query: z.object({}),
  params: z.object({
    screenId: z.string().min(1)
  })
});
