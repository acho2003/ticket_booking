"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearStoredToken, getStoredToken } from "../lib/api";

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getStoredToken()));
  }, []);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">BMB</span>
          <span>
            <span className="brand-title">Bhutan Movie Booking</span>
            <span className="brand-subtitle">Reserve seats online. Pay at the counter.</span>
          </span>
        </Link>

        <nav className="nav-links">
          <Link href="/movies">Movies</Link>
          <Link href="/theatres">Theatres</Link>
          <Link href="/showtimes">Showtimes</Link>
          <Link href="/my-bookings">My Bookings</Link>
          <a href="http://localhost:3001" className="nav-admin">Admin</a>
          {isLoggedIn ? (
            <button
              className="btn ghost"
              onClick={() => {
                clearStoredToken();
                setIsLoggedIn(false);
              }}
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="link-btn">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
