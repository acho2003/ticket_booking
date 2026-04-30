import type { AuthUser } from "@bhutan/shared";

import { prisma } from "../lib/prisma.js";
import { theatresService } from "./theatres.service.js";
import { HttpError } from "../utils/http-error.js";
import { buildDefaultLayoutConfig, buildSeatsFromLayout, type ScreenLayoutConfig } from "../utils/screen-layout.js";

export class ScreensService {
  async listByTheatre(user: AuthUser, theatreId: string) {
    await theatresService.assertTheatreAccess(user, theatreId);

    return prisma.screen.findMany({
      where: { theatreId },
      include: {
        seats: {
          orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }]
        }
      },
      orderBy: { name: "asc" }
    });
  }

  async create(
    user: AuthUser,
    theatreId: string,
    data: { name: string; totalRows: number; totalColumns: number }
  ) {
    await theatresService.assertTheatreAccess(user, theatreId);

    return prisma.screen.create({
      data: {
        theatreId,
        ...data
      }
    });
  }

  async update(
    user: AuthUser,
    screenId: string,
    data: Partial<{ name: string; totalRows: number; totalColumns: number }>
  ) {
    const screen = await prisma.screen.findUnique({
      where: { id: screenId }
    });

    if (!screen) {
      throw new HttpError(404, "Screen not found");
    }

    await theatresService.assertTheatreAccess(user, screen.theatreId);

    return prisma.screen.update({
      where: { id: screenId },
      data
    });
  }

  async delete(user: AuthUser, screenId: string) {
    const screen = await prisma.screen.findUnique({
      where: { id: screenId }
    });

    if (!screen) {
      throw new HttpError(404, "Screen not found");
    }

    await theatresService.assertTheatreAccess(user, screen.theatreId);

    return prisma.screen.delete({
      where: { id: screenId }
    });
  }

  async generateSeats(
    user: AuthUser,
    screenId: string,
    input: {
      totalRows?: number;
      totalColumns?: number;
      seatTypeMap?: Array<{
        rowLabel: string;
        seatNumber: number;
        seatType: "REGULAR" | "VIP" | "COUPLE" | "BLOCKED";
        isBlocked?: boolean;
      }>;
      layout?: ScreenLayoutConfig;
    }
  ) {
    const screen = await prisma.screen.findUnique({
      where: { id: screenId },
      include: {
        showtimes: {
          include: {
            bookings: {
              where: { status: { in: ["RESERVED", "CONFIRMED"] } }
            }
          }
        }
      }
    });

    if (!screen) {
      throw new HttpError(404, "Screen not found");
    }

    await theatresService.assertTheatreAccess(user, screen.theatreId);

    const hasActiveBookings = screen.showtimes.some((showtime) => showtime.bookings.length > 0);

    if (hasActiveBookings) {
      throw new HttpError(409, "Cannot regenerate seats for a screen that already has bookings");
    }

    let layoutConfig: ScreenLayoutConfig;
    let generatedLayout: ReturnType<typeof buildSeatsFromLayout> | null = null;

    try {
      layoutConfig =
        input.layout ??
        buildDefaultLayoutConfig(input.totalRows ?? 0, input.totalColumns ?? 0, input.seatTypeMap);
      generatedLayout = buildSeatsFromLayout(screenId, layoutConfig);
    } catch (error) {
      throw new HttpError(400, error instanceof Error ? error.message : "Invalid seat layout");
    }

    const { config, seats, totalRows, totalColumns } = generatedLayout!;

    await prisma.$transaction([
      prisma.seat.deleteMany({ where: { screenId } }),
      prisma.screen.update({
        where: { id: screenId },
        data: {
          totalRows,
          totalColumns,
          layoutConfig: config
        }
      }),
      prisma.seat.createMany({ data: seats })
    ]);

    return prisma.seat.findMany({
      where: { screenId },
      orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }]
    });
  }
}

export const screensService = new ScreensService();
