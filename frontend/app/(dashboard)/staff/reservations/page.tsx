"use client";

import { useState } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus } from "lucide-react";

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

const statusLabels = {
  PENDING: "na čekanju",
  CONFIRMED: "potvrđeno",
  REJECTED: "odbijeno",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<Reservation> | null>(null);

  const itemsPerPage = 10;

  // --- Filtriranje podataka ---
  const filteredData = reservations.filter((res) => {
    const fullName = `${res.user?.firstName || ""} ${
      res.user?.lastName || ""
    }`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      res.room?.roomNumber.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Paginacija ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Logika za spremanje (Dodavanje i Uređivanje) ---
  const handleSave = () => {
    if (formData) {
      if (formData.id) {
        // Ažuriranje postojeće
        setReservations((prev) =>
          prev.map((r) =>
            r.id === formData.id ? (formData as Reservation) : r
          )
        );
      } else {
        // Dodavanje nove
        const newRes: Reservation = {
          id: Date.now(),
          user: formData.user || {
            firstName: "Novi",
            lastName: "Gost",
            email: "",
          },
          room: formData.room || null,
          dateFrom: formData.dateFrom || new Date().toISOString().split("T")[0],
          dateTo: formData.dateTo || new Date().toISOString().split("T")[0],
          status: formData.status || "PENDING",
          totalPrice: formData.totalPrice || 0,
        };
        setReservations((prev) => [newRes, ...prev]);
      }
      setFormData(null);
    }
  };

  const handleConfirm = (id: number) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "CONFIRMED" } : r))
    );
  };

  const handleReject = (id: number) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
    );
  };

  const columns: Column<Reservation>[] = [
    {
      label: "Gost",
      key: "user",
      render: (_, row) => `${row.user?.firstName} ${row.user?.lastName}`,
      sortable: true,
    },
    {
      label: "Soba",
      key: "room",
      render: (room) => room?.roomNumber || "Nije dodijeljena",
    },
    { key: "dateFrom", label: "Dolazak", sortable: true },
    { key: "dateTo", label: "Odlazak", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (value: "PENDING" | "CONFIRMED" | "REJECTED") => (
        <span className={`status-badge ${value.toLowerCase()}`}>
          {statusLabels[value]}
        </span>
      ),
    },
    {
      key: "totalPrice",
      label: "Iznos",
      render: (value) => `${value} €`,
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Rezervacije</h1>
        <button
          onClick={() =>
            setFormData({
              dateFrom: new Date().toISOString().split("T")[0],
              dateTo: new Date().toISOString().split("T")[0],
              status: "PENDING",
              totalPrice: 0,
              user: { firstName: "", lastName: "", email: "" },
              room: null,
            })
          }
          className="btn-primary"
        >
          <Plus className="icon-small" /> Dodaj rezervaciju
        </button>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pretraži po gostu ili sobi..."
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-input select-height-fixed"
        >
          <option value="all">Svi statusi</option>
          <option value="PENDING">Na čekanju</option>
          <option value="CONFIRMED">Potvrđeno</option>
          <option value="REJECTED">Odbijeno</option>
        </select>
      </FilterBar>

      <DataTable
        data={paginatedData}
        columns={columns}
        onEdit={(row) => setFormData(row)}
        onConfirm={(row) => handleConfirm(row.id)}
        onReject={(row) => handleReject(row.id)}
        className="data-table"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
      />

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id ? "Uredi rezervaciju" : "Nova rezervacija"}
        footer={
          <div className="modal-footer-actions">
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
            <div className="form-grid-two-columns">
              <div className="form-group">
                <label>Ime</label>
                <input
                  className="input-field"
                  placeholder="Ime"
                  value={formData.user?.firstName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user: { ...formData.user!, firstName: e.target.value },
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Prezime</label>
                <input
                  className="input-field"
                  placeholder="Prezime"
                  value={formData.user?.lastName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user: { ...formData.user!, lastName: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="form-grid-two-columns">
              <div className="form-group">
                <label>Dolazak</label>
                <input
                  className="input-field"
                  type="date"
                  value={formData.dateFrom || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dateFrom: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Odlazak</label>
                <input
                  className="input-field"
                  type="date"
                  value={formData.dateTo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dateTo: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <option value="PENDING">na čekanju</option>
                <option value="CONFIRMED">potvrđeno</option>
                <option value="REJECTED">odbijeno</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ukupni iznos (€)</label>
              <input
                className="input-field"
                type="number"
                value={formData.totalPrice || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalPrice: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
