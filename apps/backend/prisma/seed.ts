import bcrypt from "bcryptjs";
import { addHours, addDays } from "date-fns";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedSeatType = "REGULAR" | "VIP" | "COUPLE" | "BLOCKED";

type SeedLayoutRow = {
  rowLabel: string;
  seatCount: number;
  leftOffset?: number;
  rightOffset?: number;
  aisleAfter?: number[];
  defaultSeatType?: SeedSeatType;
  overrides?: Array<{
    seatNumber: number;
    seatType: SeedSeatType;
    isBlocked?: boolean;
  }>;
};

type SeedLayoutConfig = {
  version: 1;
  rows: SeedLayoutRow[];
};

const buildSeatLayout = (rows: SeedLayoutRow[]): SeedLayoutConfig => ({
  version: 1,
  rows
});

const createSeatData = (screenId: string, layout: SeedLayoutConfig) =>
  layout.rows.flatMap((row) =>
    Array.from({ length: row.seatCount }, (_, seatIndex) => {
      const seatNumber = seatIndex + 1;
      const override = row.overrides?.find((entry) => entry.seatNumber === seatNumber);
      const seatType = override?.seatType ?? row.defaultSeatType ?? "REGULAR";
      const isBlocked = override?.isBlocked ?? seatType === "BLOCKED";

      return {
        screenId,
        rowLabel: row.rowLabel,
        seatNumber,
        seatCode: `${row.rowLabel}${seatNumber}`,
        seatType,
        isBlocked
      } as const;
    })
  );

async function main() {
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.theatreAdminAssignment.deleteMany();
  await prisma.theatre.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();
  await prisma.bookingSequence.deleteMany();

  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const theatrePasswordHash = await bcrypt.hash("Theatre@123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);

  const [superAdmin, customer, theatreAdmin1, theatreAdmin2] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Super Admin",
        email: "superadmin@bhutanmovies.bt",
        phone: "+97517111111",
        passwordHash: adminPasswordHash,
        role: "SUPER_ADMIN"
      }
    }),
    prisma.user.create({
      data: {
        name: "Karma Wangchuk",
        email: "customer@bhutanmovies.bt",
        phone: "+97517654321",
        passwordHash: customerPasswordHash,
        role: "CUSTOMER"
      }
    }),
    prisma.user.create({
      data: {
        name: "Tandin Admin",
        email: "thimphu.admin@bhutanmovies.bt",
        phone: "+97517555555",
        passwordHash: theatrePasswordHash,
        role: "THEATRE_ADMIN"
      }
    }),
    prisma.user.create({
      data: {
        name: "Pema Admin",
        email: "paro.admin@bhutanmovies.bt",
        phone: "+97517444444",
        passwordHash: theatrePasswordHash,
        role: "THEATRE_ADMIN"
      }
    })
  ]);

  const [thimphuTheatre, paroTheatre] = await Promise.all([
    prisma.theatre.create({
      data: {
        name: "City Cinema Thimphu",
        city: "Thimphu",
        location: "Clock Tower Square, Thimphu",
        description: "Modern theatre in the heart of Thimphu with family-friendly screens.",
        contactNumber: "+9752334455"
      }
    }),
    prisma.theatre.create({
      data: {
        name: "Paro Silver Screen",
        city: "Paro",
        location: "Main Street, Paro",
        description: "Boutique movie theatre serving Paro and nearby towns.",
        contactNumber: "+9758278899"
      }
    })
  ]);

  await prisma.theatreAdminAssignment.createMany({
    data: [
      { theatreId: thimphuTheatre.id, userId: theatreAdmin1.id },
      { theatreId: paroTheatre.id, userId: theatreAdmin2.id }
    ]
  });

  const screen1Layout = buildSeatLayout([
    { rowLabel: "A", seatCount: 12, aisleAfter: [6] },
    { rowLabel: "B", seatCount: 12, aisleAfter: [6] },
    { rowLabel: "C", seatCount: 12, aisleAfter: [6] },
    { rowLabel: "D", seatCount: 12, aisleAfter: [6] },
    { rowLabel: "E", seatCount: 12, aisleAfter: [6] },
    { rowLabel: "F", seatCount: 12, aisleAfter: [6] },
    { rowLabel: "G", seatCount: 10, leftOffset: 1, aisleAfter: [5], defaultSeatType: "VIP" },
    { rowLabel: "H", seatCount: 8, leftOffset: 2, aisleAfter: [4], defaultSeatType: "COUPLE" }
  ]);

  const screen2Layout = buildSeatLayout([
    {
      rowLabel: "A",
      seatCount: 8,
      leftOffset: 3,
      aisleAfter: [4],
      overrides: [
        { seatNumber: 1, seatType: "BLOCKED", isBlocked: true },
        { seatNumber: 8, seatType: "BLOCKED", isBlocked: true }
      ]
    },
    { rowLabel: "B", seatCount: 8, leftOffset: 3, aisleAfter: [4] },
    { rowLabel: "C", seatCount: 14, aisleAfter: [7] },
    { rowLabel: "D", seatCount: 14, aisleAfter: [7] },
    { rowLabel: "E", seatCount: 14, aisleAfter: [7] },
    {
      rowLabel: "F",
      seatCount: 14,
      aisleAfter: [7],
      overrides: [
        { seatNumber: 6, seatType: "VIP" },
        { seatNumber: 7, seatType: "VIP" },
        { seatNumber: 8, seatType: "VIP" },
        { seatNumber: 9, seatType: "VIP" }
      ]
    },
    { rowLabel: "G", seatCount: 10, leftOffset: 2, aisleAfter: [5], defaultSeatType: "VIP" },
    { rowLabel: "H", seatCount: 10, leftOffset: 2, aisleAfter: [5], defaultSeatType: "VIP" }
  ]);

  const screen3Layout = buildSeatLayout([
    { rowLabel: "A", seatCount: 10, aisleAfter: [5] },
    { rowLabel: "B", seatCount: 10, aisleAfter: [5] },
    { rowLabel: "C", seatCount: 10, aisleAfter: [5] },
    { rowLabel: "D", seatCount: 10, aisleAfter: [5] },
    { rowLabel: "E", seatCount: 9, leftOffset: 1, aisleAfter: [4] },
    { rowLabel: "F", seatCount: 9, leftOffset: 1, aisleAfter: [4] },
    { rowLabel: "G", seatCount: 6, leftOffset: 2, aisleAfter: [3], defaultSeatType: "VIP" },
    { rowLabel: "H", seatCount: 6, leftOffset: 2, aisleAfter: [3], defaultSeatType: "VIP" },
    { rowLabel: "I", seatCount: 4, leftOffset: 3, aisleAfter: [2], defaultSeatType: "COUPLE" }
  ]);

  const [screen1, screen2, screen3] = await Promise.all([
    prisma.screen.create({
      data: {
        theatreId: thimphuTheatre.id,
        name: "Screen 1",
        totalRows: screen1Layout.rows.length,
        totalColumns: 13,
        layoutConfig: screen1Layout
      }
    }),
    prisma.screen.create({
      data: {
        theatreId: thimphuTheatre.id,
        name: "Screen 2",
        totalRows: screen2Layout.rows.length,
        totalColumns: 15,
        layoutConfig: screen2Layout
      }
    }),
    prisma.screen.create({
      data: {
        theatreId: paroTheatre.id,
        name: "Screen A",
        totalRows: screen3Layout.rows.length,
        totalColumns: 11,
        layoutConfig: screen3Layout
      }
    })
  ]);

  await prisma.seat.createMany({
    data: [
      ...createSeatData(screen1.id, screen1Layout),
      ...createSeatData(screen2.id, screen2Layout),
      ...createSeatData(screen3.id, screen3Layout)
    ]
  });

  const [movie1, movie2, movie3] = await Promise.all([
    prisma.movie.create({
      data: {
        title: "Lunana: A Yak in the Classroom",
        description: "A Bhutanese teacher is sent to the most remote school in the world and rediscovers purpose.",
        genre: "Drama",
        language: "Dzongkha",
        durationMinutes: 110,
        rating: "PG",
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=E1x-lS0aP8Q",
        regularPrice: 250,
        vipPrice: 350,
        couplePrice: 600,
        releaseDate: addDays(new Date(), -20),
        status: "NOW_SHOWING"
      }
    }),
    prisma.movie.create({
      data: {
        title: "The Monk and the Gun",
        description: "Set during Bhutan's transition to democracy, a young monk receives an unusual mission.",
        genre: "Comedy Drama",
        language: "Dzongkha",
        durationMinutes: 112,
        rating: "PG-13",
        posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=H3EAEuDq4S8",
        regularPrice: 220,
        vipPrice: 320,
        couplePrice: 550,
        releaseDate: addDays(new Date(), -5),
        status: "NOW_SHOWING"
      }
    }),
    prisma.movie.create({
      data: {
        title: "Thunder Dragon Rising",
        description: "A fictional Bhutanese adventure film following young heroes across mountain kingdoms.",
        genre: "Adventure",
        language: "English",
        durationMinutes: 124,
        rating: "PG-13",
        posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
        trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        regularPrice: 300,
        vipPrice: 400,
        couplePrice: 700,
        releaseDate: addDays(new Date(), 14),
        status: "UPCOMING"
      }
    })
  ]);

  const now = new Date();

  const [showtime1, showtime2, showtime3, showtime4] = await Promise.all([
    prisma.showtime.create({
      data: {
        movieId: movie1.id,
        theatreId: thimphuTheatre.id,
        screenId: screen1.id,
        startTime: addHours(now, 6),
        endTime: addHours(now, 8),
        regularPrice: 250,
        vipPrice: 350,
        couplePrice: 600,
        status: "ACTIVE"
      }
    }),
    prisma.showtime.create({
      data: {
        movieId: movie2.id,
        theatreId: thimphuTheatre.id,
        screenId: screen2.id,
        startTime: addHours(now, 9),
        endTime: addHours(now, 11),
        regularPrice: 220,
        vipPrice: 320,
        couplePrice: 550,
        status: "ACTIVE"
      }
    }),
    prisma.showtime.create({
      data: {
        movieId: movie2.id,
        theatreId: paroTheatre.id,
        screenId: screen3.id,
        startTime: addHours(now, 7),
        endTime: addHours(now, 9),
        regularPrice: 200,
        vipPrice: 280,
        couplePrice: 500,
        status: "ACTIVE"
      }
    }),
    prisma.showtime.create({
      data: {
        movieId: movie3.id,
        theatreId: thimphuTheatre.id,
        screenId: screen1.id,
        startTime: addDays(addHours(now, 18), 2),
        endTime: addDays(addHours(now, 20), 2),
        regularPrice: 300,
        vipPrice: 400,
        couplePrice: 700,
        status: "ACTIVE"
      }
    })
  ]);

  const seatsForBooking = await prisma.seat.findMany({
    where: {
      screenId: screen1.id,
      seatCode: {
        in: ["C1", "C2"]
      }
    }
  });

  await prisma.bookingSequence.create({
    data: {
      year: now.getFullYear(),
      currentValue: 1
    }
  });

  await prisma.booking.create({
    data: {
      userId: customer.id,
      showtimeId: showtime1.id,
      bookingCode: `MOVI-${now.getFullYear()}-000001`,
      totalAmount: 500,
      status: "RESERVED",
      paymentStatus: "PAY_AT_COUNTER",
      bookingSeats: {
        create: seatsForBooking.map((seat: { id: string; seatCode: string }) => ({
          showtimeId: showtime1.id,
          seatId: seat.id,
          seatCode: seat.seatCode,
          price: 250
        }))
      }
    }
  });

  console.log("Seed complete");
  console.log({
    superAdmin: superAdmin.email,
    theatreAdmin1: theatreAdmin1.email,
    theatreAdmin2: theatreAdmin2.email,
    customer: customer.email,
    passwordHint: "Use the seeded passwords defined in prisma/seed.ts"
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
