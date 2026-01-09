"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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

const getErrorMessage = async (response: Response) => {
  if (response.status === 401) return "❌ Niste prijavljeni.";
  if (response.status === 403) return "⛔ Nemate ovlasti.";
  try {
    const data = await response.json();
    return data?.message || "⚠️ Greška na serveru.";
  } catch {
    return "⚠️ Pogreška.";
  }
};

export default function AddonsPage() {
  const pathname = usePathname();
  const apiBase = pathname.startsWith("/admin") ? "/api/admin" : "/api/staff";

  const [addons, setAddons] = useState<Addon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<Addon> | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/addons?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setAddons(Array.isArray(data) ? data : []);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Veza sa serverom nije uspjela.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    const isNew = !formData.id;
    const url = isNew
      ? `${apiBase}/addons`
      : `${apiBase}/addons/${formData.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          description: formData.description,
        }),
      });

      if (response.ok) {
        await fetchAddons();
        setFormData(null);
        setMessage("✅ Usluga uspješno spremljena!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri spremanju.");
    }
  };

  const handleDelete = async (row: Addon) => {
    if (!confirm(`Obriši dodatak "${row.name}"?`)) return;
    try {
      const response = await fetch(`${apiBase}/addons/${row.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setAddons(addons.filter((a) => a.id !== row.id));
        setMessage("✅ Dodatak obrisan.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri brisanju.");
    }
  };

  const filteredData = addons.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Addon>[] = [
    { key: "name", label: "Naziv usluge", sortable: true },
    { key: "description", label: "Opis" },
    {
      key: "price",
      label: "Cijena",
      sortable: true,
      render: (v) => (
        <span className="text-emerald-400 font-semibold">{v} €</span>
      ),
    },
  ];

  return (
    <div className="dashboard-main p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dodatne usluge
          </h1>
          {message && (
            <p
              className={`text-xs mt-2 font-medium ${
                message.includes("✅") ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
        <button
          className="btn-primary"
          onClick={() => setFormData({ name: "", price: 0, description: "" })}
        >
          <Plus className="w-4 h-4 mr-2" /> Dodaj dodatak
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Pretraži dodatke..."
        />
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-medium">
            Učitavanje...
          </div>
        ) : (
          <DataTable
            data={paginatedData}
            columns={columns}
            onEdit={(row) => setFormData(row)}
            onDelete={handleDelete}
            className="data-table"
          />
        )}
      </div>

      <div className="flex justify-center pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / itemsPerPage) || 1}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
        />
      </div>

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id ? "Uredi dodatak" : "Novi dodatak"}
        footer={
          <div className="flex gap-3 justify-end w-full border-t border-[#262626] pt-4 mt-4">
            <button className="btn-secondary" onClick={() => setFormData(null)}>
              Odustani
            </button>
            <button className="btn-primary px-6" onClick={handleSave}>
              Spremi
            </button>
          </div>
        }
      >
        {formData && (
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Naziv dodatka
              </label>
              <input
                className="input-field"
                placeholder="npr. Doručak"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Cijena (€)
              </label>
              <input
                type="number"
                className="input-field"
                value={formData.price || 0}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Opis
              </label>
              <textarea
                className="input-field min-h-[100px]"
                placeholder="Unesite opis usluge..."
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
