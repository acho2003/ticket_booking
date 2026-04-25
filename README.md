# Bhutan Movie Booking Platform

A complete monorepo for an online movie ticket booking system for Bhutan.

## Included Apps

- `apps/backend`: Express.js + Prisma + PostgreSQL backend
- `apps/web`: Next.js customer website
- `apps/admin`: Next.js admin dashboard
- `apps/mobile`: Expo React Native mobile app
- `packages/shared`: Shared TypeScript types and helpers

## Folder Structure

```text
bhutan-movie-booking/
  apps/
    backend/
    web/
    admin/
    mobile/
  packages/
    shared/
```

## Key Features

### Customer

- Register and login
- Browse now showing and upcoming movies
- View movie details and trailer links
- Browse theatres and showtimes
- Select seats from a visual seat map
- See per-seat pricing before booking
- Confirm bookings with `PAY_AT_COUNTER`
- View and cancel bookings before showtime

### Super Admin

- Manage movies, theatres, screens, seat layouts, showtimes, pricing, reports, and theatre admins

### Theatre Admin

- Manage only their assigned theatre
- Update screens, seats, showtimes, pricing, and bookings for that theatre
- Confirm counter payments by booking code or booking list

## Backend Notes

- JWT authentication
- Role-based access control
- Prisma schema for users, theatres, screens, seats, movies, showtimes, bookings, and theatre admin assignments
- Booking transaction logic to prevent double booking
- Unique booking code generation in `BMB-YYYY-XXXXXX` format
- Local upload provider abstraction ready for S3 or Cloudinary later
- Swagger docs available at `/docs`

## Environment Setup

### Backend

Copy `apps/backend/.env.example` to `apps/backend/.env` and update:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bhutan_movie_booking?schema=public"
JWT_SECRET="replace-with-a-secure-secret"
PORT=5000
NODE_ENV=development
```

### Website

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Admin Dashboard

Copy `apps/admin/.env.example` to `apps/admin/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Mobile

Copy `apps/mobile/.env.example` to `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## Install

From the repo root:

```bash
npm install
```

## Database Setup

Make sure PostgreSQL is running and the target database exists, then run:

```bash
npm run db:migrate
npm run db:seed
```

## Seeded Accounts

The seed script creates:

- Super admin: `superadmin@bhutanmovies.bt`
- Theatre admin: `thimphu.admin@bhutanmovies.bt`
- Theatre admin: `paro.admin@bhutanmovies.bt`
- Customer: `customer@bhutanmovies.bt`

Passwords are defined in [apps/backend/prisma/seed.ts](/C:/Users/a/Desktop/Ticket%20Booking/bhutan-movie-booking/apps/backend/prisma/seed.ts).

## Development Commands

From the repo root:

```bash
npm run backend
npm run web
npm run admin
npm run mobile
```

Or run the main web/admin/backend stack together:

```bash
npm run dev
```

## Build Verification

The workspace build command is configured and passes:

```bash
npm run build
```

## Local Run Flow

1. Start PostgreSQL.
2. Configure all `.env` files.
3. Run `npm install`.
4. Run `npm run db:migrate`.
5. Run `npm run db:seed`.
6. Start the backend with `npm run backend`.
7. Start the customer website with `npm run web`.
8. Start the admin dashboard with `npm run admin`.
9. Start the Expo app with `npm run mobile`.

## Important Routes

### Backend

- API root: `http://localhost:5000`
- Swagger docs: `http://localhost:5000/docs`

### Website

- Customer website: `http://localhost:3000`

### Admin

- Admin dashboard: `http://localhost:3001`

## Future-Ready Areas

The current codebase is structured so these can be added later without reworking the core booking flow:

- Online payments
- QR ticket scanning
- SMS and email notifications
- Seat hold timers
- Loyalty and coupons
- Food ordering
