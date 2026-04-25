import { Prisma } from "@prisma/client";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const serialize = <T>(value: T): T => {
  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (value instanceof Prisma.Decimal) {
    return value.toNumber() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serialize(item)) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serialize(item)])
    ) as T;
  }

  return value;
};
