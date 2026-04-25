"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAdminToken } from "../lib/api";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/movies", label: "Movies" },
  { href: "/theatres", label: "Theatres" },
  { href: "/screens", label: "Screens" },
  { href: "/seats", label: "Seat Editor" },
  { href: "/showtimes", label: "Showtimes" },
  { href: "/pricing", label: "Pricing" },
  { href: "/bookings", label: "Bookings" },
  { href: "/reports", label: "Reports" },
  { href: "/admin-users", label: "Admin Users" },
  { href: "/login", label: "Login" }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="admin-mark">BMB</span>
        <span>
          <strong>Bhutan Movie Booking</strong>
          <small>Super admin and theatre admin dashboard</small>
        </span>
      </Link>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href ? "active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-note">
          <strong>Counter-first flow</strong>
          <small>Manage bookings, pricing, screens, and theatre operations from one place.</small>
        </div>

        <button
          className="btn secondary"
          onClick={() => {
            clearAdminToken();
            router.push("/login");
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
