"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "../../components/DataTable";
import { Pagination } from "../../components/Pagination";
import { FilterBar } from "../../components/FilterBar";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface Article {
  id: number;
  title: string;
  description: string;
}

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const [message, setMessage] = useState("");

  // Učitavanje članaka
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/articles");
        if (!res.ok) {
          setMessage("⚠️ Greška pri učitavanju članaka.");
          return;
        }
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch {
        setMessage("⚠️ Veza sa serverom nije uspjela.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Filtriranje
  const filteredData = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Article>[] = [
    {
      key: "title",
      label: "Naslov",
      sortable: true,
      render: (v) => (
        <div className="flex-align-center gap-2">
          <FileText className="icon-tiny opacity-50" />
          <span className="font-medium">{v}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-main">
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <h1 className="page-title text-2xl font-bold text-white tracking-tight">Blog i Članci</h1>
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

      {/* Filter Bar box */}
      
      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4 mb-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          searchPlaceholder="Pretraži članke..."
        />
     </div>

      {/* DataTable box */}
      
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Učitavanje članaka...
          </div>
        ) : (
          <DataTable
            data={paginatedData}
            columns={columns}
            onRowClick={(row) => router.push(`/articles/${row.id}`)}
            actions={false}
            className="data-table"
          />
        )}
     

      {/* Pagination */}
      <div className="flex justify-center pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
        />
      </div>
    </div>
  );
}
