"use client";

import { useState } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus } from "lucide-react";

interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  isCleaned: boolean;
  underMaintenance: boolean;
  categoryId: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<Room> | null>(null);

  const itemsPerPage = 10;

  const filteredData = rooms.filter((r) =>
    r.roomNumber.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSave = () => {
    if (formData) {
      if (formData.id) {
        setRooms(
          rooms.map((r) => (r.id === formData.id ? (formData as Room) : r))
        );
      } else {
        const newRoom = { ...formData, id: Date.now() } as Room;
        setRooms([newRoom, ...rooms]);
      }
      setFormData(null);
    }
  };

  const columns: Column<Room>[] = [
    { key: "roomNumber", label: "Broj sobe", sortable: true },
    { key: "floor", label: "Kat", sortable: true },
    {
      key: "isCleaned",
      label: "Čišćenje",
      render: (v) => (
        <span className={`status-badge ${v ? "confirmed" : "pending"}`}>
          {v ? "Čisto" : "Prljavo"}
        </span>
      ),
    },
    {
      key: "underMaintenance",
      label: "Održavanje",
      render: (v) => (
        <span className={`status-badge ${v ? "rejected" : "confirmed"}`}>
          {v ? "Kvar" : "Ispravno"}
        </span>
      ),
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Upravljanje sobama</h1>
        <button
          className="btn-primary"
          onClick={() =>
            setFormData({
              roomNumber: "",
              floor: 1,
              isCleaned: true,
              underMaintenance: false,
              categoryId: 1,
            })
          }
        >
          <Plus className="icon-small" /> Dodaj sobu
        </button>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pretraži po broju sobe..."
      />

      <DataTable
        data={paginatedData}
        columns={columns}
        onEdit={(row) => setFormData(row)}
        onDelete={(row) => {
          if (confirm(`Obriši sobu ${row.roomNumber}?`)) {
            setRooms(rooms.filter((r) => r.id !== row.id));
          }
        }}
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
        title={formData?.id ? "Uredi sobu" : "Nova soba"}
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
            <div className="form-group">
              <label>Broj sobe</label>
              <input
                className="input-field"
                value={formData.roomNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
              />
            </div>
            <div className="form-grid-two-columns">
              <div className="form-group">
                <label>Kat</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.floor || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label>Kategorija (ID)</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.categoryId || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="form-grid-two-columns">
              <div className="form-group">
                <label>Status čišćenja</label>
                <select
                  className="input-field"
                  value={formData.isCleaned ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isCleaned: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Čisto</option>
                  <option value="false">Prljavo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Održavanje</label>
                <select
                  className="input-field"
                  value={formData.underMaintenance ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      underMaintenance: e.target.value === "true",
                    })
                  }
                >
                  <option value="false">Ispravno</option>
                  <option value="true">U kvaru</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
