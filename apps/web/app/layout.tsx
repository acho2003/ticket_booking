import "./globals.css";

import type { ReactNode } from "react";

import { SiteHeader } from "../components/site-header";

export const metadata = {
  title: "Movi",
  description: "Reserve movie tickets online and pay at the counter with Movi."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="page-shell">
          <SiteHeader />
          <div className="grow">{children}</div>
          <footer className="footer">
            <div className="container footer-inner">
              <div>
                <div className="footer-brand">Movi</div>
                <div className="footer-copy">Reserve seats online. Pay at the counter.</div>
              </div>
              <div className="footer-copy">Powered by CUDIS SoftLab</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
