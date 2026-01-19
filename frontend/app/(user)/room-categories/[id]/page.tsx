"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface RoomCategory {
  id: number;
  name: string;
  unitsNumber: number;
  capacity: number;
  twinBeds: boolean;
  price: number;
  checkInTime: string;
  checkOutTime: string;
}

export default function RoomCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<RoomCategory | null>(null);
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/room-categories/${id}`);
        if (!res.ok) throw new Error("Greška pri dohvaćanju kategorije");
        const data = await res.json();
        setCategory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  if (loading || !category) {
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
        <h1 style={{ marginBottom: "10px", fontSize: "1.8rem" }}>
          {category.name}
        </h1>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Kapacitet:</strong> {category.capacity} osobe
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Broj jedinica:</strong> {category.unitsNumber}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Tip kreveta:</strong>{" "}
          {category.twinBeds ? "Odvojeni (Twin)" : "Bračni"}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Cijena noćenja:</strong> {category.price} €
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <strong>Check-in / Check-out:</strong>{" "}
          {category.checkInTime.slice(0, 5)} / {category.checkOutTime.slice(0, 5)}
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
          }}
        >
          ← Natrag
        </button>
      </div>
    </div>
  );
}
