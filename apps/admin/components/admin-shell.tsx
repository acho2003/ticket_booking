"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AdminSidebar } from "./admin-sidebar";
import { getAdminToken } from "../lib/api";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isLoginPage = pathname === "/login";

  useEffect(() => {
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
      <main className="main">{children}</main>
    </div>
  );
}
