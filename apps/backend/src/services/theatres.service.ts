import type { AuthUser } from "@bhutan/shared";

import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

export class TheatresService {
  async list(filters: { city?: string; search?: string }) {
    return prisma.theatre.findMany({
      where: {
        city: filters.city,
        OR: filters.search
          ? [
              { name: { contains: filters.search, mode: "insensitive" } },
              { location: { contains: filters.search, mode: "insensitive" } }
            ]
          : undefined
      },
      include: {
        screens: {
          orderBy: { name: "asc" }
        }
      },
      orderBy: [{ city: "asc" }, { name: "asc" }]
    });
  }

  async getById(id: string) {
    const theatre = await prisma.theatre.findUnique({
      where: { id },
      include: {
        screens: {
          orderBy: { name: "asc" }
        },
        showtimes: {
          where: { status: "ACTIVE" },
          include: {
            movie: true,
            screen: true
          },
          orderBy: { startTime: "asc" }
        }
      }
    });

    if (!theatre) {
      throw new HttpError(404, "Theatre not found");
    }

    return theatre;
  }

  async create(data: {
    name: string;
    city: string;
    location: string;
    description?: string;
    contactNumber: string;
  }) {
    return prisma.theatre.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      city: string;
      location: string;
      description?: string;
      contactNumber: string;
    }>
  ) {
    await this.getById(id);
    return prisma.theatre.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.getById(id);
    return prisma.theatre.delete({ where: { id } });
  }

  async assertTheatreAccess(user: AuthUser, theatreId: string) {
    if (user.role === "SUPER_ADMIN") {
      return;
    }

    const assignment = await prisma.theatreAdminAssignment.findFirst({
      where: {
        theatreId,
        userId: user.id
      }
    });

    if (!assignment) {
      throw new HttpError(403, "You can only manage your assigned theatre");
    }
  }

  async getManagedTheatreIds(user: AuthUser) {
    if (user.role === "SUPER_ADMIN") {
      const theatres = await prisma.theatre.findMany({ select: { id: true } });
      return theatres.map((theatre) => theatre.id);
    }

    const assignments = await prisma.theatreAdminAssignment.findMany({
      where: { userId: user.id },
      select: { theatreId: true }
    });

    return assignments.map((assignment) => assignment.theatreId);
  }
}

export const theatresService = new TheatresService();
