import "./globals.css";

import type { ReactNode } from "react";

import { SiteHeader } from "../components/site-header";

export const metadata = {
  title: "Bhutan Movie Booking Platform",
  description: "Reserve movie tickets in Bhutan and pay at the counter."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <SiteHeader />
          {children}
          <footer className="footer">
            <div className="container footer-inner">
              <div>
                <strong>Bhutan Movie Booking Platform</strong>
                <div className="muted">Built for mobile-first reservation and counter payment flows.</div>
              </div>
              <div className="muted">Future-ready for QR tickets, gateways, and notifications.</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
