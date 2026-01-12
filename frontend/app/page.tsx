"use client"
import Image from "next/image";
import { useEffect, useState } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

export default function HomePage() {
  const [location, setLocation] = useState<Location | null>(null);
  useEffect(() => {
    fetch("/api/location")
      .then(res => {
        if (!res.ok) throw new Error("Greška pri dohvaćanju lokacije");
        return res.json();
      })
      .then(setLocation)
      .catch(console.error);
  }, []);

  if (!location) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        Učitavanje lokacije…
      </div>
    );
  }
  const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`;
  console.log(mapUrl);
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
        {/* Lijeva slika - hotel izvana */}
        <div className="relative w-full h-[500px]">
          <Image
            src="/bordo izvana hotel.png"
            alt="Hotel izvana"
            fill
            className="object-cover rounded-2xl shadow-lg hover:scale-101"
          />
        </div>

        {/* Desna kolona - soba + bazen */}
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
