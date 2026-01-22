"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus } from "lucide-react";

interface FAQ {
  id: number;
  question: string; // Pitanje
  answer: string; // Odgovor
}

const getErrorMessage = async (response: Response) => {
  if (response.status === 401) return "❌ Niste prijavljeni.";
  if (response.status === 403) return "⛔ Nemate ovlasti.";
  try {
    const data = await response.json();
    return data?.detail || "⚠️ Greška na serveru.";
  } catch {
    return "⚠️ Pogreška.";
  }
};

export default function FaqPage() {
  const apiBase = "/api/faq";

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<FAQ> | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        const mappedData = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id,
              question: item.question || "",
              answer: item.answer || "",
            }))
          : [];
        setFaqs(mappedData);
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
    if (!formData?.question || !formData?.answer) {
      setMessage("❌ Unesite i pitanje i odgovor.");
      return;
    }

    const isNew = !formData.id || formData.id === 0;
    const url = isNew ? apiBase : `${apiBase}/${formData.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
        }),
      });

      if (response.ok) {
        await fetchFaqs();
        setFormData(null);
        setMessage("✅ FAQ spremljen!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri spremanju.");
    }
  };

  const handleDelete = async (row: FAQ) => {
    if (!confirm("Obrisati ovo pitanje?")) return;
    try {
      const response = await fetch(`${apiBase}/${row.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFaqs(faqs.filter((f) => f.id !== row.id));
        setMessage("✅ FAQ obrisan!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri brisanju.");
    }
  };

  const filteredData = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<FAQ>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "question", label: "Pitanje", sortable: true },
    {
      key: "answer",
      label: "Odgovor",
      render: (v) => (
        <span className="text-gray-400 text-sm">
          {v && v.length > 70 ? v.substring(0, 70) + "..." : v}
        </span>
      ),
    },
  ];

  return (
    <div className="dashboard-main p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            FAQ Upravljanje
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
          onClick={() => setFormData({ question: "", answer: "" })}
        >
          <Plus className="w-4 h-4 mr-2" /> Dodaj pitanje
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Pretraži FAQ..."
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
        title={formData?.id ? "Uredi FAQ" : "Novi FAQ"}
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
                Pitanje
              </label>
              <input
                className="input-field"
                value={formData.question || ""}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Odgovor
              </label>
              <textarea
                className="input-field min-h-[150px]"
                value={formData.answer || ""}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
