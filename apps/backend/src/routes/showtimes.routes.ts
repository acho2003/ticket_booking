import { Router } from "express";

import { showtimesController } from "../controllers/showtimes.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createShowtimeSchema, listShowtimesSchema, movieShowtimesSchema, showtimeIdSchema, updateShowtimeSchema } from "../dtos/showtimes.dto.js";
import { validate } from "../middleware/validate.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Showtimes
 *   description: Public showtime discovery endpoints
 */

router.get("/", validate(listShowtimesSchema), asyncHandler(showtimesController.list.bind(showtimesController)));
router.get("/:id", validate(showtimeIdSchema), asyncHandler(showtimesController.getById.bind(showtimesController)));

export const publicShowtimesRoutes = router;

export const movieShowtimesRoutes = Router().get(
  "/:movieId/showtimes",
  validate(movieShowtimesSchema),
  asyncHandler(showtimesController.getByMovie.bind(showtimesController))
);

export const adminShowtimesRoutes = Router()
  .post("/", validate(createShowtimeSchema), asyncHandler(showtimesController.create.bind(showtimesController)))
  .patch("/:id", validate(updateShowtimeSchema), asyncHandler(showtimesController.update.bind(showtimesController)))
  .delete("/:id", validate(showtimeIdSchema), asyncHandler(showtimesController.delete.bind(showtimesController)));
