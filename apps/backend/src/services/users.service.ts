import bcrypt from "bcryptjs";
import type { AuthUser } from "@bhutan/shared";

import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export class UsersService {
  async listTheatreAdmins(user: AuthUser) {
    if (user.role !== "SUPER_ADMIN") {
      throw new HttpError(403, "Only super admins can manage theatre admins");
    }

    return prisma.user.findMany({
      where: {
        role: "THEATRE_ADMIN"
      },
      include: {
        theatreAssignments: {
          include: {
            theatre: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createTheatreAdmin(
    user: AuthUser,
    data: { name: string; email: string; phone?: string; password: string; theatreId: string }
  ) {
    if (user.role !== "SUPER_ADMIN") {
      throw new HttpError(403, "Only super admins can manage theatre admins");
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) {
      throw new HttpError(409, "A user with this email already exists");
    }

    const theatre = await prisma.theatre.findUnique({
      where: { id: data.theatreId }
    });

    if (!theatre) {
      throw new HttpError(404, "Theatre not found");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: "THEATRE_ADMIN",
        theatreAssignments: {
          create: {
            theatreId: data.theatreId
          }
        }
      },
      include: {
        theatreAssignments: {
          include: { theatre: true }
        }
      }
    });
  }

  async getDashboardOverview(user: AuthUser) {
    const theatreIds =
      user.role === "SUPER_ADMIN"
        ? undefined
        : (await prisma.theatreAdminAssignment.findMany({
            where: { userId: user.id },
            select: { theatreId: true }
          })).map((assignment) => assignment.theatreId);

    const [movies, theatres, showtimes, bookings] = await Promise.all([
      prisma.movie.count(),
      prisma.theatre.count({
        where: theatreIds ? { id: { in: theatreIds } } : undefined
      }),
      prisma.showtime.count({
        where: theatreIds ? { theatreId: { in: theatreIds } } : undefined
      }),
      prisma.booking.count({
        where: theatreIds
          ? {
              showtime: {
                theatreId: { in: theatreIds }
              }
            }
          : undefined
      })
    ]);

    return { movies, theatres, showtimes, bookings };
  }
}

export const usersService = new UsersService();
