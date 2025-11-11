"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    if (response.ok) {
      setMessage("✅ Uspješna registracija!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
    } else {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        setMessage("❌ Greška: " + (json.error || json.message || "Nepoznata greška."));
      } catch {
        setMessage("❌ Greška: " + text);
      }
    }
  } catch (err) {
    setMessage("⚠️ Server nije dostupan.");
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-[#800020]">
      <h1 className="text-3xl font-bold mb-6">Registracija</h1>
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-md rounded-2xl p-8 w-80 border border-[#d4af37]"
      >
        <input
          type="text"
          placeholder="Ime"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Prezime"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 border rounded-lg"
          required
        />
        <button
          type="submit"
          className="w-full bg-[#800020] text-[#d4af37] py-2 rounded-lg hover:opacity-90 transition"
        >
          Registriraj se
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
