import { Router } from "express";

import { bookingsController } from "../controllers/bookings.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { adminBookingsSchema, bookingIdSchema, createBookingSchema } from "../dtos/bookings.dto.js";
import { validate } from "../middleware/validate.js";

export const bookingsRoutes = Router()
  .post("/", validate(createBookingSchema), asyncHandler(bookingsController.create.bind(bookingsController)))
  .get("/:id", validate(bookingIdSchema), asyncHandler(bookingsController.getById.bind(bookingsController)))
  .patch("/:id/cancel", validate(bookingIdSchema), asyncHandler(bookingsController.cancel.bind(bookingsController)));

export const myBookingsRoute = Router().get("/", asyncHandler(bookingsController.myBookings.bind(bookingsController)));

export const adminBookingsRoutes = Router()
  .get("/bookings", validate(adminBookingsSchema), asyncHandler(bookingsController.adminBookings.bind(bookingsController)))
  .patch("/bookings/:id/confirm", validate(bookingIdSchema), asyncHandler(bookingsController.adminConfirm.bind(bookingsController)))
  .get("/reports/bookings", asyncHandler(bookingsController.reports.bind(bookingsController)));
