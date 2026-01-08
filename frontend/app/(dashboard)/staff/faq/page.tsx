"use client";

import { useState } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<FAQ> | null>(null);

  const itemsPerPage = 10;

  const filteredData = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (formData) {
      if (formData.id) {
        setFaqs(
          faqs.map((f) => (f.id === formData.id ? (formData as FAQ) : f))
        );
      } else {
        setFaqs([{ ...formData, id: Date.now() } as FAQ, ...faqs]);
      }
      setFormData(null);
    }
  };

  const columns: Column<FAQ>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "question", label: "Pitanje", sortable: true },
    {
      key: "answer",
      label: "Odgovor",
      render: (v) => (v.length > 50 ? v.substring(0, 50) + "..." : v),
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">FAQ Upravljanje</h1>
        <button
          onClick={() => setFormData({ question: "", answer: "" })}
          className="btn-primary"
        >
          <Plus className="icon-small" /> Dodaj pitanje
        </button>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pretraži pitanja ili odgovore..."
      />

      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={(row) => setFormData(row)}
        onDelete={(row) =>
          confirm("Obrisati ovo pitanje?") &&
          setFaqs(faqs.filter((f) => f.id !== row.id))
        }
        className="data-table"
      />

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id ? "Uredi pitanje" : "Novo FAQ pitanje"}
        footer={
          <div className="modal-footer-actions">
            <button className="btn-secondary" onClick={() => setFormData(null)}>
              Odustani
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Spremi
            </button>
          </div>
        }
      >
        {formData && (
          <div className="form-vertical-layout">
            <div className="form-group">
              <label>Pitanje</label>
              <input
                className="input-field"
                value={formData.question || ""}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Odgovor</label>
              <textarea
                className="input-field textarea-faq"
                style={{ minHeight: "150px" }}
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
