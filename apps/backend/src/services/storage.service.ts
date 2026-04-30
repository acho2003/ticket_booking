import type { UploadedFile } from "../types/uploads.js";
import { env } from "../config/env.js";

export interface FileStorageProvider {
  save(file: UploadedFile): Promise<{ url: string; filename: string }>;
}

class LocalFileStorageProvider implements FileStorageProvider {
  async save(file: UploadedFile) {
    const relativeUrl = `/uploads/${file.filename}`;

    return {
      filename: file.filename,
      url: env.PUBLIC_API_URL ? `${env.PUBLIC_API_URL.replace(/\/$/, "")}${relativeUrl}` : relativeUrl
    };
  }
}

export const fileStorageProvider: FileStorageProvider = new LocalFileStorageProvider();
