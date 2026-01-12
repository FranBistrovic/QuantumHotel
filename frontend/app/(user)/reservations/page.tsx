"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "../../components/DataTable";
import { Pagination } from "../../components/Pagination";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface Reservation {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  room: {
    roomNumber: string;
  } | null;
  dateFrom: string;
  dateTo: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  totalPrice: number;
}

interface RoomCategory {
  id: number;
  name: string;
  capacity: number;
}

/* ================= CONST ================= */

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

/* ================= PAGE ================= */

export default function ReservationsPage() {
  const router = useRouter();

  /* ---------------- STATE ---------------- */

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [persons, setPersons] = useState(1);

  const [availableCategories, setAvailableCategories] = useState<RoomCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const itemsPerPage = 10;

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchReservations();
  }, []);

  /* ================= API ================= */

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reservations/me");
      if (response.ok) {
        const data = await response.json();
        setReservations(Array.isArray(data) ? data : []);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri dohvaćanju rezervacija.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCategories = async () => {
    if (!dateFrom || !dateTo) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/room-categories/available?from=${dateFrom}&to=${dateTo}&persons=${persons}`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableCategories(Array.isArray(data) ? data : []);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri dohvaćanju kategorija.");
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async () => {
    if (!selectedCategory || !dateFrom || !dateTo) return;

    setLoading(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateFrom,
          dateTo,
          categoryId: selectedCategory.id,
          amenities: [],
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setReservations(prev => [created, ...prev]);

        setAvailableCategories([]);
        setSelectedCategory(null);
        setDateFrom("");
        setDateTo("");
        setPersons(1);

        setMessage("✅ Rezervacija uspješno kreirana.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(await getErrorMessage(response));
      }
    } catch {
      setMessage("⚠️ Greška pri kreiranju rezervacije.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER & PAGINATION ================= */

  const filteredData = reservations.filter(res => {
    const fullName = `${res.user?.firstName || ""} ${res.user?.lastName || ""}`.toLowerCase();
    const roomNum = res.room?.roomNumber?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      (fullName.includes(search) || roomNum.includes(search)) &&
      (statusFilter === "all" || res.status === statusFilter)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Reservation>[] = [
    { key: "room", label: "Soba", render: r => r.room?.roomNumber || "Nije dodijeljena" },
    { key: "dateFrom", label: "Dolazak", sortable: true },
    { key: "dateTo", label: "Odlazak", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (value: Reservation["status"]) => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            value === "PENDING"
              ? "bg-gray-300 text-gray-900"
              : value === "CONFIRMED"
              ? "bg-gray-200 text-gray-900 border border-gray-400"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {statusLabels[value]}
        </span>
      ),
    },
    {
      key: "totalPrice",
      label: "Iznos",
      render: value => `${value} €`,
    },
  ];

  /* ================= RENDER ================= */

  return (
    <div className="dashboard-main space-y-12 p-6">
      {message && (
        <p className="text-sm font-medium text-red-600">{message}</p>
      )}

      {/* ============ CREATE RESERVATION ============ */}
      <section className="reservation-create space-y-6 p-6 border rounded shadow-sm bg-gray-100">
        <h1 className="page-title text-2xl font-bold text-black">Rezerviraj</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-black">Od kada</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input-field border border-gray-400 rounded p-2 bg-gray-200 text-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-black">Do kada</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="input-field border border-gray-400 rounded p-2 bg-gray-200 text-black"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-black">Za koliko osoba</label>
            <input
              type="number"
              min={1}
              value={persons}
              onChange={e => setPersons(+e.target.value)}
              className="input-field border border-gray-400 rounded p-2 bg-gray-200 text-black"
            />
          </div>
        </div>

        <button
          onClick={fetchAvailableCategories}
          className="btn-primary bg-red-600 text-white py-2 px-4 rounded-md"
          disabled={loading}
        >
          Prikaži dostupne kategorije
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {availableCategories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`p-4 border rounded cursor-pointer ${
                selectedCategory?.id === cat.id
                  ? "border-red-600 bg-gray-200"
                  : "border-gray-400 hover:border-red-500 hover:bg-gray-200"
              }`}
            >
              <h4 className="font-semibold">{cat.name}</h4>
              <p>{cat.capacity} osoba</p>
            </div>
          ))}
        </div>

        <button
          onClick={createReservation}
          disabled={!selectedCategory || loading}
          className="btn-primary bg-red-600 text-white py-2 px-4 rounded-md"
        >
          Rezerviraj
        </button>
      </section>

      {/* ============ MY RESERVATIONS ============ */}
      <section className="my-reservations space-y-4">
        <h1 className="page-title text-2xl font-bold text-white">
          Moje rezervacije
        </h1>

        {loading ? (
          <div className="text-gray-500">Učitavanje...</div>
        ) : (
          <DataTable
            data={paginatedData}
            columns={columns}
            onRowClick={row => router.push(`/reservations/${row.id}`)}
            className="data-table bg-gray-100 text-black"
          />
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
        />
      </section>
    </div>
  );
}
