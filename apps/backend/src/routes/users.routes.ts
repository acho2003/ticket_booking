import { Router } from "express";

import { usersController } from "../controllers/users.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createTheatreAdminSchema } from "../dtos/users.dto.js";
import { validate } from "../middleware/validate.js";

export const adminOverviewRoutes = Router()
  .get("/dashboard/overview", asyncHandler(usersController.overview.bind(usersController)));

export const superAdminUsersRoutes = Router()
  .get("/theatre-admins", asyncHandler(usersController.listTheatreAdmins.bind(usersController)))
  .post("/theatre-admins", validate(createTheatreAdminSchema), asyncHandler(usersController.createTheatreAdmin.bind(usersController)));
