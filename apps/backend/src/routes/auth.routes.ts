import { Router } from "express";

import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../dtos/auth.dto.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Customer and admin authentication endpoints
 */

router.post("/register", validate(registerSchema), asyncHandler(authController.register.bind(authController)));
router.post("/login", validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.get("/me", authenticate, asyncHandler(authController.me.bind(authController)));

export const authRoutes = router;
