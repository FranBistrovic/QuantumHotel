"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Modal } from "../../../components/Modal";

interface Reservation {
  id: number;
  dateFrom: string;
  dateTo: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";

  categoryName: string;
  categoryId: number;
  categoryPrice: number;

  unitNumber: number | null;

  amenities: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
}


export default function ReservationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 GET /api/reservations/{id}
  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then(res => res.json())
      .then(setReservation)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);


  // 🔹 PATCH /api/reservations/{id}
  const handleSave = async () => {
    if (!reservation || reservation.status !== "PENDING") return;

    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateFrom: reservation.dateFrom,
        dateTo: reservation.dateTo,
      }),
    });

    router.back();
  };


  if (loading) {
    return <div className="dashboard-main">Učitavanje...</div>;
  }

  if (!reservation) {
    return <div className="dashboard-main">Rezervacija nije pronađena</div>;
  }

  const isEditable = reservation.status === "PENDING";

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">
          Rezervacija #{reservation.id}
        </h1>
      </div>

      <Modal
        isOpen={true}
        onClose={() => router.back()}
        title="Detalji rezervacije"
        footer={
          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={() => router.back()}>
              Natrag
            </button>

            {isEditable && (
              <button className="btn-primary" onClick={handleSave}>
                Spremi promjene
              </button>
            )}
          </div>
        }
      >
        <div className="form-vertical-layout">
          <div className="form-grid-two-columns">
            <div className="form-group">
              <label>Soba</label>
              <input
                className="input-field"
                disabled
                value={reservation.unitNumber ?? "Nije dodijeljena"}
              />
            </div>

            <div className="form-group">
              <label>Kategorija</label>
              <input
                className="input-field"
                disabled
                value={reservation.categoryName}
              />
            </div>
          </div>

          <div className="form-grid-two-columns">
            <div className="form-group">
              <label>Dolazak</label>
              <input
                type="date"
                className="input-field"
                disabled={reservation.status !== "PENDING"}
                value={reservation.dateFrom}
                onChange={e =>
                  setReservation({ ...reservation, dateFrom: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Odlazak</label>
              <input
                type="date"
                className="input-field"
                disabled={reservation.status !== "PENDING"}
                value={reservation.dateTo}
                onChange={e =>
                  setReservation({ ...reservation, dateTo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <input className="input-field" disabled value={reservation.status} />
          </div>

          <div className="form-group">
            <label>Osnovna cijena (€)</label>
            <input
              type="number"
              className="input-field"
              disabled
              value={reservation.categoryPrice}
            />
          </div>

          <div className="form-group">
            <label>Dodatne usluge</label>
            <ul className="text-sm">
              {reservation.amenities?.length ? (
                reservation.amenities.map(a => (
                  <li key={a.id}>
                    {a.name} × {a.quantity} ({a.price} €)
                  </li>
                ))
              ) : (
                <li>Nema dodatnih usluga</li>
              )}

            </ul>
          </div>
        </div>

      </Modal>
    </div>
  );
}
