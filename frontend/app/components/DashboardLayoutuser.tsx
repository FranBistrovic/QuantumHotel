"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Calendar,
  UserCircle,
  Home,
  Layers,
  Package,
  FileText,
  HelpCircle,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  Trash2,
} from "lucide-react";


type Role = "user" | "staff" | "admin";

const hasRole = (user: any, roleName: "STAFF" | "ADMIN") => {
  if (!user) return false;
  if (typeof user.role === "string") return user.role.toUpperCase() === roleName;
  if (Array.isArray(user.roles)) return user.roles.some((r: any) => r?.name?.toUpperCase() === roleName);
  if (Array.isArray(user.authorities)) return user.authorities.includes(roleName);
  return false;
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    dateOfBirth: "",
    gender: "",
  });

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  const role: Role = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/staff")
    ? "staff"
    : "user";

  const prefix =
    role === "admin" ? "/admin" : role === "staff" ? "/staff" : "";

  const isAdmin = hasRole(user, "ADMIN");
  const isStaff = hasRole(user, "STAFF");

  const navigation = [
    { name: "Rezervacije", href: `${prefix}/reservations`, icon: Calendar },
    ...(role === "admin" || role === "staff" ? [{ name: "Sobe", href: `${prefix}/rooms`, icon: Home }] : []),
    { name: "Kategorije soba", href: `${prefix}/room-categories`, icon: Layers },
    { name: "Dodaci", href: `${prefix}/addons`, icon: Package },
    { name: "Članci", href: `${prefix}/articles`, icon: FileText },
    { name: "FAQ", href: `${prefix}/faq`, icon: HelpCircle },
  ];

  if (role === "admin") {
    navigation.push(
      { name: "Korisnici", href: "/admin/users", icon: Users },
      { name: "Statistika", href: "/admin/stats", icon: BarChart3 },
      { name: "Location", href: "/admin/location", icon: Package }
    );
  }

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ Želite li trajno obrisati račun?")) return;
    const res = await fetch("/api/users/me", { method: "DELETE", credentials: "include" });
    if (res.status === 204) window.location.href = "/";
  };

  const openEditProfile = () => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      city: user.city || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      gender: user.gender || "",
    });
    setIsEditing(true);
    setSidebarOpen(false);
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const body: any = {};
    if (form.firstName !== user.firstName) body.firstName = form.firstName;
    if (form.lastName !== user.lastName) body.lastName = form.lastName;
    if (form.email !== user.email) body.email = form.email;
    if (form.city !== user.city) body.city = form.city;
    if (form.dateOfBirth && form.dateOfBirth !== user.dateOfBirth?.split("T")[0]) body.dateOfBirth = form.dateOfBirth;
    if (form.gender !== user.gender) body.gender = form.gender;

    if (Object.keys(body).length === 0) {
      setIsEditing(false);
      return;
    }

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 409) {
      alert("Email ili korisničko ime već postoji.");
      return;
    }
    if (!res.ok) {
      alert("Greška pri spremanju profila.");
      return;
    }

    const updated = await res.json();
    setUser(updated);
    setIsEditing(false);
    alert("Profil je uspješno ažuriran.");
  };

  return (
    <div className="dashboard-container">
      {/* MOBILE TOGGLE */}
      <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? "open" : ""}`} style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #2d0a0e 100%)", borderRight: "1px solid rgba(225, 29, 72, 0.2)", display: "flex", flexDirection: "column" }}>
        {/* HEADER */}
        <div className="sidebar-header" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "30px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", position: "relative" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", textAlign: "center" }}>
            
            <img
              src="/crvenkasto_bordo_logo.png"
              alt="Quantum Hotel Logo"
              width={90}
              height={90}
              style={{ marginBottom: "12px", objectFit: "contain",justifySelf: "center", borderRadius:"50%" }}
            />
            
            <h1 style={{ margin: 0, fontSize: "1.4rem", letterSpacing: "2px", fontWeight: "700", cursor: "pointer" }}>Quantum Hotel</h1>
{pathname !== "/" && (
  <span
    style={{fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.3)",display: "block",marginTop: "4px",textTransform: "uppercase",letterSpacing: "1px",}}
  > ← Natrag na početnu </span>
)}
          </Link>
          <button className="mobile-menu-close" onClick={() => setSidebarOpen(false)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "white", cursor: "pointer" }}>
            <X size={24} />
          </button>
        </div>

        {/* NAV */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "25px 0 15px 0", textAlign: "center" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: "600", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.4)", borderBottom: "1px solid rgba(225, 29, 72, 0.3)", paddingBottom: "4px", display: "inline-block" }}>
              {role === "admin" ? "Administrator" : role === "staff" ? "Osoblje sustava" : "Korisnik"}
            </span>
          </div>

          <div style={{ marginTop: "15px", padding: "0 12px" }}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)} className={`sidebar-link ${isActive ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", transition: "all 0.2s ease", marginBottom: "4px", color: isActive ? "#fff" : "rgba(255, 255, 255, 0.7)", borderLeft: isActive ? "3px solid #e11d48" : "3px solid transparent", textDecoration: "none" }}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? "#e11d48" : "inherit" }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: isActive ? 600 : 400 }}>{item.name}</span>
                </Link>
              );
            })}

            <hr style={{ border: "0.5px solid rgba(255,255,255,0.2)", margin: "10px 0" }} />

            {user && isStaff && <Link href="/staff" className="sidebar-link" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "rgba(255,255,255,0.7)", marginBottom: "4px", textDecoration: "none" }}><Users size={18} /> Staff panel</Link>}
            {user && isAdmin && <Link href="/admin" className="sidebar-link" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "rgba(255,255,255,0.7)", marginBottom: "4px", textDecoration: "none" }}><BarChart3 size={18} /> Admin panel</Link>}

            {user ? (
              <>
                <div className="sidebar-link" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", marginBottom: "4px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "1px solid #e11d48", flexShrink: 0 }}>
                    <Image
                      src={user?.imageUrl?.startsWith("http") ? user.imageUrl : user?.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${user.imageUrl}` : "/default-avatar.jpg"}
                      alt="Avatar"
                      width={32}
                      height={32}
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.firstName}
                  </span>
                </div>

                <button className="sidebar-link" onClick={openEditProfile} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "rgba(255,255,255,0.7)", marginBottom: "4px", background: "transparent", border: "none", cursor: "pointer" }}>
                  <UserCircle size={18} /> Profil
                </button>
                <button className="sidebar-link" onClick={handleDeleteAccount} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "rgba(255,255,255,0.7)", marginBottom: "4px", background: "transparent", border: "none", cursor: "pointer" }}>
                  <Trash2 size={18} /> Obriši račun
                </button>
                <button className="sidebar-link" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "#e11d48", marginBottom: "4px", background: "transparent", border: "none", cursor: "pointer" }}>
                  <LogOut size={18} /> Odjava
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="sidebar-link" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "rgba(255,255,255,0.7)", marginBottom: "4px", textDecoration: "none" }}>
                  <UserCircle size={18} /> Prijava
                </Link>
                <Link href="/register" className="sidebar-link" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", color: "rgba(255,255,255,0.7)", marginBottom: "4px", textDecoration: "none" }}>
                  <FileText size={18} /> Registracija
                </Link>
              </>
            )}
          </div>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="dashboard-main" style={{ flex: 1, backgroundColor: "#000000", minHeight: "100vh" }}>
        {children}
      </main>

      {/* MODAL EDIT PROFILA*/}

      {isEditing && (
  <div
    className="modal-overlay fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onClick={() => setIsEditing(false)}
  >
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 400,
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 32,
        border: "2px solid #e11d48",
        boxShadow: "0 0 20px rgba(225,29,72,0.5)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "white" }}>Uredi profil</h2>
        <button
          onClick={() => setIsEditing(false)}
          style={{ background: "transparent", border: "none", color: "white", fontSize: 24, cursor: "pointer" }}
        >
          ×
        </button>
      </div>

      {/* BODY / FORM */}
      <div className="modal-body">
        <form onSubmit={handleEditProfile} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            placeholder="Ime"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "#111",
              color: "white",
            }}
          />
          <input
            placeholder="Prezime"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "#111",
              color: "white",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "#111",
              color: "white",
            }}
          />
          <input
            placeholder="Grad"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "#111",
              color: "white",
            }}
          />
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "#111",
              color: "white",
            }}
          />
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "#111",
              color: "white",
            }}
          >
            <option value="">Odaberi spol</option>
            <option value="MALE">Muško</option>
            <option value="FEMALE">Žensko</option>
            <option value="OTHER">Ostalo</option>
          </select>

          {/* FOOTER / BUTTONS */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "transparent",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                cursor: "pointer",
              }}
            >
              Odustani
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#e11d48",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
              }}
            >
              Spremi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
