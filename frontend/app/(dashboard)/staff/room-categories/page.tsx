"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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

const getErrorMessage = async (response: Response) => {
  if (response.status === 401) return "❌ Niste prijavljeni.";
  if (response.status === 403) return "⛔ Nemate ovlasti.";
  try {
    const data = await response.json();
    return data?.message || "⚠️ Greška.";
  } catch {
    return "⚠️ Pogreška.";
  }
};

export default function RoomCategoriesPage() {
  const pathname = usePathname();
  const apiBase = "/api";

  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<RoomCategory> | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiBase}/room-categories?t=${Date.now()}`
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    const isNew = !formData.id;
    const url = isNew
      ? `${apiBase}/room-categories`
      : `${apiBase}/room-categories/${formData.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          unitsNumber: Number(formData.unitsNumber),
          capacity: Number(formData.capacity),
          price: Number(formData.price),
          twinBeds: !!formData.twinBeds,
        }),
      });

      if (response.ok) {
        await fetchCategories();
        setFormData(null);
        setMessage("✅ Kategorija spremljena!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri spremanju.");
    }
  };

  const handleDelete = async (row: RoomCategory) => {
    if (!confirm(`Obriši kategoriju ${row.name}?`)) return;
    try {
      const response = await fetch(`${apiBase}/room-categories/${row.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== row.id));
        setMessage("✅ Obrisano.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška.");
    }
  };

  const filteredData = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<RoomCategory>[] = [
    { key: "name", label: "Naziv kategorije", sortable: true },
    { key: "capacity", label: "Kapacitet", render: (v) => `${v} osobe` },
    {
      key: "price",
      label: "Cijena",
      sortable: true,
      render: (v) => (
        <span className="text-emerald-400 font-semibold">{v} €</span>
      ),
    },
    {
      key: "twinBeds",
      label: "Twin Beds",
      render: (v) => <span className="text-xs">{v ? "DA" : "NE"}</span>,
    },
    {
      key: "times",
      label: "In / Out",
      render: (_, row) => (
        <span className="text-xs text-gray-400 font-mono">
          {row.checkInTime?.slice(0, 5)} - {row.checkOutTime?.slice(0, 5)}
        </span>
      ),
    },
  ];

  return (
    <div className="dashboard-main p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Kategorije smještaja
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
          <Plus className="w-4 h-4 mr-2" /> Nova kategorija
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Pretraži kategorije..."
        />
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Učitavanje...</div>
        ) : (
          <DataTable
            data={paginatedData}
            columns={columns}
            onEdit={setFormData}
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
        title={formData?.id ? "Uredi kategoriju" : "Dodaj kategoriju"}
      >
        {formData && (
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Naziv kategorije
              </label>
              <input
                className="input-field"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Cijena (€)
                </label>
                <input
                  className="input-field"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Kapacitet
                </label>
                <input
                  className="input-field"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Check-In
                </label>
                <input
                  className="input-field"
                  type="time"
                  step="1"
                  value={formData.checkInTime || "14:00:00"}
                  onChange={(e) =>
                    setFormData({ ...formData, checkInTime: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Check-Out
                </label>
                <input
                  className="input-field"
                  type="time"
                  step="1"
                  value={formData.checkOutTime || "11:00:00"}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOutTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#141414] p-3 rounded-lg border border-[#262626]">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                checked={!!formData.twinBeds}
                onChange={(e) =>
                  setFormData({ ...formData, twinBeds: e.target.checked })
                }
              />
              <label className="text-sm font-medium text-gray-200">
                Odvojeni kreveti (Twin Beds)
              </label>
            </div>
            <div className="flex gap-3 justify-end w-full border-t border-[#262626] pt-4 mt-4">
              <button
                className="btn-secondary"
                onClick={() => setFormData(null)}
              >
                Odustani
              </button>
              <button className="btn-primary px-6" onClick={handleSave}>
                Spremi
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
