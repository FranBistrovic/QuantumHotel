"use client";

import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus, Upload, X, ImageIcon } from "lucide-react";

interface RoomCategory {
  id: number;
  name: string;
  unitsNumber: number;
  capacity: number;
  twinBeds: boolean;
  price: number;
  checkInTime: string;
  checkOutTime: string;
  imagePath: string;
}

const getErrorMessage = async (response: Response) => {
  if (response.status === 401) return "Niste prijavljeni.";
  if (response.status === 403) return "Nemate ovlasti.";
  try {
    const data = await response.json();
    return data?.message || "Greska.";
  } catch {
    return "Greska.";
  }
};

export default function RoomCategoriesPage() {
  const apiBase = "/api";

  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<RoomCategory> | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!formData) {
      setSelectedImage(null);
      setImagePreview(null);
    } else if (formData.imagePath) {
      setImagePreview(formData.imagePath);
    } else {
      setImagePreview(null);
    }
  }, [formData]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiBase}/room-categories?t=${Date.now()}`,
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("Greska pri ucitavanju.");
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
        const savedCategory = await response.json();
        if (selectedImage && savedCategory?.id) {
          await handleImageUpload(savedCategory.id);
        }
        await fetchCategories();
        setFormData(null);
        setMessage("Kategorija spremljena!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("Greska pri spremanju.");
    }
  };

  const handleImageUpload = async (categoryId: number) => {
    if (!selectedImage) return;
    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", selectedImage);
    try {
      const response = await fetch(
        `${apiBase}/room-categories/${categoryId}/image`,
        {
          method: "POST",
          body: formDataUpload,
        },
      );
      if (response.ok) {
        const result = await response.json();
        if (formData) setFormData({ ...formData, imagePath: result.imagePath });
        setImagePreview(result.imagePath);
        setSelectedImage(null);
        setMessage("Slika uspjesno uploadana!");
        setTimeout(() => setMessage(""), 3000);
        await fetchCategories();
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("Greska pri uploadu slike.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Molimo odaberite slikovnu datoteku.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Slika mora biti manja od 5MB.");
        return;
      }
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview && !formData?.imagePath) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (row: RoomCategory) => {
    if (!confirm(`Obrisi kategoriju ${row.name}?`)) return;
    try {
      const response = await fetch(`${apiBase}/room-categories/${row.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== row.id));
        setMessage("Obrisano.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("Greska.");
    }
  };

  // IMPLEMENTACIJA SORTIRANJA KAO U PRIMJERU S REZERVACIJAMA
  const processedData = useMemo(() => {
    let result = categories.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof RoomCategory];
        const bVal = b[sortConfig.key as keyof RoomCategory];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [categories, searchTerm, sortConfig]);

  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const columns: Column<RoomCategory>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Naziv kategorije", sortable: true },
    {
      key: "capacity",
      label: "Kapacitet",
      sortable: true,
      render: (v) => `${v} osobe`,
    },
    {
      key: "price",
      label: "Cijena",
      sortable: true,
      render: (v) => (
        <span className="text-emerald-400 font-semibold">{v} EUR</span>
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
    {
      key: "imagePath",
      label: "Slika",
      render: (v) =>
        v ? (
          <span className="text-xs text-emerald-400">Ima sliku</span>
        ) : (
          <span className="text-xs text-gray-500">Nema slike</span>
        ),
    },
  ];

  return (
    <div className="dashboard-main p-6 space-y-6 bg-[#0a0a0a] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Kategorije smještaja
          </h1>
          {message && (
            <p
              className={`text-xs mt-2 font-medium ${message.includes("uspjesno") || message.includes("spremljena") || message.includes("Obrisano") ? "text-emerald-400" : "text-red-400"}`}
            >
              {message}
            </p>
          )}
        </div>
        <button
          className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
          <Plus className="w-4 h-4" /> Nova kategorija
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Pretrazi kategorije..."
        />
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Ucitavanje...</div>
        ) : (
          <DataTable<RoomCategory>
            data={paginatedData}
            columns={columns}
            onEdit={(row) => setFormData({ ...row })}
            onDelete={handleDelete}
            onSort={(key, direction) => setSortConfig({ key, direction })}
            className="data-table"
          />
        )}
      </div>

      <div className="flex justify-center pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(processedData.length / itemsPerPage) || 1}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={processedData.length}
        />
      </div>

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id ? "Uredi kategoriju" : "Dodaj kategoriju"}
      >
        {formData && (
          <div className="space-y-4 py-2">
            {formData.id && (
              <div className="text-xs text-gray-400">ID: {formData.id}</div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Naziv kategorije
              </label>
              <input
                className="input-field w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-white"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Cijena (EUR)
                </label>
                <input
                  className="input-field w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-white"
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
                  className="input-field w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-white"
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
                  className="input-field w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-white"
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
                  className="input-field w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-white"
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
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                checked={!!formData.twinBeds}
                onChange={(e) =>
                  setFormData({ ...formData, twinBeds: e.target.checked })
                }
              />
              <label className="text-sm font-medium text-gray-200">
                Odvojeni kreveti (Twin Beds)
              </label>
            </div>
            {/* Image section remains same... */}
            <div className="flex gap-3 justify-end w-full border-t border-[#262626] pt-4 mt-4">
              <button
                className="btn-secondary px-4 py-2 bg-[#262626] text-white rounded-lg"
                onClick={() => setFormData(null)}
              >
                Odustani
              </button>
              <button
                className="btn-primary px-6 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleSave}
              >
                Spremi
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
