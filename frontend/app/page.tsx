"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

export default function HomePage() {
  const [location, setLocation] = useState<Location | null>(null);

  // --- KORISNIK ---
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState("");

  // --- Dohvat lokacije ---
  useEffect(() => {
    fetch("/api/location")
      .then(res => {
        if (!res.ok) throw new Error("Greška pri dohvaćanju lokacije");
        return res.json();
      })
      .then(setLocation)
      .catch(console.error);
  }, []);

  // --- Dohvat korisnika ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);

          // inicijaliziraj formu
          setCity(data.city || "");
          setDateOfBirth(data.dateOfBirth || "");
          setGender(data.gender || "");
        }
      } catch (err) {
        console.error("Greška pri fetchu korisnika:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, dateOfBirth, gender }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setMessage("✅ Podaci su spremljeni!");
      } else {
        const text = await res.text();
        setMessage("❌ Greška: " + text);
      }
    } catch {
      setMessage("⚠️ Server nije dostupan.");
    }
  };

  // --- Loading lokacije ili korisnika ---
  if (!location || loadingUser) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        Učitavanje…
      </div>
    );
  }

  // --- Ako korisnik postoji i nedostaju neki podaci → forma ---
  if (user && (!user.city || !user.dateOfBirth || !user.gender)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-[#800020]">
        <h1 className="text-3xl font-bold mb-6">
          Molimo popunite svoje podatke
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-2xl p-8 w-80 flex flex-col gap-4 border border-[#d4af37]"
        >
          <input
            type="text"
            placeholder="Grad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="date"
            placeholder="Datum rođenja"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            className="w-full p-2 border rounded-lg"
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Odaberite spol</option>
            <option value="MALE">Muški</option>
            <option value="FEMALE">Ženski</option>
            <option value="OTHER">Drugi</option>
          </select>
          <button
            type="submit"
            className="w-full bg-[#800020] text-[#d4af37] py-2 rounded-lg hover:opacity-90 transition"
          >
            Spremi
          </button>
        </form>
        {message && <p className="mt-4">{message}</p>}
      </div>
    );
  }

  // --- Inače: normalna početna stranica ---
  const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`;

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-[#800020]">
        Dobrodošli u Quantum Hotel
      </h2>
      <p className="text-lg">
        Quantum Hotel nudi spoj luksuza i modernog komfora. Smješten u samom
        srcu grada, idealno je mjesto za opuštanje, poslovne sastanke i
        stvaranje nezaboravnih uspomena u obiteljskom okruženju.
      </p>

      {/* Kontakt */}
      <div>
        <h3 className="text-2xl font-semibold text-[#800020]">Kontakt</h3>
        <p>📍 Adresa: Ulica Mira 42, Zagreb</p>
        <p>📞 Telefon: +385 1 234 5678</p>
        <p>✉️ Email: info@quantumhotel.hr</p>
      </div>

      {/* Galerija slika */}
      <div className="grid grid-cols-2 gap-6 w-full">
        <div className="relative w-full h-[500px]">
          <Image
            src="/bordo izvana hotel.png"
            alt="Hotel izvana"
            fill
            className="object-cover rounded-2xl shadow-lg hover:scale-101"
          />
        </div>

        <div className="grid grid-rows-2 gap-6">
          <div className="relative w-full h-[245px]">
            <Image
              src="/bordo soba.png"
              alt="Soba"
              fill
              className="object-cover rounded-2xl shadow-lg hover:scale-101"
            />
          </div>
          <div className="relative w-full h-[245px]">
            <Image
              src="/bazeni.png"
              alt="Bazen"
              fill
              className="object-cover rounded-2xl shadow-lg hover:scale-101"
            />
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div>
        <h3 className="text-2xl font-semibold text-[#800020]">Naša lokacija</h3>
        <iframe
          src={mapUrl}
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
