import Image from "next/image";

export default function HomePage() {
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
            className="object-cover rounded-2xl shadow-lg"
          />
        </div>

        {/* Desna kolona - soba + bazen */}
        <div className="grid grid-rows-2 gap-6">
          <div className="relative w-full h-[245px]">
            <Image
              src="/bordo soba.png"
              alt="Soba"
              fill
              className="object-cover rounded-2xl shadow-lg"
            />
          </div>
          <div className="relative w-full h-[245px]">
            <Image
              src="/bazeni.png"
              alt="Bazen"
              fill
              className="object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div>
        <h3 className="text-2xl font-semibold text-[#800020]">Naša lokacija</h3>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2781.610315863859!2d15.969584815822903!3d45.801278779106236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4765d68af8fe543f%3A0x1a207fe4decb723!2sFakultet%20elektrotehnike%20i%20ra%C4%8Dunarstva%20(FER)!5e0!3m2!1sen!2shr!4v1731358500000"
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
