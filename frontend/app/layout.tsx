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

const hasRole = (user: any, roleName: "STAFF" | "ADMIN") => {
  if (!user) return false;
  if (typeof user.role === "string") {
    return user.role.toUpperCase() === roleName;
  }
  if (Array.isArray(user.roles)) {
    return user.roles.some((r: any) => r?.name?.toUpperCase() === roleName);
  }
  if (Array.isArray(user.authorities)) {
    return user.authorities.includes(roleName);
  }
  return false;
};

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

  const isAdmin = hasRole(user, "ADMIN");
  const isStaff = hasRole(user, "STAFF");

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
      city: user.city || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
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
    { name: "Rezervacije", href: `${prefix}/reservations`, icon: Calendar },
    {
      name: "Kategorije soba",
      href: `${prefix}/room-categories`,
      icon: Layers,
    },
    { name: "Članci", href: `${prefix}/articles`, icon: FileText },
    { name: "FAQ", href: `${prefix}/faq`, icon: HelpCircle },
  ];

  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${poppins.variable} bg-black text-white flex min-h-screen`}
      >
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

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
          <div className="lg:hidden absolute top-4 right-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="bg-transparent border-none text-white/70 hover:text-white cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

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
              <h1 className="text-xl font-bold tracking-widest uppercase font-playfair text-white">
                Quantum Hotel
              </h1>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 no-underline transition-colors"
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {user && (
                <>
                  {isStaff && (
                    <Link
                      href="/staff"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white no-underline hover:bg-white/5 transition-colors"
                    >
                      <Users size={18} />
                      <span className="text-sm font-medium">Staff panel</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white no-underline hover:bg-white/5 transition-colors"
                    >
                      <BarChart3 size={18} />
                      <span className="text-sm font-medium">Admin panel</span>
                    </Link>
                  )}
                </>
              )}
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
                      unoptimized
                    />
                    <span className="text-sm font-semibold truncate text-white">
                      {user.firstName}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      openEditProfile();
                      setSidebarOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-white/60 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
                  >
                    <UserCircle size={18} /> Profil
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-white/60 hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors"
                  >
                    <Trash2 size={18} /> Obriši račun
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 bg-transparent border-none cursor-pointer font-bold transition-colors"
                    style={{ color: luxuryGold }}
                  >
                    <LogOut size={18} /> Odjava
                  </button>
                </>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-white/60 no-underline hover:text-white transition-colors"
                  >
                    <UserCircle size={18} /> Prijava
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-white/60 no-underline hover:text-white transition-colors"
                  >
                    <FileText size={18} /> Registracija
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </aside>

        <main className="flex-1 bg-black">
          <div className="lg:hidden p-4 border-b border-white/5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-transparent border-none text-white cursor-pointer"
            >
              <Menu size={28} />
            </button>
          </div>
          <div className="p-4 lg:p-10">{children}</div>
        </main>

        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] p-8 rounded-xl w-full max-w-md border border-[#D4AF37]/20 shadow-2xl text-white">
              <h2 className="text-2xl font-bold mb-6 font-playfair">
                Uredi profil
              </h2>
              <form onSubmit={handleEditProfile} className="space-y-4">
                <input
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-[#D4AF37]/50"
                  placeholder="Ime"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
                <input
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-[#D4AF37]/50"
                  placeholder="Prezime"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
                <input
                  type="email"
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-[#D4AF37]/50"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-[#D4AF37]/50"
                  placeholder="Grad"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <input
                  type="date"
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-[#D4AF37]/50"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />
                

                <select className="w-full p-3 rounded bg-black border border-white/10 text-white outline-none focus:border-[#D4AF37]/50 hover:bg-gray-800"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="" className="bg-black text-white">
                  Odaberi spol
                </option>
                <option value="MALE" className="bg-black text-white">
                  Muško
                </option>
                <option value="FEMALE" className="bg-black text-white">
                  Žensko
                </option>
                <option value="OTHER" className="bg-black text-white">
                  Ostalo
                </option>
              </select>

                
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 rounded text-white/50 bg-transparent border-none cursor-pointer hover:text-white"
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
