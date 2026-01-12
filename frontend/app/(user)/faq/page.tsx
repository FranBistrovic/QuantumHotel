"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FaqUserPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const itemsPerPage = 10;

  // --- Dohvaćanje FAQ s API-ja ---
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/faq");
        if (!res.ok) {
          setMessage("⚠️ Greška pri učitavanju FAQ.");
          return;
        }
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } catch {
        setMessage("⚠️ Veza sa serverom nije uspjela.");
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  // --- Filtriranje ---
  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage) || 1;
  const paginatedFaqs = filteredFaqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<FAQ>[] = [
    { key: "question", label: "Pitanje", sortable: true },
    {
      key: "answer",
      label: "Odgovor",
      render: (v) => (v.length > 100 ? v.substring(0, 100) + "..." : v),
    },
  ];

  return (
    <div className="dashboard-main">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <h1 className="page-title text-2xl font-bold text-white tracking-tight">FAQ</h1>
        {message && (
          <p
            className={`text-sm mt-2 font-medium ${
              message.includes("✅") ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* FilterBar box */}
        <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4 mb-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          searchPlaceholder="Pretraži pitanja ili odgovore..."
        />
        </div>

      {/* DataTable box */}
      
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Učitavanje FAQ...
          </div>
        ) : (
          <DataTable
            data={paginatedFaqs}
            columns={columns}
            actions={false} // user view nema edit/delete
            className="data-table"
          />
        )}


      {/* Pagination */}
      <div className="pagination-wrapper">
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="btn-secondary"
            >
              Prethodna
            </button>
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="btn-secondary"
            >
              Sljedeća
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
