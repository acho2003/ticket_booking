const isDevelopment = process.env.NODE_ENV !== "production";

type PrismaLikeError = {
  code?: string;
  message?: string;
  meta?: unknown;
  name?: string;
};

const toPrismaLikeError = (error: unknown): PrismaLikeError | null => {
  if (!error || typeof error !== "object") {
    return null;
  }

  return error as PrismaLikeError;
};

const getMessage = (error: PrismaLikeError) => error.message ?? "";

export const getDatabaseErrorResponse = (error: unknown) => {
  const prismaError = toPrismaLikeError(error);

  if (!prismaError) {
    return null;
  }

  const message = getMessage(prismaError);

  if (prismaError.code === "P1001" || message.includes("Can't reach database server")) {
    console.error(error);

    return {
      statusCode: 503,
      body: {
        message:
          "Database connection failed. Check DATABASE_URL, Supabase project status, and your network connection.",
        code: "DATABASE_UNREACHABLE",
        details: isDevelopment ? message : undefined
      }
    };
  }

  if (prismaError.code === "P2022") {
    console.error(error);

    return {
      statusCode: 500,
      body: {
        message:
          "Database schema is out of date. Apply the latest Prisma migrations to your database.",
        code: "DATABASE_SCHEMA_OUT_OF_DATE",
        details: isDevelopment ? prismaError.meta ?? message : undefined
      }
    };
  }

  if (prismaError.code?.startsWith("P10")) {
    console.error(error);

    return {
      statusCode: 503,
      body: {
        message: "Database connection failed. Check your database URL and credentials.",
        code: prismaError.code,
        details: isDevelopment ? message : undefined
      }
    };
  }

  return null;
};
