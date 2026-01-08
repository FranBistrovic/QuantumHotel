"use client";

import { useState } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus } from "lucide-react";

interface Addon {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<Addon> | null>(null);

  const itemsPerPage = 10;

  const filteredData = addons.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (formData) {
      if (formData.id) {
        setAddons(
          addons.map((a) => (a.id === formData.id ? (formData as Addon) : a))
        );
      } else {
        setAddons([{ ...formData, id: Date.now() } as Addon, ...addons]);
      }
      setFormData(null);
    }
  };

  const columns: Column<Addon>[] = [
    { key: "name", label: "Naziv usluge", sortable: true },
    { key: "description", label: "Opis" },
    { key: "price", label: "Cijena", render: (v) => `${v} €`, sortable: true },
  ];

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Dodaci</h1>
        <button
          className="btn-primary"
          onClick={() => setFormData({ name: "", price: 0, description: "" })}
        >
          <Plus className="icon-small" /> Dodaj dodatak
        </button>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pretraži dodatke..."
      />

      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={(row) => setFormData(row)}
        onDelete={(row) => {
          if (confirm(`Obriši dodatak "${row.name}"?`)) {
            setAddons(addons.filter((a) => a.id !== row.id));
          }
        }}
        className="data-table"
      />

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id ? "Uredi dodatak" : "Novi dodatak"}
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
              <label>Naziv dodatka</label>
              <input
                className="input-field"
                placeholder="npr. Doručak"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
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
            <div className="form-group">
              <label>Opis</label>
              <textarea
                className="input-field textarea-small"
                placeholder="Unesite opis..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
