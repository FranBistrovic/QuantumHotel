"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  Home,
  Layers,
  Package,
  FileText,
  HelpCircle,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

type Role = "user" | "staff" | "admin";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  /* -------------------------------------------------
   ROLE (AUTOMATSKI IZ URL-a)
  ------------------------------------------------- */
  const role: Role = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/staff")
    ? "staff"
    : "user";

  /* -------------------------------------------------
   PREFIX
  ------------------------------------------------- */
  const prefix =
    role === "admin" ? "/admin" : role === "staff" ? "/staff" : "";

  /* -------------------------------------------------
   NAVIGACIJA – ISTA KAO TVOJA
  ------------------------------------------------- */
  const navigation = [
    { name: "Rezervacije", href: `${prefix}/reservations`, icon: Calendar }
  ];


  if (role === "admin" || role === "staff") {
    navigation.push(
      { name: "Sobe", href: `${prefix}/rooms`, icon: Home }
    );
  }

  navigation.push(
      { name: "Kategorije soba", href: `${prefix}/room-categories`, icon: Layers },
    );

     if (role === "admin" || role === "staff") {
    navigation.push(
      { name: "Dodaci", href: `${prefix}/addons`, icon: Package }
    );
  }

   navigation.push(
    { name: "Članci", href: `${prefix}/articles`, icon: FileText },
    { name: "FAQ", href: `${prefix}/faq`, icon: HelpCircle },
    );


  /* -------------------------------------------------
   ADMIN DODACI (KAO PRIJE)
  ------------------------------------------------- */
  if (role === "admin") {
    navigation.push(
      { name: "Korisnici", href: "/admin/users", icon: Users },
      { name: "Statistika", href: "/admin/stats", icon: BarChart3 }
    );
  }

  return (
    <div className="dashboard-container">
      {/* MOBILE TOGGLE */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`dashboard-sidebar ${isSidebarOpen ? "open" : ""}`}
        style={{
          background: "linear-gradient(180deg, #1a1a1a 0%, #2d0a0e 100%)",
          borderRight: "1px solid rgba(225, 29, 72, 0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER – NE DIRANO */}
        <div
          className="sidebar-header"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
            position: "relative",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "inherit",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "1.4rem",
                letterSpacing: "2px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Quantum Hotel
            </h1>
            <span
              style={{
                fontSize: "0.7rem",
                color: "rgba(255, 255, 255, 0.3)",
                display: "block",
                marginTop: "4px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              ← Natrag na početnu
            </span>
          </Link>

          <button
            className="mobile-menu-close"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* NAV */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "25px 0 15px 0", textAlign: "center" }}>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: "600",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.4)",
                borderBottom: "1px solid rgba(225, 29, 72, 0.3)",
                paddingBottom: "4px",
                display: "inline-block",
              }}
            >
              {role === "admin"
                ? "Administrator"
                : role === "staff"
                ? "Osoblje sustava"
                : "Korisnik"}
            </span>
          </div>

          <div style={{ marginTop: "15px", padding: "0 12px" }}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    marginBottom: "4px",
                    backgroundColor: isActive
                      ? "rgba(225, 29, 72, 0.15)"
                      : "transparent",
                    color: isActive ? "#fff" : "rgba(255, 255, 255, 0.7)",
                    borderLeft: isActive
                      ? "3px solid #e11d48"
                      : "3px solid transparent",
                    textDecoration: "none",
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{ color: isActive ? "#e11d48" : "inherit" }}
                  />
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* CONTENT */}
      <main
        className="dashboard-main"
        style={{ flex: 1, backgroundColor: "#000000", minHeight: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}
