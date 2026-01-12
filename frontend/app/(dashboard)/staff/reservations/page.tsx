"use client";

import { useState, useEffect, useMemo } from "react";
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
  const apiBase = "/api/admin";

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Dodana konfiguracija za sortiranje
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Reservation;
    direction: "asc" | "desc";
  } | null>(null);

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

  // Filtriranje i sortiranje podataka
  const processedData = useMemo(() => {
    let result = reservations.filter((res) => {
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

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        let aVal, bVal;

        // Posebno rukovanje za objekte (Gost i Soba)
        if (sortConfig.key === "user") {
          aVal = `${a.user?.firstName} ${a.user?.lastName}`;
          bVal = `${b.user?.firstName} ${b.user?.lastName}`;
        } else if (sortConfig.key === "room") {
          aVal = a.room?.roomNumber || "";
          bVal = b.room?.roomNumber || "";
        } else {
          aVal = a[sortConfig.key] ?? "";
          bVal = b[sortConfig.key] ?? "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [reservations, searchTerm, statusFilter, sortConfig]);

  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Reservation>[] = [
    {
      label: "Gost",
      key: "user",
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-white text-sm">
            {row.user?.firstName || "Nepoznat"} {row.user?.lastName || "Gost"}
          </span>
          <span className="text-[11px] text-gray-500">
            {row.user?.email || "Nema e-maila"}
          </span>
        </div>
      ),
    },
    {
      label: "Soba",
      key: "room",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center">
          <span className="text-gray-300 font-mono bg-[#1a1a1a] px-2.5 py-1 rounded-md border border-[#262626] text-xs">
            {row.room?.roomNumber ? `SOBA ${row.room.roomNumber}` : "---"}
          </span>
        </div>
      ),
    },
    {
      label: "Dolazak",
      key: "dateFrom",
      sortable: true,
      render: (val) => (
        <span className="text-gray-400 text-sm font-medium">
          {String(val).split("T")[0]}
        </span>
      ),
    },
    {
      label: "Odlazak",
      key: "dateTo",
      sortable: true,
      render: (val) => (
        <span className="text-gray-400 text-sm font-medium">
          {String(val).split("T")[0]}
        </span>
      ),
    },
    {
      label: "Status",
      key: "status",
      sortable: true,
      render: (value: keyof typeof statusLabels) => (
        <span className={`status-badge badge-${String(value).toLowerCase()}`}>
          {statusLabels[value] || value}
        </span>
      ),
    },
    {
      label: "Iznos",
      key: "totalPrice",
      sortable: true,
      render: (val) => (
        <span className="text-emerald-400 font-bold">{val} €</span>
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

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4 shadow-sm">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Traži gosta ili sobu..."
        >
          <select
            className="filter-input bg-[#141414] text-white border-[#262626] rounded-lg h-[40px] px-3 outline-none focus:border-emerald-500/50 transition-colors"
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
          <div className="p-10 text-center text-gray-500 animate-pulse font-medium">
            Učitavanje...
          </div>
        ) : (
          <DataTable<Reservation>
            data={paginatedData}
            columns={columns}
            onEdit={(row) =>
              setFormData({
                ...row,
                dateFrom: row.dateFrom.split("T")[0],
                dateTo: row.dateTo.split("T")[0],
              })
            }
            onConfirm={(row) => updateStatusAction(row.id, "confirm")}
            onReject={(row) => updateStatusAction(row.id, "reject")}
            onSort={(key, direction) =>
              setSortConfig({ key: key as keyof Reservation, direction })
            }
            className="data-table"
          />
        )}
      </div>

      <div className="flex justify-center pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(processedData.length / itemsPerPage) || 1}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={processedData.length}
        />
      </div>

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title="Uredi rezervaciju"
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
            <div className="flex gap-3 justify-end w-full border-t border-[#262626] pt-4 mt-4">
              <button
                className="btn-secondary"
                onClick={() => setFormData(null)}
              >
                Odustani
              </button>
              <button className="btn-primary px-6" onClick={handleSave}>
                Spremi promjene
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
