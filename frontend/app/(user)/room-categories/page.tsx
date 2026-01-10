"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable, Column } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";

interface RoomCategory {
  id: number;
  name: string;
  unitsNumber: number;
  capacity: number;
  twinBeds: boolean;
  price: number;
  checkInTime: string;
  checkOutTime: string;
}

/* ---------- helper za error poruke ---------- */
const getErrorMessage = async (response: Response) => {
  if (response.status === 401) return "❌ Niste prijavljeni.";
  if (response.status === 403) return "⛔ Nemate ovlasti.";
  try {
    const data = await response.json();
    return data?.message || "⚠️ Greška.";
  } catch {
    return "⚠️ Greška pri učitavanju.";
  }
};

export default function RoomCategoriesPage() {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ---------- GET /api/room-categories ---------- */
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/room-categories?t=${Date.now()}`);

        if (!res.ok) {
          setMessage(await getErrorMessage(res));
          return;
        }

        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Greška pri učitavanju kategorija.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* ---------- FILTER ---------- */
  const filteredData = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------- TABLICA ---------- */
  const columns: Column<RoomCategory>[] = [
    {
      key: "name",
      label: "Naziv kategorije",
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/room-categories/${row.id}`}
          className="text-rose-500 font-medium hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "capacity",
      label: "Kapacitet",
      render: (v) => `${v} osobe`,
    },
    {
      key: "twinBeds",
      label: "Kreveti",
      render: (v) => (v ? "Odvojeni" : "Bračni"),
    },
    {
      key: "price",
      label: "Cijena",
      sortable: true,
      render: (v) => `${v} €`,
    },
    {
      key: "times",
      label: "In / Out",
      render: (_, row) =>
        `${row.checkInTime?.slice(0, 5)} / ${row.checkOutTime?.slice(0, 5)}`,
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Kategorije soba</h1>
        {message && (
          <p className="text-sm text-red-400 mt-2">{message}</p>
        )}
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pretraži kategorije..."
      />

      {loading ? (
        <div className="p-10 text-center text-gray-400">Učitavanje...</div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          actions={false}
          className="data-table"
        />
      )}
    </div>
  );
}
