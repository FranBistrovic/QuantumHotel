"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "../../components/DataTable";
import { Pagination } from "../../components/Pagination";
import { FilterBar } from "../../components/FilterBar";
import { Modal } from "../../components/Modal";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation"; 

interface Article {
  id: number;
  title: string;
  description: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Article | null>(null);

  const router = useRouter(); 

  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then(setArticles)
      .catch(console.error);
  }, []);

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
      <div className="page-header">
        <h1 className="page-title">Blog i Članci</h1>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        searchPlaceholder="Pretraži članke..."
      />

      <DataTable
        data={paginatedData}
        columns={columns}
        onRowClick={(row) => router.push(`/articles/${row.id}`)} 
        actions={false}
        className="data-table"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
      />
    </div>
  );
}
