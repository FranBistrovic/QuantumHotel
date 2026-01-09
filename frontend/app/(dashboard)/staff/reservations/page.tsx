"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";

interface Reservation {
  id: number;
  user: {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  room: {
    id: number;
    roomNumber: string;
  } | null;
  dateFrom: string;
  dateTo: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  totalPrice: number;
}

const statusLabels = {
  PENDING: "na čekanju",
  CONFIRMED: "potvrđeno",
  REJECTED: "odbijeno",
};

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

export default function StaffReservationsPage() {
  const pathname = usePathname();
  const apiBase = pathname.startsWith("/admin") ? "/api/admin" : "/api/staff";

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/reservations?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setReservations(Array.isArray(data) ? data : []);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Veza odbijena.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      const response = await fetch(`${apiBase}/reservations/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo,
        }),
      });

      if (response.ok) {
        await fetchReservations();
        setMessage("✅ Rezervacija ažurirana!");
        setFormData(null);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri spremanju.");
    }
  };

  const updateStatusAction = async (
    id: number,
    action: "confirm" | "reject"
  ) => {
    try {
      const response = await fetch(`${apiBase}/reservations/${id}/${action}`, {
        method: "POST",
      });
      if (response.ok) {
        await fetchReservations();
        setMessage(
          `✅ Rezervacija ${action === "confirm" ? "potvrđena" : "odbijena"}.`
        );
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri promjeni statusa.");
    }
  };

  const filteredData = reservations.filter((res) => {
    const search = searchTerm.toLowerCase();
    const guestName = `${res.user?.firstName || ""} ${
      res.user?.lastName || ""
    }`.toLowerCase();
    const roomNum = res.room?.roomNumber?.toLowerCase() || "";
    return (
      (guestName.includes(search) || roomNum.includes(search)) &&
      (statusFilter === "all" || res.status === statusFilter)
    );
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Reservation>[] = [
    {
      label: "Gost",
      key: "user",
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">
            {row.user?.firstName} {row.user?.lastName}
          </span>
          <span className="text-xs text-gray-400">{row.user?.email}</span>
        </div>
      ),
    },
    {
      label: "Soba",
      key: "room",
      sortable: true,
      render: (room) => (
        <span className="text-gray-300 font-mono bg-[#1a1a1a] px-2 py-1 rounded border border-[#262626]">
          {room?.roomNumber || "---"}
        </span>
      ),
    },
    { label: "Dolazak", key: "dateFrom", sortable: true },
    { label: "Odlazak", key: "dateTo", sortable: true },
    {
      label: "Status",
      key: "status",
      render: (value: keyof typeof statusLabels) => (
        <span className={`status-badge badge-${value?.toLowerCase()}`}>
          {statusLabels[value] || value}
        </span>
      ),
    },
    {
      label: "Iznos",
      key: "totalPrice",
      sortable: true,
      render: (val) => (
        <span className="text-emerald-400 font-semibold">{val} €</span>
      ),
    },
  ];

  return (
    <div className="dashboard-main p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Upravljanje rezervacijama
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
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Traži gosta ili sobu..."
        >
          <select
            className="filter-input bg-[#141414] text-white border-[#262626] rounded-lg h-[40px] px-3"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Svi statusi</option>
            <option value="PENDING">Na čekanju</option>
            <option value="CONFIRMED">Potvrđeno</option>
            <option value="REJECTED">Odbijeno</option>
          </select>
        </FilterBar>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Učitavanje...</div>
        ) : (
          <DataTable
            data={paginatedData}
            columns={columns}
            onEdit={(row) => setFormData({ ...row })}
            onConfirm={(row) => updateStatusAction(row.id, "confirm")}
            onReject={(row) => updateStatusAction(row.id, "reject")}
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
        title="Uredi rezervaciju"
        footer={
          <div className="flex gap-3 justify-end w-full border-t border-[#262626] pt-4 mt-4">
            <button className="btn-secondary" onClick={() => setFormData(null)}>
              Odustani
            </button>
            <button className="btn-primary px-6" onClick={handleSave}>
              Spremi promjene
            </button>
          </div>
        }
      >
        {formData && (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Dolazak
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.dateFrom || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dateFrom: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Odlazak
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.dateTo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dateTo: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
