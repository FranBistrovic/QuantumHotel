"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

const DEFAULT_LOCATION: Location = {
  latitude: 45.815399,
  longitude: 15.966568,
};

export default function HomePage() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/location")
      .then((res) => {
        if (!res.ok) throw new Error("Greška pri dohvaćanju lokacije");
        return res.json();
      })
      .then(setLocation)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);

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

  if (!location || loadingUser) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        Učitavanje…
      </div>
    );
  }

  if (user && (!user.city || !user.dateOfBirth || !user.gender)) {
    return (
      <div className="modal-overlay3">
        <div className="modal-content3">
          <h2 className="login-title3">Dopunite svoje podatke</h2>
          <form onSubmit={handleSubmit} className="login-form3">
            <input
              type="text"
              placeholder="Grad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="login-input3"
            />
            <input
              type="date"
              placeholder="Datum rođenja"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="login-input3"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="login-input3"
            >
              <option value="">Odaberite spol</option>
              <option value="MALE">Muški</option>
              <option value="FEMALE">Ženski</option>
              <option value="OTHER">Drugi</option>
            </select>

            <button type="submit" className="login-button3">
              Spremi
            </button>

            {message && <p className="login-message3">{message}</p>}
          </form>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`;

  return (
    <div className="space-y-12 p-6">
      {/* Uvod */}
      <section className=" ">
        <h2 className="text-4xl font-bold text-[#800020] mb-4">
          Dobrodošli u Quantum Hotel
        </h2>
        <p className="text-lg text-white-800">
          Quantum Hotel nudi spoj luksuza i modernog komfora. Smješten u samom
          srcu grada, idealno je mjesto za opuštanje, poslovne sastanke i
          stvaranje nezaboravnih uspomena.
        </p>
      </section>

      {/* Kontakt */}
      <section className=" ">
        <h3 className="text-2xl font-semibold text-[#800020] mb-4">Kontakt</h3>
        <p className="text-white-800">📍 Adresa: Ulica Mira 42, Zagreb</p>
        <p className="text-white-800">📞 Telefon: +385 1 234 5678</p>
        <p className="text-white-800">✉️ Email: info@quantumhotel.hr</p>
      </section>

      {/* Galerija */}
      <section className="gallery-section">
        <h3 className="text-2xl font-semibold mb-4 text-[#800020]">Galerija</h3>
        <div className="gallery-container flex gap-6 items-stretch h-[600px]">
          <div className="gallery-large relative w-1/2 h-full rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/bordo izvana hotel.png"
              alt="Hotel izvana"
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
          <div className="gallery-small-container flex flex-col gap-6 w-1/2">
            <div className="gallery-small relative w-full h-[290px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/regular_room.png"
                alt="Soba"
                fill
                className="object-cover hover:scale-105 transition-transform"
              />
            </div>
            <div className="gallery-small relative w-full h-[290px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/bazeni.png"
                alt="Bazen"
                fill
                className="object-cover hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="">
        <h3 className="text-2xl font-semibold text-[#800020] mb-4">
          Naša lokacija
        </h3>
        <iframe
          src={mapUrl}
          width="100%"
          height="350"
          style={{ border: 0, marginBottom: "40px" }}
          allowFullScreen
          loading="lazy"
        />
      </section>
    </div>
  );
}
