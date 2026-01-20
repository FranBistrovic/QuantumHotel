"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import { useRouter } from "next/navigation";

interface Addon {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function AddonsPage() {
  const router = useRouter();

  const [addons, setAddons] = useState<Addon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  
  useEffect(() => {
    const fetchAddons = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/addons");
        if (!res.ok) {
          setMessage("⚠️ Greška pri učitavanju dodataka.");
          return;
        }
        const data = await res.json();
        setAddons(Array.isArray(data) ? data : []);
      } catch {
        setMessage("⚠️ Veza sa serverom nije uspjela.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddons();
  }, []);

 
  const filteredData = addons.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Addon>[] = [
    { key: "name", label: "Naziv usluge", sortable: true },
    { key: "description", label: "Opis" },
    {
      key: "price",
      label: "Cijena",
      sortable: true,
      render: (v) => `${v} €`,
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Dodaci</h1>
        {message && (
          <p className="text-sm mt-2 font-medium text-red-400">{message}</p>
        )}
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pretraži dodatke..."
      />

      {loading ? (
        <div className="p-10 text-center text-gray-500">
          Učitavanje dodataka...
        </div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          onRowClick={(row) => router.push(`/addons/${row.id}`)}
          actions={false}
          className="data-table"
        />
      )}
    </div>
  );
}
