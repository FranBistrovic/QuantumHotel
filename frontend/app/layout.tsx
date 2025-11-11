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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/user/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
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

            <Link href="/" className="block hover:text-white">🏠 Početna</Link>
            <Link href="/booking" className="block hover:text-white">📅 Rezervacija</Link>

            {!user && (
              <>
                <Link href="/login" className="block hover:text-white">🔑 Prijava</Link>
                <Link href="/register" className="block hover:text-white">📝 Registracija</Link>
              </>
            )}

            <Link href="/faq" className="block hover:text-white">❓ Česta pitanja</Link>
            <Link href="/articles" className="block hover:text-white">📰 Članci</Link>

            {user && (
              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-[#d5a853] items-start">
                {/* Avatar + Name */}
                <div className="flex items-center space-x-3">
                  <Image
                    src={
                      user.imageUrl
                        ? `http://localhost:8080${user.imageUrl}`
                        : "/default-avatar.jpg"
                    }
                    alt="Avatar"
                    width={45}
                    height={45}
                    unoptimized
                    className="rounded-full border border-[#d5a853] object-cover"
                  />
                  <span className="text-lg">{user.firstName} {user.lastName}</span>
                </div>

                {/* Logout Button (now left aligned) */}
                <button
                  onClick={handleLogout}
                  className="text-[#d5a853] hover:text-white cursor-pointer transition"
                >
                  🚪 Odjava
                </button>
              </div>
            )}

          </nav>


        </aside>

        {/* Main content */}
        <main className="flex-1 p-10">{children}</main>
      </body>
    </html>
  );
}
