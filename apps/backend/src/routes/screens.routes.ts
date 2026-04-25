import { Router } from "express";

import { screensController } from "../controllers/screens.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createScreenSchema, generateSeatsSchema, screenIdSchema, theatreScreenParamsSchema, updateScreenSchema } from "../dtos/screens.dto.js";
import { validate } from "../middleware/validate.js";

export const adminScreensRoutes = Router()
  .post("/theatres/:theatreId/screens", validate(createScreenSchema), asyncHandler(screensController.create.bind(screensController)))
  .get("/theatres/:theatreId/screens", validate(theatreScreenParamsSchema), asyncHandler(screensController.listByTheatre.bind(screensController)))
  .patch("/screens/:screenId", validate(updateScreenSchema), asyncHandler(screensController.update.bind(screensController)))
  .delete("/screens/:screenId", validate(screenIdSchema), asyncHandler(screensController.delete.bind(screensController)))
  .post("/screens/:screenId/generate-seats", validate(generateSeatsSchema), asyncHandler(screensController.generateSeats.bind(screensController)));
