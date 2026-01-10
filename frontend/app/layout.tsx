"use client";

import "./globals.css";
import { Playfair_Display, Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

// export const metadata = {
//   title: "Quantum Hotel",
//   description: "Luxury redefined – welcome to Quantum Hotel",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  });


  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };


  const openEditProfile = () => {
    if (!user) return;
  
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
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
      alert("Greška prilikom ažuriranja profila.");
      return;
    }
  
    const updated = await res.json();
    setUser(updated);
    setIsEditing(false);
    alert("Profil je uspješno ažuriran.");
  };
  
  


  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ Želite li trajno obrisati račun? Ova akcija je nepovratna.")) return;
  
    const res = await fetch("/api/users/me", {
      method: "DELETE",
      credentials: "include",
    });
  
    if (res.status === 204) {
      window.location.href = "/";
      return;
    }
  
    alert("Došlo je do greške prilikom brisanja računa.");
  };
  





  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${poppins.variable} bg-[#faf8f5] text-gray-900 flex min-h-screen`}
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        {/* Sidebar */}
        <aside className="w-64 bg-[#46000a] text-[#d5a853] flex flex-col p-6">
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/crvenkasto bordo logo.png"
              alt="Quantum Hotel Logo"
              width={200}
              height={200}
              className="rounded-full border-2 border-[#d5a853]"
            />
            <h1
              className="mt-4 text-2xl font-bold text-center"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Quantum Hotel
            </h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-4 text-lg">
            <Link href="/" className="block hover:text-white">
              🏠 Početna
            </Link>
            <Link href="/booking" className="block hover:text-white">
              📅 Rezervacija
            </Link>

            {!user && (
              <>
                <Link href="/login" className="block hover:text-white">
                  🔑 Prijava
                </Link>
                <Link href="/register" className="block hover:text-white">
                  📝 Registracija
                </Link>
              </>
            )}

            <Link href="/faq" className="block hover:text-white">
              ❓ Česta pitanja
            </Link>
            <Link href="/articles" className="block hover:text-white">
              📰 Članci
            </Link>

            {user && (
              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-[#d5a853] items-start">
                {/* Avatar + Name */}
                <div className="flex items-center space-x-3">
                  <Image
                    src={
                      user?.imageUrl
                        ? user.imageUrl.startsWith("http")
                          ? user.imageUrl
                          : `${process.env.NEXT_PUBLIC_API_URL}${user.imageUrl}`
                        : "/default-avatar.jpg"
                    }
                    alt="Avatar"
                    width={45}
                    height={45}
                    unoptimized
                    className="rounded-full border border-[#d5a853] object-cover"
                  />
                  <span className="text-lg">
                    {user.firstName} {user.lastName}
                  </span>
                </div>

                {/* Logout Button (now left aligned) */}
                <button
                  onClick={handleLogout}
                  className="text-[#d5a853] hover:text-white cursor-pointer transition"
                >
                  🚪 Odjava
                </button>

              


                <button
                  onClick={openEditProfile}
                  className="text-[#d5a853] hover:text-white cursor-pointer transition"
                >
                  ✏️ Uredi profil
                </button>


                <button
                  onClick={handleDeleteAccount}
                  className="text-[#d5a853] hover:text-white cursor-pointer transition"
                >
                  🗑️ Obriši račun
                </button> 


              </div>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-10">{children}</main>



        {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <form onSubmit={handleEditProfile}
          className="bg-[#46000a] p-6 rounded-xl w-[360px] shadow-xl"
        >
      <h2 className="text-xl font-semibold mb-4 text-center">
        Uredi profil
      </h2>

      <input
        className="w-full mb-3 p-2 rounded border"
        placeholder="Ime"
        value={form.firstName}
        onChange={(e) =>
          setForm({ ...form, firstName: e.target.value })
        }
      />

      <input
        className="w-full mb-3 p-2 rounded border"
        placeholder="Prezime"
        value={form.lastName}
        onChange={(e) =>
          setForm({ ...form, lastName: e.target.value })
        }
      />

      <input
        type="email"
        className="w-full mb-3 p-2 rounded border"
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        className="w-full mb-4 p-2 rounded border"
        placeholder="Korisničko ime"
        value={form.username}
        onChange={(e) =>
          setForm({ ...form, username: e.target.value })
        }
      />

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 rounded bg-[#46000a] hover:bg-gray-400"
        >
          Odustani
        </button>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-[#46000a] text-[#d5a853] hover:text-white"
        >
          Spremi
        </button>
      </div>
    </form>
  </div>
)}


      </body>
    </html>
  );
}
