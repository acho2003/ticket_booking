import bcrypt from "bcryptjs";
import { addHours, addDays } from "date-fns";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createSeatData = (
  screenId: string,
  totalRows: number,
  totalColumns: number,
  vipRows: string[],
  coupleRows: string[]
) => {
  const rows = Array.from({ length: totalRows }, (_, index) => String.fromCharCode(65 + index));

  return rows.flatMap((rowLabel) =>
    Array.from({ length: totalColumns }, (_, seatIndex) => {
      const seatNumber = seatIndex + 1;
      const isVip = vipRows.includes(rowLabel);
      const isCouple = coupleRows.includes(rowLabel);
      const seatType = isCouple ? "COUPLE" : isVip ? "VIP" : "REGULAR";

      return {
        screenId,
        rowLabel,
        seatNumber,
        seatCode: `${rowLabel}${seatNumber}`,
        seatType,
        isBlocked: false
      } as const;
    })
  );
};

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

  const [screen1, screen2, screen3] = await Promise.all([
    prisma.screen.create({
      data: {
        theatreId: thimphuTheatre.id,
        name: "Screen 1",
        totalRows: 10,
        totalColumns: 12
      }
    }),
    prisma.screen.create({
      data: {
        theatreId: thimphuTheatre.id,
        name: "Screen 2",
        totalRows: 8,
        totalColumns: 10
      }
    }),
    prisma.screen.create({
      data: {
        theatreId: paroTheatre.id,
        name: "Screen A",
        totalRows: 9,
        totalColumns: 10
      }
    })
  ]);

  await prisma.seat.createMany({
    data: [
      ...createSeatData(screen1.id, 10, 12, ["A", "B"], ["J"]),
      ...createSeatData(screen2.id, 8, 10, ["A"], ["H"]),
      ...createSeatData(screen3.id, 9, 10, ["A", "B"], ["I"])
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
      bookingCode: `BMB-${now.getFullYear()}-000001`,
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
