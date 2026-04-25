import { Router } from "express";

import { uploadsController } from "../controllers/uploads.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { upload } from "../middleware/upload.js";

export const adminUploadsRoutes = Router().post(
  "/uploads/image",
  upload.single("file"),
  asyncHandler(uploadsController.uploadImage.bind(uploadsController))
);
