"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";

interface Reservation {
  id: number;
  userId: number;
  dateFrom: string;
  dateTo: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  categoryName: string;
  categoryId: number;
  categoryPrice: number;
  unitNumber: number | null;
  amenities: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
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
    return data?.detail || "⚠️ Greška na serveru.";
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
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchUserById = async (id: number): Promise<User | undefined> => {
    try {
      const response = await fetch(`${apiBase}/users/${id}`);
      if (!response.ok) return undefined;
      return await response.json();
    } catch {
      return undefined;
    }
  };

  const UserCell = ({ userId }: { userId: number }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      let mounted = true;
      fetchUserById(userId).then((u) => {
        if (mounted) setUser(u ?? null);
      });
      return () => {
        mounted = false;
      };
    }, [userId]);

    return (
      <div className="flex flex-col py-1">
        <span className="font-bold text-white text-sm">
          {user?.firstName || "Nepoznat"} {user?.lastName || "Gost"}
        </span>
        <span className="text-[11px] text-gray-500">
          {user?.email || "Nema e-maila"}
        </span>
      </div>
    );
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/reservations`);
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
      const response = await fetch(
        `${apiBase}/reservations/${formData.id}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateFrom: formData.dateFrom,
            dateTo: formData.dateTo,
          }),
        }
      );

      if (response.ok) {
        await fetchReservations();
        setMessage("✅ Rezervacija ažurirana i obavijest poslana!");
        setFormData(null);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri spremanju.");
    }
  };

  const processedData = useMemo(() => {
    let result = reservations.filter((res) => {
      const search = searchTerm.toLowerCase();
      const roomNum = "SOBA " + (res.unitNumber || "");
      return (
        roomNum.toLowerCase().includes(search) &&
        (statusFilter === "all" || res.status === statusFilter)
      );
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof Reservation];
        let bVal: any = b[sortConfig.key as keyof Reservation];

        if (sortConfig.key === "room") {
          aVal = a.unitNumber || 0;
          bVal = b.unitNumber || 0;
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
      key: "userId",
      sortable: true,
      render: (_, row) => <UserCell userId={row.userId} />,
    },
    {
      label: "Soba",
      key: "room",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center">
          <span className="text-gray-300 font-mono bg-[#1a1a1a] px-2.5 py-1 rounded-md border border-[#262626] text-xs">
            {row.unitNumber ? `SOBA ${row.unitNumber}` : "---"}
          </span>
        </div>
      ),
    },
    {
      label: "Dolazak",
      key: "dateFrom",
      sortable: true,
      render: (val) => (
        <span className="text-gray-400 text-sm">
          {String(val).split("T")[0]}
        </span>
      ),
    },
    {
      label: "Odlazak",
      key: "dateTo",
      sortable: true,
      render: (val) => (
        <span className="text-gray-400 text-sm">
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
      key: "categoryPrice",
      sortable: true,
      render: (_, row) => {
        const nights = Math.max(
          1,
          Math.ceil(
            (new Date(row.dateTo).getTime() -
              new Date(row.dateFrom).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        const amenitiesTotal =
          row.amenities?.reduce((sum, a) => sum + a.price * a.quantity, 0) || 0;
        const total = (row.categoryPrice + amenitiesTotal) * nights;
        return (
          <span className="text-emerald-400 font-bold">
            {total.toFixed(2)} €
          </span>
        );
      },
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
            className="filter-input bg-[#141414] text-white border-[#262626] rounded-lg h-[40px] px-3 outline-none"
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
            onSort={(key, direction) => setSortConfig({ key, direction })}
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
