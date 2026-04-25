import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6).optional(),
    password: z.string().min(6)
  }),
  query: z.object({}),
  params: z.object({})
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),
  query: z.object({}),
  params: z.object({})
});
