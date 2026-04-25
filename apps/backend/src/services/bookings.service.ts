import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { isBefore } from "date-fns";
import type { AuthUser } from "@bhutan/shared";

import { prisma } from "../lib/prisma.js";
import { formatBookingCode } from "../utils/booking-code.js";
import { HttpError } from "../utils/http-error.js";
import { resolveSeatPrice } from "../utils/seat-pricing.js";
import { theatresService } from "./theatres.service.js";

export class BookingsService {
  async create(user: AuthUser, input: { showtimeId: string; seatIds: string[] }) {
    const uniqueSeatIds = [...new Set(input.seatIds)];

    return prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const showtime = await tx.showtime.findUnique({
          where: { id: input.showtimeId },
          include: {
            screen: true
          }
        });

        if (!showtime || showtime.status !== "ACTIVE") {
          throw new HttpError(404, "Active showtime not found");
        }

        if (isBefore(showtime.startTime, new Date())) {
          throw new HttpError(400, "Cannot book seats for a showtime that has already started");
        }

        const seats = await tx.seat.findMany({
          where: {
            id: { in: uniqueSeatIds },
            screenId: showtime.screenId
          }
        });

        if (seats.length !== uniqueSeatIds.length) {
          throw new HttpError(400, "One or more seats are invalid for this showtime");
        }

        if (seats.some((seat) => seat.isBlocked || seat.seatType === "BLOCKED")) {
          throw new HttpError(400, "Blocked seats cannot be booked");
        }

        const existingSeats = await tx.bookingSeat.findMany({
          where: {
            showtimeId: input.showtimeId,
            seatId: { in: uniqueSeatIds },
            booking: {
              status: { in: [BookingStatus.RESERVED, BookingStatus.CONFIRMED] }
            }
          },
          select: {
            seatId: true,
            seatCode: true
          }
        });

        if (existingSeats.length > 0) {
          throw new HttpError(
            409,
            `Selected seats are no longer available: ${existingSeats.map((seat) => seat.seatCode).join(", ")}`
          );
        }

        const priceLookup = {
          regularPrice: Number(showtime.regularPrice),
          vipPrice: Number(showtime.vipPrice),
          couplePrice: Number(showtime.couplePrice)
        };

        const seatPayload = seats.map((seat) => ({
          seatId: seat.id,
          seatCode: seat.seatCode,
          price: resolveSeatPrice(seat.seatType, priceLookup)
        }));

        const totalAmount = seatPayload.reduce((total, seat) => total + seat.price, 0);
        const year = new Date().getFullYear();

        const sequence = await tx.bookingSequence.upsert({
          where: { year },
          create: { year, currentValue: 1 },
          update: {
            currentValue: {
              increment: 1
            }
          }
        });

        const booking = await tx.booking.create({
          data: {
            userId: user.id,
            showtimeId: input.showtimeId,
            bookingCode: formatBookingCode(year, sequence.currentValue),
            totalAmount,
            status: BookingStatus.RESERVED,
            paymentStatus: PaymentStatus.PAY_AT_COUNTER,
            bookingSeats: {
              create: seatPayload.map((seat) => ({
                seatId: seat.seatId,
                seatCode: seat.seatCode,
                price: seat.price,
                showtimeId: input.showtimeId
              }))
            }
          },
          include: this.bookingInclude
        });

        return booking;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }

  listMine(user: AuthUser) {
    return prisma.booking.findMany({
      where: { userId: user.id },
      include: this.bookingInclude,
      orderBy: { createdAt: "desc" }
    });
  }

  async getById(user: AuthUser, id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: this.bookingInclude
    });

    if (!booking) {
      throw new HttpError(404, "Booking not found");
    }

    if (user.role === "CUSTOMER" && booking.userId !== user.id) {
      throw new HttpError(403, "You can only view your own bookings");
    }

    if (user.role === "THEATRE_ADMIN") {
      await theatresService.assertTheatreAccess(user, booking.showtime.theatreId);
    }

    return booking;
  }

  async cancel(user: AuthUser, id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        showtime: true
      }
    });

    if (!booking) {
      throw new HttpError(404, "Booking not found");
    }

    if (booking.userId !== user.id) {
      throw new HttpError(403, "You can only cancel your own bookings");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return booking;
    }

    if (isBefore(booking.showtime.startTime, new Date())) {
      throw new HttpError(400, "Bookings cannot be cancelled after the showtime starts");
    }

    return prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        paymentStatus: PaymentStatus.UNPAID
      },
      include: this.bookingInclude
    });
  }

  async listForAdmin(
    user: AuthUser,
    filters: { theatreId?: string; status?: "RESERVED" | "CONFIRMED" | "CANCELLED"; bookingCode?: string }
  ) {
    if (filters.theatreId) {
      await theatresService.assertTheatreAccess(user, filters.theatreId);
    }

    const managedTheatreIds = await theatresService.getManagedTheatreIds(user);

    return prisma.booking.findMany({
      where: {
        status: filters.status,
        bookingCode: filters.bookingCode ? { contains: filters.bookingCode, mode: "insensitive" } : undefined,
        showtime: {
          theatreId: filters.theatreId
            ? filters.theatreId
            : { in: managedTheatreIds }
        }
      },
      include: this.bookingInclude,
      orderBy: { createdAt: "desc" }
    });
  }

  async confirm(user: AuthUser, id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        showtime: true
      }
    });

    if (!booking) {
      throw new HttpError(404, "Booking not found");
    }

    await theatresService.assertTheatreAccess(user, booking.showtime.theatreId);

    return prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID
      },
      include: this.bookingInclude
    });
  }

  async getReport(user: AuthUser) {
    const theatreIds = await theatresService.getManagedTheatreIds(user);

    const bookings = await prisma.booking.findMany({
      where: {
        showtime: {
          theatreId: { in: theatreIds }
        }
      },
      include: {
        showtime: {
          include: {
            movie: true,
            theatre: true
          }
        },
        bookingSeats: true
      }
    });

    const summary = bookings.reduce<Record<string, { theatre: string; totalBookings: number; revenue: number }>>(
      (accumulator, booking) => {
        const key = booking.showtime.theatreId;

        if (!accumulator[key]) {
          accumulator[key] = {
            theatre: booking.showtime.theatre.name,
            totalBookings: 0,
            revenue: 0
          };
        }

        accumulator[key].totalBookings += 1;

        if (booking.status === BookingStatus.CONFIRMED) {
          accumulator[key].revenue += Number(booking.totalAmount);
        }

        return accumulator;
      },
      {}
    );

    return {
      totalBookings: bookings.length,
      reservedBookings: bookings.filter((booking) => booking.status === BookingStatus.RESERVED).length,
      confirmedBookings: bookings.filter((booking) => booking.status === BookingStatus.CONFIRMED).length,
      cancelledBookings: bookings.filter((booking) => booking.status === BookingStatus.CANCELLED).length,
      theatreBreakdown: Object.values(summary)
    };
  }

  private bookingInclude = {
    showtime: {
      include: {
        movie: true,
        theatre: true,
        screen: true
      }
    },
    bookingSeats: {
      include: {
        seat: true
      }
    }
  } as const;
}

export const bookingsService = new BookingsService();
