import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type { RequestHandler } from "express";

const require = createRequire(import.meta.url);
const uploadDirectory = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

type MulterModule = {
  diskStorage: (options: {
    destination: (_request: unknown, _file: Express.Multer.File, callback: (error: null, destination: string) => void) => void;
    filename: (_request: unknown, file: Express.Multer.File, callback: (error: null, filename: string) => void) => void;
  }) => unknown;
  (options: { storage: unknown }): {
    single: (fieldName: string) => RequestHandler;
  };
};

let cachedUpload:
  | {
      single: (fieldName: string) => RequestHandler;
    }
  | null
  | undefined;

const createUnavailableHandler = (): RequestHandler => {
  return (_request, response) => {
    response.status(503).json({
      error: {
        message: "File uploads are temporarily unavailable in this environment."
      }
    });
  };
};

const getUpload = () => {
  if (cachedUpload !== undefined) {
    return cachedUpload;
  }

  try {
    const multer = require("multer") as MulterModule;
    const storage = multer.diskStorage({
      destination: (_request, _file, callback) => {
        callback(null, uploadDirectory);
      },
      filename: (_request, file, callback) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
        callback(null, `${timestamp}-${safeName}`);
      }
    });

    cachedUpload = multer({ storage });
    return cachedUpload;
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[uploads] Local upload middleware disabled: ${details}`);
    cachedUpload = null;
    return cachedUpload;
  }
};

export const upload = {
  single(fieldName: string): RequestHandler {
    const uploader = getUpload();
    return uploader ? uploader.single(fieldName) : createUnavailableHandler();
  }
};
