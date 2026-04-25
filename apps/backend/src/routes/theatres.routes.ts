import { Router } from "express";

import { theatresController } from "../controllers/theatres.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createTheatreSchema, listTheatresSchema, theatreIdSchema, updateTheatreSchema } from "../dtos/theatres.dto.js";
import { validate } from "../middleware/validate.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Theatres
 *   description: Public theatre discovery endpoints
 */

router.get("/", validate(listTheatresSchema), asyncHandler(theatresController.list.bind(theatresController)));
router.get("/:id", validate(theatreIdSchema), asyncHandler(theatresController.getById.bind(theatresController)));

export const publicTheatresRoutes = router;

export const adminTheatresRoutes = Router()
  .post("/", validate(createTheatreSchema), asyncHandler(theatresController.create.bind(theatresController)))
  .patch("/:id", validate(updateTheatreSchema), asyncHandler(theatresController.update.bind(theatresController)))
  .delete("/:id", validate(theatreIdSchema), asyncHandler(theatresController.delete.bind(theatresController)));
