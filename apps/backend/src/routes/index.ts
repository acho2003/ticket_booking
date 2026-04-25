import type { Express } from "express";

import { authRoutes } from "./auth.routes.js";
import { publicMoviesRoutes, adminMoviesRoutes } from "./movies.routes.js";
import { publicTheatresRoutes, adminTheatresRoutes } from "./theatres.routes.js";
import { adminScreensRoutes } from "./screens.routes.js";
import { publicSeatsRoutes, adminSeatsRoutes } from "./seats.routes.js";
import { publicShowtimesRoutes, movieShowtimesRoutes, adminShowtimesRoutes } from "./showtimes.routes.js";
import { bookingsRoutes, adminBookingsRoutes, myBookingsRoute } from "./bookings.routes.js";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { getSwaggerBundle } from "../lib/swagger.js";
import { adminOverviewRoutes, superAdminUsersRoutes } from "./users.routes.js";
import { adminUploadsRoutes } from "./uploads.routes.js";

export const registerRoutes = (app: Express) => {
  const swagger = getSwaggerBundle();

  if (swagger) {
    app.use("/docs", swagger.swaggerUi.serve, swagger.swaggerUi.setup(swagger.swaggerSpec));
  }

  app.use("/auth", authRoutes);
  app.use("/movies", publicMoviesRoutes);
  app.use("/movies", movieShowtimesRoutes);
  app.use("/theatres", publicTheatresRoutes);
  app.use("/", publicSeatsRoutes);
  app.use("/showtimes", publicShowtimesRoutes);

  app.use("/bookings", authenticate, bookingsRoutes);
  app.use("/my-bookings", authenticate, myBookingsRoute);

  app.use(
    "/admin",
    authenticate,
    requireRoles("SUPER_ADMIN", "THEATRE_ADMIN"),
    adminScreensRoutes,
    adminSeatsRoutes,
    adminShowtimesRoutes,
    adminBookingsRoutes,
    adminUploadsRoutes,
    adminOverviewRoutes
  );

  app.use(
    "/admin/movies",
    authenticate,
    requireRoles("SUPER_ADMIN"),
    adminMoviesRoutes
  );

  app.use(
    "/admin/theatres",
    authenticate,
    requireRoles("SUPER_ADMIN"),
    adminTheatresRoutes
  );

  app.use(
    "/admin",
    authenticate,
    requireRoles("SUPER_ADMIN"),
    superAdminUsersRoutes
  );
};
