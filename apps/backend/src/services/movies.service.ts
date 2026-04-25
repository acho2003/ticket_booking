import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/http-error.js";

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
    releaseDate: string;
    status: "NOW_SHOWING" | "UPCOMING" | "ENDED";
  }) {
    return prisma.movie.create({
      data: {
        ...data,
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
      releaseDate: string;
      status: "NOW_SHOWING" | "UPCOMING" | "ENDED";
    }>
  ) {
    await this.getById(id);

    return prisma.movie.update({
      where: { id },
      data: {
        ...data,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined
      }
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return prisma.movie.delete({ where: { id } });
  }
}

export const moviesService = new MoviesService();
