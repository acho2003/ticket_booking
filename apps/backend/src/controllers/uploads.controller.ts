import type { Request, Response } from "express";

import { fileStorageProvider } from "../services/storage.service.js";

export class UploadsController {
  async uploadImage(request: Request, response: Response) {
    if (!request.file) {
      response.status(400).json({
        error: {
          message: "No file uploaded"
        }
      });
      return;
    }

    const file = await fileStorageProvider.save(request.file);
    response.status(201).json({ data: file });
  }
}

export const uploadsController = new UploadsController();
