import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export class AuthService {
  async register(input: { name: string; email: string; phone?: string; password: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (existingUser) {
      throw new HttpError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: "CUSTOMER"
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true
      }
    });

    return {
      user,
      token: this.issueToken(user.id, user.role)
    };
  }

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid email or password");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token: this.issueToken(user.id, user.role)
    };
  }

  private issueToken(userId: string, role: string) {
    return jwt.sign({ userId, role }, env.JWT_SECRET, {
      expiresIn: "7d"
    });
  }
}

export const authService = new AuthService();
