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

  // --- GET /api/room-categories/{id} ---
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

{/*}

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Modal } from "../../../components/Modal";
import { Plus } from "lucide-react";

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

interface ReservationForm {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  room: {
    id: number;
    name: string;
  };
  dateFrom: string;
  dateTo: string;
  status: "PENDING";
  totalPrice: number;
}

export default function RoomCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<RoomCategory | null>(null);
  const [formData, setFormData] = useState<ReservationForm | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Dohvati kategoriju ---
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

  // --- Spremi rezervaciju ---
  const handleSave = async () => {
    if (!formData) return;
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Greška pri dodavanju rezervacije");
      setFormData(null);
      alert("✅ Rezervacija dodana!");
    } catch (err) {
      console.error(err);
      alert("⚠️ Greška pri dodavanju rezervacije");
    }
  };

  if (!category) {
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
        <h1 style={{ marginBottom: "10px", fontSize: "1.8rem" }}>{category.name}</h1>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Kapacitet:</strong> {category.capacity} osobe
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Broj jedinica:</strong> {category.unitsNumber}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Tip kreveta:</strong> {category.twinBeds ? "Odvojeni (Twin)" : "Bračni"}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <strong>Cijena noćenja:</strong> {category.price} €
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <strong>Check-in / Check-out:</strong>{" "}
          {category.checkInTime.substring(0, 5)} / {category.checkOutTime.substring(0, 5)}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
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

          <button
            onClick={() =>
              setFormData({
                user: { firstName: "", lastName: "", email: "" },
                room: { id: category.id, name: category.name },
                dateFrom: new Date().toISOString().split("T")[0],
                dateTo: new Date().toISOString().split("T")[0],
                status: "PENDING",
                totalPrice: category.price, // po default cijena iz kategorije
              })
            }
            style={{
              background: "#1d4ed8",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Plus className="w-4 h-4" /> Dodaj rezervaciju
          </button>
        </div>
      </div>

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title="Nova rezervacija"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button className="btn-secondary" onClick={() => setFormData(null)}>
              Odustani
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Spremi
            </button>
          </div>
        }
      >
        {formData && (
          <div className="form-vertical-layout">
            <div className="form-group">
              <label>Ime</label>
              <input
                className="input-field"
                value={formData.user.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, user: { ...formData.user, firstName: e.target.value } })
                }
              />
            </div>
            <div className="form-group">
              <label>Prezime</label>
              <input
                className="input-field"
                value={formData.user.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, user: { ...formData.user, lastName: e.target.value } })
                }
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="input-field"
                type="email"
                value={formData.user.email}
                onChange={(e) =>
                  setFormData({ ...formData, user: { ...formData.user, email: e.target.value } })
                }
              />
            </div>
            <div className="form-grid-two-columns">
              <div className="form-group">
                <label>Dolazak</label>
                <input
                  className="input-field"
                  type="date"
                  value={formData.dateFrom}
                  onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Odlazak</label>
                <input
                  className="input-field"
                  type="date"
                  value={formData.dateTo}
                  onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <input className="input-field" value="PENDING" disabled />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

*/}
