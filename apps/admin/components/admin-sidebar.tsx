"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAdminToken } from "../lib/api";

const NAV_SECTIONS = [
  {
    label: "Tonight",
    links: [
      { href: "/",          label: "Overview"      },
      { href: "/showtimes", label: "Showtimes"     },
      { href: "/bookings",  label: "Bookings"      },
      { href: "/seats",     label: "Seat Layouts"  }
    ]
  },
  {
    label: "Cinema setup",
    links: [
      { href: "/movies",      label: "Movies"       },
      { href: "/theatres",    label: "Theatres"     },
      { href: "/screens",     label: "Screens"      },
      { href: "/pricing",     label: "Pricing"      },
      { href: "/reports",     label: "Reports"      },
      { href: "/admin-users", label: "Admin Users"  }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="sidebar">
      {/* Brand */}
      <Link href="/" className="sidebar-brand">
        <span className="admin-mark">
          <img src="/movi-logo.png" alt="Movi logo" />
        </span>
        <div>
          <div className="sidebar-name">Movi</div>
          <div className="sidebar-role">Admin</div>
          <div className="sidebar-powered">Powered by CUDIS SoftLab</div>
        </div>
      </Link>

      <div className="sidebar-shortcuts">
        <a className="sidebar-shortcut" href="/bookings">Counter desk</a>
        <a className="sidebar-shortcut secondary" href="/showtimes">Open sales</a>
      </div>

      {/* Nav */}
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <div className="sidebar-section-label">{section.label}</div>
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div className="sidebar-footer">
        <a className="nav-link" href="http://localhost:3000" target="_blank" rel="noreferrer">
          Customer Site
        </a>
        <button
          className="btn ghost sm"
          style={{ width: "100%", marginTop: 8, justifyContent: "center" }}
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

