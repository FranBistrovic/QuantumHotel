"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Modal } from "../../../components/Modal";

interface Reservation {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  room: {
    roomNumber: string;
  } | null;
  dateFrom: string;
  dateTo: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  totalPrice: number;
}

export default function ReservationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 GET /api/reservations/{id}
  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReservation(data);
        setFormData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // 🔹 PATCH /api/reservations/{id}
  const handleSave = async () => {
    if (!formData || formData.status !== "PENDING") return;

    try {
      await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: formData.user,
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo,
          totalPrice: formData.totalPrice,
          room: formData.room,
        }),
      });

      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="dashboard-main">Učitavanje...</div>;
  }

  if (!reservation || !formData) {
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
              <label>Ime</label>
              <input
                className="input-field"
                disabled={!isEditable}
                value={formData.user.firstName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    user: { ...formData.user, firstName: e.target.value },
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Prezime</label>
              <input
                className="input-field"
                disabled={!isEditable}
                value={formData.user.lastName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    user: { ...formData.user, lastName: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="form-grid-two-columns">
            <div className="form-group">
              <label>Dolazak</label>
              <input
                type="date"
                className="input-field"
                disabled={!isEditable}
                value={formData.dateFrom}
                onChange={(e) =>
                  setFormData({ ...formData, dateFrom: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Odlazak</label>
              <input
                type="date"
                className="input-field"
                disabled={!isEditable}
                value={formData.dateTo}
                onChange={(e) =>
                  setFormData({ ...formData, dateTo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <input
              className="input-field"
              disabled
              value={reservation.status}
            />
          </div>

          <div className="form-group">
            <label>Ukupni iznos (€)</label>
            <input
              type="number"
              className="input-field"
              disabled
              value={formData.totalPrice}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
