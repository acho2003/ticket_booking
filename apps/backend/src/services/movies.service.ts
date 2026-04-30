import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { normalizeTwoClassPrices } from "../utils/pricing.js";

export class MoviesService {
  list(filters: { status?: "NOW_SHOWING" | "UPCOMING" | "ENDED"; search?: string }) {
    return prisma.movie.findMany({
      where: {
        status: filters.status,
        OR: filters.search
          ? [
              { title: { contains: filters.search, mode: "insensitive" } },
              { genre: { contains: filters.search, mode: "insensitive" } }
            ]
          : undefined
      },
      orderBy: [{ status: "asc" }, { releaseDate: "desc" }]
    });
  }

  async getById(id: string) {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          where: { status: "ACTIVE" },
          include: {
            theatre: true,
            screen: true
          },
          orderBy: { startTime: "asc" }
        }
      }
    });

    if (!movie) {
      throw new HttpError(404, "Movie not found");
    }

    return movie;
  }

  create(data: {
    title: string;
    description: string;
    genre: string;
    language: string;
    durationMinutes: number;
    rating: string;
    posterUrl: string;
    trailerUrl?: string;
    regularPrice: number;
    vipPrice: number;
    couplePrice?: number;
    releaseDate: string;
    status: "NOW_SHOWING" | "UPCOMING" | "ENDED";
  }) {
    return prisma.movie.create({
      data: {
        ...data,
        ...normalizeTwoClassPrices(data),
        releaseDate: new Date(data.releaseDate)
      }
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      genre: string;
      language: string;
      durationMinutes: number;
      rating: string;
      posterUrl: string;
      trailerUrl?: string;
      regularPrice: number;
      vipPrice: number;
      couplePrice?: number;
      releaseDate: string;
      status: "NOW_SHOWING" | "UPCOMING" | "ENDED";
    }>
  ) {
    const existing = await this.getById(id);

    const priceData =
      data.regularPrice !== undefined || data.vipPrice !== undefined || data.couplePrice !== undefined
        ? normalizeTwoClassPrices({
            regularPrice: data.regularPrice ?? Number(existing.regularPrice),
            vipPrice: data.vipPrice ?? Number(existing.vipPrice),
            couplePrice: data.couplePrice ?? Number(existing.couplePrice)
          })
        : {};

    return prisma.movie.update({
      where: { id },
      data: {
        ...data,
        ...priceData,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined
      }
    });
  }

  async delete(id: string) {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          where: {
            status: {
              in: ["ACTIVE", "COMPLETED"]
            }
          }
        }
      }
    });

    if (!movie) {
      throw new HttpError(404, "Movie not found");
    }

    if (movie.status !== "ENDED") {
      throw new HttpError(400, "Only movies marked as ended can be deleted");
    }

    if (movie.showtimes.some((showtime) => showtime.status === "ACTIVE")) {
      throw new HttpError(400, "Active screenings must be cancelled or completed before deletion");
    }

    return prisma.movie.delete({ where: { id } });
  }
}

export const moviesService = new MoviesService();
