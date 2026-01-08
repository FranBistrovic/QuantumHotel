"use client";

import { useState } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
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

export default function RoomCategoriesPage() {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<RoomCategory> | null>(null);

  const itemsPerPage = 10;

  const filteredData = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (formData) {
      if (formData.id) {
        setCategories(
          categories.map((c) =>
            c.id === formData.id ? (formData as RoomCategory) : c
          )
        );
      } else {
        setCategories([
          { ...formData, id: Date.now() } as RoomCategory,
          ...categories,
        ]);
      }
      setFormData(null);
    }
  };

  const columns: Column<RoomCategory>[] = [
    { key: "name", label: "Naziv kategorije", sortable: true },
    { key: "capacity", label: "Kapacitet", render: (v) => `${v} osobe` },
    {
      key: "twinBeds",
      label: "Kreveti",
      render: (v) => (v ? "Odvojeni" : "Bračni"),
    },
    {
      key: "price",
      label: "Cijena noćenja",
      render: (v) => `${v} €`,
      sortable: true,
    },
    {
      key: "times",
      label: "In/Out",
      render: (_, row) =>
        `${row.checkInTime.substring(0, 5)} / ${row.checkOutTime.substring(
          0,
          5
        )}`,
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Kategorije smještaja</h1>
        <button
          className="btn-primary"
          onClick={() =>
            setFormData({
              name: "",
              unitsNumber: 1,
              capacity: 2,
              twinBeds: false,
              price: 100,
              checkInTime: "14:00:00",
              checkOutTime: "11:00:00",
            })
          }
        >
          <Plus className="icon-small" /> Nova kategorija
        </button>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pretraži kategorije..."
      />

      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={(row) => setFormData(row)}
        onDelete={(row) =>
          confirm(`Obriši kategoriju ${row.name}?`) &&
          setCategories(categories.filter((c) => c.id !== row.id))
        }
        className="data-table"
      />

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id ? "Uredi kategoriju" : "Dodaj kategoriju"}
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
              <label>Naziv kategorije</label>
              <input
                className="input-field"
                placeholder="npr. Deluxe King Room"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="form-grid-two-columns">
              <div className="form-group">
                <label>Kapacitet (osoba)</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.capacity || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Cijena (€)</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.price || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="form-grid-two-columns">
              <div className="form-group">
                <label>Check-in</label>
                <input
                  type="time"
                  step="1"
                  className="input-field"
                  value={formData.checkInTime || "14:00:00"}
                  onChange={(e) =>
                    setFormData({ ...formData, checkInTime: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input
                  type="time"
                  step="1"
                  className="input-field"
                  value={formData.checkOutTime || "11:00:00"}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOutTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tip kreveta</label>
              <select
                className="input-field"
                value={formData.twinBeds ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    twinBeds: e.target.value === "true",
                  })
                }
              >
                <option value="false">Bračni krevet</option>
                <option value="true">Odvojeni kreveti (Twin)</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
