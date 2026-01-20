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
  const itemsPerPage = 10;

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);



  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch("/api/faq");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } catch {
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) return;

        const data = await res.json();

        const fullName = [data.firstName, data.lastName]
          .filter(Boolean)
          .join(" ");

        setSenderEmail(data.email || "");
        setSenderName(fullName);
      } catch {
    
      }
    };

    fetchUser();
  }, []);


  const filteredFaqs = faqs.filter(
    f =>
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
      render: v => (v.length > 120 ? v.slice(0, 120) + "..." : v),
    },
  ];


  const submitSupport = async () => {
    if (!subject || !message || !senderEmail) {
      setFormStatus("⚠️ Ispuni sva obavezna polja.");
      return;
    }

    setSending(true);
    setFormStatus(null);

    try {
      const res = await fetch("/api/support/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          senderEmail,
          senderName: senderName || undefined,
        }),
      });

      if (!res.ok) throw new Error();

      setFormStatus("✅ Poruka je uspješno poslana.");
      setSubject("");
      setMessage("");
    } catch {
      setFormStatus("❌ Greška pri slanju poruke.");
    } finally {
      setSending(false);
    }
  };


  return (
    <div className="dashboard-main space-y-12">

      <section>
        <div className="page-header border-b border-[#262626] pb-6 mb-4">
          <h1 className="page-title text-2xl font-bold text-white">FAQ</h1>
        </div>

        <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4 mb-4">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={v => {
              setSearchTerm(v);
              setCurrentPage(1);
            }}
            searchPlaceholder="Pretraži pitanja ili odgovore..."
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Učitavanje FAQ...
          </div>
        ) : (
          <DataTable
            data={paginatedFaqs}
            columns={columns}
            actions={false}
            className="data-table"
          />
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="btn-secondary"
            >
              Prethodna
            </button>
            <span className="text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="btn-secondary"
            >
              Sljedeća
            </button>
          </div>
        )}
      </section>

      <section className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 space-y-4 max-w-2xl">
        <h2 className="text-xl font-bold text-white">Kontaktiraj podršku</h2>

        <input
          type="text"
          placeholder="Naslov *"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="input-field w-full"
        />

        <textarea
          placeholder="Poruka *"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="input-field w-full resize-none text-base leading-relaxed min-h-[220px]"
        />

        <input
          type="email"
          placeholder="Email *"
          value={senderEmail}
          onChange={e => setSenderEmail(e.target.value)}
          className="input-field w-full"
        />

        <input
          type="text"
          placeholder="Ime (opcionalno)"
          value={senderName}
          onChange={e => setSenderName(e.target.value)}
          className="input-field w-full"
        />

        {formStatus && (
          <p
            className={`text-sm font-medium ${
              formStatus.includes("✅")
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {formStatus}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={submitSupport}
            disabled={sending}
            className="btn-primary px-6 py-2 disabled:opacity-50"
          >
            {sending ? "Slanje..." : "Pošalji"}
          </button>
        </div>
      </section>
    </div>
  );
}
