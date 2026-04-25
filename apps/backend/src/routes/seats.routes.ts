import { Router } from "express";

import { seatsController } from "../controllers/seats.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { publicScreenSeatsSchema, updateSeatSchema } from "../dtos/seats.dto.js";
import { showtimeIdSchema } from "../dtos/showtimes.dto.js";
import { validate } from "../middleware/validate.js";

export const publicSeatsRoutes = Router()
  .get("/screens/:screenId/seats", validate(publicScreenSeatsSchema), asyncHandler(seatsController.getScreenSeats.bind(seatsController)))
  .get("/showtimes/:id/seats", validate(showtimeIdSchema), asyncHandler(seatsController.getShowtimeSeats.bind(seatsController)));

export const adminSeatsRoutes = Router().patch(
  "/seats/:seatId",
  validate(updateSeatSchema),
  asyncHandler(seatsController.update.bind(seatsController))
);
