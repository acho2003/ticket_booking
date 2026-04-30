"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AdminSidebar } from "./admin-sidebar";
import { getAdminToken } from "../lib/api";

const QUICK_ACTIONS = [
  { href: "/bookings", label: "Counter check" },
  { href: "/showtimes", label: "Open show" },
  { href: "/seats", label: "Hall layout" },
  { href: "/movies", label: "New title" }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [todayLabel, setTodayLabel] = useState("");
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    setTodayLabel(
      new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short" }).format(new Date())
    );

    const token = getAdminToken();
    const authenticated = Boolean(token);

    setIsAuthenticated(authenticated);

    if (!authenticated && !isLoginPage) {
      router.replace("/login");
      return;
    }

    if (authenticated && isLoginPage) {
      router.replace("/");
      return;
    }

    setIsReady(true);
  }, [isLoginPage, router]);

  if (!isReady) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-card">
          <strong>Checking admin session</strong>
          <p className="muted">Hang tight while we route you to the right place.</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <main className="main auth-main">{children}</main>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="main">
        <div className="admin-topbar">
          <div>
            <div className="admin-topbar-kicker">Movi operations desk</div>
            <div className="admin-topbar-title">Keep the hall, showtimes, and counter in sync.</div>
            <div className="admin-topbar-meta">{todayLabel} - Powered by CUDIS SoftLab</div>
          </div>
          <div className="admin-topbar-actions">
            {QUICK_ACTIONS.map((action) => (
              <a key={action.href} className="quick-chip" href={action.href}>
                {action.label}
              </a>
            ))}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
