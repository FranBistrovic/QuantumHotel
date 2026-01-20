"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Addon {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function AddonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [addon, setAddon] = useState<Addon | null>(null);

  useEffect(() => {
    fetch(`/api/addons/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Dodatak nije pronađen");
        return res.json();
      })
      .then(setAddon)
      .catch(console.error);
  }, [id]);

  if (!addon) {
    return <div className="dashboard-main">Učitavanje...</div>;
  }

  return (
    <div className="dashboard-main" style={{ padding: "20px" }}>
      <div
        style={{
          background: "#1a1a1a",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          maxWidth: "600px",
          margin: "0 auto",
          color: "#fff",
        }}
      >
        <h1 style={{ marginBottom: "10px", fontSize: "1.8rem" }}>{addon.name}</h1>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Cijena (€):</strong> {addon.price}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Opis:</strong> {addon.description}
        </div>

        <button
          onClick={() => router.back()}
          style={{
            background: "#e11d48",
            color: "#fff",
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            marginTop: "15px",
          }}
        >
          ← Natrag
        </button>
      </div>
    </div>
  );
}
