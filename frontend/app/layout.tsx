"use client";

import "./globals.css";
import { Playfair_Display, Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  Home,
  Package,
  FileText,
  HelpCircle,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  UserCircle,
  Trash2,
  Layers,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    city: "",
    dateOfBirth: "",
    gender: "",
  });

  const luxuryGold = "#D4AF37";

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  const role =
    user?.role ||
    (pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/staff")
      ? "staff"
      : "user");

  const prefix = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "";

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  };

  const openEditProfile = () => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
      city: user.city || "",
      dateOfBirth: user.dateOfBirth
        ? user.dateOfBirth.split("T")[0]
        : "",
      gender: user.gender || "",
    });
    setIsEditing(true);
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const body: any = {};

    if (form.firstName !== user.firstName) body.firstName = form.firstName;
    if (form.lastName !== user.lastName) body.lastName = form.lastName;
    if (form.email !== user.email) body.email = form.email;
    if (form.username !== user.username) body.username = form.username;
    if (form.city !== user.city) body.city = form.city;

    if (
      form.dateOfBirth &&
      form.dateOfBirth !== user.dateOfBirth?.split("T")[0]
    ) {
      body.dateOfBirth = form.dateOfBirth;
    }

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

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ Želite li trajno obrisati račun?")) return;
    const res = await fetch("/api/users/me", {
      method: "DELETE",
      credentials: "include",
    });
    if (res.status === 204) window.location.href = "/";
  };

  const navigation = [
    { name: "Kategorije soba", href: `${prefix}/room-categories`, icon: Layers },
    ...(role === "admin" || role === "staff"
      ? [
          { name: "Sobe", href: `${prefix}/rooms`, icon: Home },
          { name: "Dodaci", href: `${prefix}/addons`, icon: Package },
        ]
      : []),
    { name: "Članci", href: `${prefix}/articles`, icon: FileText },
    { name: "FAQ", href: `${prefix}/faq`, icon: HelpCircle },
    ...(role === "admin"
      ? [
          { name: "Korisnici", href: "/admin/users", icon: Users },
          { name: "Statistika", href: "/admin/stats", icon: BarChart3 },
        ]
      : []),
  ];

  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${poppins.variable} bg-black text-white flex min-h-screen`}
      >
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background: "linear-gradient(180deg, #000000 0%, #3d0d14 100%)",
            borderRight: `1px solid ${luxuryGold}33`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="p-8 text-center border-b border-white/5">
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src="/crvenkasto%20bordo%20logo.png"
                  alt="Logo"
                  fill
                  priority
                  className="rounded-full border-2 border-[#D4AF37] object-cover"
                />
              </div>
              <h1 className="text-xl font-bold tracking-widest uppercase font-playfair">
                Quantum Hotel
              </h1>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all no-underline"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(212, 175, 55, 0.1)"
                        : "transparent",
                      color: isActive
                        ? luxuryGold
                        : "rgba(255, 255, 255, 0.6)",
                      borderLeft: isActive
                        ? `3px solid ${luxuryGold}`
                        : "3px solid transparent",
                    }}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 mb-4">
                    <Image
                      src={
                        user?.imageUrl?.startsWith("http")
                          ? user.imageUrl
                          : user?.imageUrl
                          ? `${process.env.NEXT_PUBLIC_API_URL}${user.imageUrl}`
                          : "/default-avatar.jpg"
                      }
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full border border-[#D4AF37]"
                    />
                    <span className="text-sm font-semibold truncate">
                      {user.firstName}
                    </span>
                  </div>

                  <button
                    onClick={openEditProfile}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-white/60 hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    <UserCircle size={18} /> Profil
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-white/60 hover:text-red-400 bg-transparent border-none cursor-pointer"
                  >
                    <Trash2 size={18} /> Obriši račun
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 bg-transparent border-none cursor-pointer font-bold"
                    style={{ color: luxuryGold }}
                  >
                    <LogOut size={18} /> Odjava
                  </button>
                </>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-4 py-2 text-white/60 no-underline hover:text-white"
                  >
                    <UserCircle size={18} /> Prijava
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-3 px-4 py-2 text-white/60 no-underline hover:text-white"
                  >
                    <FileText size={18} /> Registracija
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 bg-black">
          <div className="lg:hidden p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-transparent border-none text-white"
            >
              <Menu size={28} />
            </button>
          </div>
          <div className="p-4 lg:p-10">{children}</div>
        </main>

        {/* MODAL */}
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] p-8 rounded-xl w-full max-w-md border border-[#D4AF37]/20 shadow-2xl text-white">
              <h2 className="text-2xl font-bold mb-6 font-playfair">
                Uredi profil
              </h2>

              <form onSubmit={handleEditProfile} className="space-y-4">
                <input
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none"
                  placeholder="Ime"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />

                <input
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none"
                  placeholder="Prezime"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />

                <input
                  type="email"
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />

                <input
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none"
                  placeholder="Grad"
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                />

                <input
                  type="date"
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />

                <select
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none"
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                >
                  <option value="">Odaberi spol</option>
                  <option value="MALE">Muško</option>
                  <option value="FEMALE">Žensko</option>
                  <option value="OTHER">Ostalo</option>
                </select>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 rounded text-white/50 bg-transparent border-none cursor-pointer"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded font-bold border-none cursor-pointer"
                    style={{ backgroundColor: luxuryGold, color: "black" }}
                  >
                    Spremi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
