"use client";

import { useEffect, useState } from "react";
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

  const itemsPerPage = 10;

  // --- Dohvaćanje FAQ s API-ja ---
  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json())
      .then((data: FAQ[]) => setFaqs(data))
      .catch((err) => console.error("Greška pri dohvaćanju FAQ:", err));
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
      <div className="page-header">
        <h1 className="page-title">FAQ</h1>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        searchPlaceholder="Pretraži pitanja ili odgovore..."
      />

      <DataTable
        data={paginatedFaqs}
        columns={columns}
        className="data-table"
        actions={false}
        // Za user view nema onEdit i onDelete
      />

      {/* Paginacija */}
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
