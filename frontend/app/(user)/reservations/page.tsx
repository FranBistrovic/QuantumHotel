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

interface Room {
  id: number;
  roomNumber: string;
  categoryId: number;
  capacity: number;
}

interface Addon {
  id: number;
  name: string;
}

interface SelectedAddon {
  amenityId: number;
  quantity: number;
}

/* ================= CONST ================= */

const statusLabels = {
  PENDING: "na čekanju",
  CONFIRMED: "potvrđeno",
  REJECTED: "odbijeno",
};

/* ================= PAGE ================= */

export default function ReservationsPage() {
  const router = useRouter();

  /* ---------------- EXISTING RESERVATIONS ---------------- */
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState<Partial<Reservation> | null>(null);

  /* ---------------- CREATE NEW RESERVATION ---------------- */
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [persons, setPersons] = useState(1);

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetch("/api/reservations/me")
      .then(res => res.json())
      .then(setReservations)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/addons")
      .then(res => res.json())
      .then(setAddons)
      .catch(console.error);
  }, []);

  /* ================= LOGIC ================= */

  const fetchAvailableRooms = async () => {
    if (!dateFrom || !dateTo) return;
    const res = await fetch(
      `/api/rooms/available?from=${dateFrom}&to=${dateTo}&persons=${persons}`
    );
    setAvailableRooms(await res.json());
  };

  const updateAddon = (addonId: number, quantity: number) => {
    setSelectedAddons(prev => {
      if (quantity === 0) return prev.filter(a => a.amenityId !== addonId);

      const existing = prev.find(a => a.amenityId === addonId);
      if (existing) {
        return prev.map(a =>
          a.amenityId === addonId ? { ...a, quantity } : a
        );
      }

      return [...prev, { amenityId: addonId, quantity }];
    });
  };

  const createReservation = async () => {
    if (!selectedRoom || !dateFrom || !dateTo) return;

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateFrom,
        dateTo,
        categoryId: selectedRoom.categoryId,
        amenities: selectedAddons,
      }),
    });

    if (!res.ok) throw new Error("Greška pri rezervaciji");

    const created = await res.json();
    setReservations(prev => [created, ...prev]);

    // reset
    setAvailableRooms([]);
    setSelectedRoom(null);
    setSelectedAddons([]);
    setDateFrom("");
    setDateTo("");
    setPersons(1);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      const isEdit = !!formData.id;

      const res = await fetch(
        isEdit
          ? `/api/reservations/${formData.id}`
          : "/api/reservations",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: formData.user,
            room: formData.room,
            dateFrom: formData.dateFrom,
            dateTo: formData.dateTo,
            totalPrice: formData.totalPrice,
          }),
        }
      );

      if (!res.ok) throw new Error("Greška pri spremanju");

      const saved = await res.json();
      setReservations(prev =>
        isEdit
          ? prev.map(r => (r.id === saved.id ? saved : r))
          : [saved, ...prev]
      );

      setFormData(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FILTER & PAGINATION ---------------- */
  const filteredData = reservations.filter(res => {
    const fullName = `${res.user?.firstName || ""} ${res.user?.lastName || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      res.room?.roomNumber.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<Reservation>[] = [
    {
      label: "Soba",
      key: "room",
      render: room => room?.roomNumber || "Nije dodijeljena",
    },
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

      {/* ============ CREATE NEW RESERVATION ============ */}
      <section className="reservation-create space-y-6 p-6 border rounded shadow-sm bg-gray-100">
        <h1 className="page-title text-2xl font-bold text-black">Rezerviraj</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* OD KADA */}
          <div className="flex flex-col">
            <label htmlFor="dateFrom" className="font-semibold mb-1 text-black">Od kada</label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input-field border border-gray-400 rounded p-2 bg-gray-200 text-black focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* DO KADA */}
          <div className="flex flex-col">
            <label htmlFor="dateTo" className="font-semibold mb-1 text-black">Do kada</label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="input-field border border-gray-400 rounded p-2 bg-gray-200 text-black focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* BROJ OSOBA */}
          <div className="flex flex-col">
            <label htmlFor="persons" className="font-semibold mb-1 text-black">Za koliko osoba</label>
            <input
              id="persons"
              type="number"
              min={1}
              value={persons}
              onChange={e => setPersons(+e.target.value)}
              className="input-field border border-gray-400 rounded p-2 bg-gray-200 text-black focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <button
          className="btn-primary mt-4 w-full sm:w-auto bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchAvailableRooms}
        >
          Prikaži dostupne sobe
        </button>

        {/* Available rooms */}
        <div className="room-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {availableRooms.map(room => (
            <div
              key={room.id}
              className={`room-card p-4 border rounded cursor-pointer ${
                selectedRoom?.id === room.id
                  ? "border-red-600 bg-gray-200 shadow-md"
                  : "border-gray-400 hover:border-red-500 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedRoom(room)}
            >
              <h4 className="font-semibold text-black">Soba {room.roomNumber}</h4>
              <p className="text-gray-800 mt-1">{room.capacity} osoba</p>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <h3 className="mt-6 mb-2 text-lg font-semibold text-black">Dodatne usluge</h3>
        <div className="space-y-2">
          {addons.map(addon => (
            <div key={addon.id} className="amenity-row flex items-center justify-between p-2 border border-gray-400 rounded bg-gray-200 hover:bg-gray-300">
              <span className="text-black">{addon.name}</span>
              <input
                type="number"
                min={0}
                onChange={e => updateAddon(addon.id, +e.target.value)}
                className="input-field w-20 border border-gray-400 rounded p-1 bg-gray-100 text-black focus:ring-2 focus:ring-red-500"
              />
            </div>
          ))}
        </div>

        <button
          className="btn-primary mt-4 w-full sm:w-auto bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedRoom}
          onClick={createReservation}
        >
          Rezerviraj
        </button>
      </section>

      {/* ============ MY RESERVATIONS ============ */}
      <section className="my-reservations space-y-4">
        <h1 className="page-title text-2xl font-bold text-white">Moje rezervacije</h1>

        <DataTable
          data={paginatedData}
          columns={columns}
          onRowClick={row => router.push(`/reservations/${row.id}`)}
          onEdit={row => row.status === "PENDING" && setFormData(row)}
          className="data-table bg-gray-100 text-black"
        />

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
