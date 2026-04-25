import { z } from "zod";

const theatreBody = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  location: z.string().min(1),
  description: z.string().optional(),
  contactNumber: z.string().min(6)
});

export const listTheatresSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    city: z.string().optional(),
    search: z.string().optional()
  })
});

export const theatreIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().min(1)
  })
});

export const createTheatreSchema = z.object({
  body: theatreBody,
  params: z.object({}),
  query: z.object({})
});

export const updateTheatreSchema = z.object({
  body: theatreBody.partial(),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({})
});
