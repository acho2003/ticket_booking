import { Router } from "express";

import { moviesController } from "../controllers/movies.controller.js";
import { validate } from "../middleware/validate.js";
import { createMovieSchema, listMoviesSchema, movieIdSchema, updateMovieSchema } from "../dtos/movies.dto.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Public movie listing and movie detail endpoints
 */

router.get("/", validate(listMoviesSchema), asyncHandler(moviesController.list.bind(moviesController)));
router.get("/:id", validate(movieIdSchema), asyncHandler(moviesController.getById.bind(moviesController)));

export const publicMoviesRoutes = router;

export const adminMoviesRoutes = Router()
  .post("/", validate(createMovieSchema), asyncHandler(moviesController.create.bind(moviesController)))
  .patch("/:id", validate(updateMovieSchema), asyncHandler(moviesController.update.bind(moviesController)))
  .delete("/:id", validate(movieIdSchema), asyncHandler(moviesController.delete.bind(moviesController)));
