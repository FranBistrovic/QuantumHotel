"use client";

import { useState } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus, FileText } from "lucide-react";

interface Article {
  id: number;
  title: string;
  description: string; // Backend koristi ovo za sadržaj članka
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Article | null>(null);

  const itemsPerPage = 10;

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

  const handleAddNew = () => {
    setFormData({
      id: 0,
      title: "",
      description: "",
    });
  };

  const handleSave = () => {
    if (formData) {
      if (formData.id === 0) {
        setArticles([{ ...formData, id: Date.now() }, ...articles]);
      } else {
        setArticles(articles.map((a) => (a.id === formData.id ? formData : a)));
      }
      setFormData(null);
    }
  };

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
    {
      key: "description",
      label: "Sadržaj",
      render: (v) => (v.length > 70 ? v.substring(0, 70) + "..." : v),
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Blog i Članci</h1>
        <button onClick={handleAddNew} className="btn-primary">
          <Plus className="icon-small" /> Dodaj članak
        </button>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        searchPlaceholder="Pretraži članke po naslovu ili sadržaju..."
      />

      <DataTable
        data={paginatedData}
        columns={columns}
        onEdit={(row) => setFormData(row)}
        onDelete={(a) => {
          if (confirm(`Obrisati članak "${a.title}"?`)) {
            // DELETE /api/articles/{id}
            setArticles((prev) => prev.filter((x) => x.id !== a.id));
          }
        }}
        className="data-table"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
      />

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id === 0 ? "Novi članak" : "Uredi članak"}
        footer={
          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={() => setFormData(null)}>
              Odustani
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Spremi članak
            </button>
          </div>
        }
      >
        {formData && (
          <div className="form-vertical-layout">
            <div className="form-group">
              <label>Naslov članka</label>
              <input
                className="input-field"
                placeholder="Unesite naslov..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Opis / Sadržaj članka</label>
              <textarea
                className="input-field"
                style={{ minHeight: "200px", resize: "vertical" }}
                placeholder="Unesite puni tekst članka..."
                value={formData.description}
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
