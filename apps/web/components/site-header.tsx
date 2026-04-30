"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { clearStoredToken, getStoredToken } from "../lib/api";

const NAV_LINKS = [
  { href: "/movies",    label: "Movies"     },
  { href: "/theatres",  label: "Theatres"   },
  { href: "/showtimes", label: "Showtimes"  },
  { href: "/my-bookings", label: "My Bookings" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getStoredToken()));
  }, []);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <img src="/movi-logo.png" alt="Movi logo" />
          </span>
          <span className="brand-copy">
            <span className="brand-name">Movi</span>
            <span className="brand-powered">Powered by CUDIS SoftLab</span>
          </span>
        </Link>

        <nav className="nav-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <a href="http://localhost:3001" className="nav-admin" target="_blank" rel="noreferrer">
            Admin ↗
          </a>
          {isLoggedIn ? (
            <button
              className="btn ghost sm"
              onClick={() => {
                clearStoredToken();
                setIsLoggedIn(false);
              }}
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="link-btn sm">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
