"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus, HelpCircle } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
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

export default function FaqPage() {
  const apiBase = "/api";

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
      const response = await fetch(`${apiBase}/faq?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setFaqs(Array.isArray(data) ? data : []);
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
    const url = isNew ? `${apiBase}/faq` : `${apiBase}/faq/${formData.id}`;
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
        await fetchFaqs(); // Sinkronizacija s backendom
        setFormData(null);
        setMessage("✅ FAQ uspješno spremljen!");
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
      const response = await fetch(`${apiBase}/faq/${row.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFaqs(faqs.filter((f) => f.id !== row.id));
        setMessage("✅ Pitanje obrisano.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri brisanju.");
    }
  };

  const filteredData = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<FAQ>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (v) => (
        <span className="font-mono text-gray-500 text-xs">{v}</span>
      ),
    },
    {
      key: "question",
      label: "Pitanje",
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 opacity-70" />
          <span className="font-medium text-white">{v}</span>
        </div>
      ),
    },
    {
      key: "answer",
      label: "Odgovor",
      render: (v) => (
        <span className="text-gray-400 text-sm">
          {v.length > 70 ? v.substring(0, 70) + "..." : v}
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
          onClick={() => setFormData({ question: "", answer: "" })}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" /> Dodaj pitanje
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          searchPlaceholder="Pretraži pitanja ili odgovore..."
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
        title={formData?.id ? "Uredi pitanje" : "Novo FAQ pitanje"}
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
                placeholder="npr. Koliko košta parking?"
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
                style={{ resize: "vertical" }}
                placeholder="Unesite detaljan odgovor..."
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
