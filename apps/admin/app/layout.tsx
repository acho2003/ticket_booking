import "./globals.css";

import type { ReactNode } from "react";

import { AdminShell } from "../components/admin-shell";

export const metadata = {
  title: "Bhutan Movie Booking Admin",
  description: "Manage theatres, showtimes, seats, and bookings."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
