"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "../../components/DataTable";
import { Pagination } from "../../components/Pagination";
import { useRouter } from "next/navigation";
import { Modal } from "../../components/Modal";
import { Bed } from "lucide-react";


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
    amn_id: number;
    quantity: number;
    price: number;
  }[];
}

interface Room {
  id: number;
  roomNumber: string;
  unitsNumber: string;
  name: string;
  price: number;
  categoryId: number;
  capacity: number;
  imagePath: string;
}

interface Addon {
  id: number;
  name: string;
  price: number;
}

interface SelectedAddon {
  id?: number;
  amn_id: number;
  quantity: number;
}


const statusLabels = {
  PENDING: "na čekanju",
  CONFIRMED: "potvrđeno",
  REJECTED: "odbijeno",
};



export default function ReservationsPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState<Partial<Reservation> | null>(null);


  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [persons, setPersons] = useState(1);

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [message, setMessage] = useState("");



  const [loading, setLoading] = useState(true);



  useEffect(() => {
    let isMounted = true;
    const fetchReservations = async () => {
      try {
        const res = await fetch("/api/reservations/me", { credentials: "include" });

        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          if (isMounted) setMessage("⚠️ Nemate ovlasti ili došlo je do greške.");
          setReservations([]);
          return;
        }

        const data: Reservation[] = await res.json();
        if (isMounted) setReservations(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setMessage("⚠️ Greška pri dohvaćanju rezervacija.");
        setReservations([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReservations();
    return () => { isMounted = false; };
  }, [router]);



  useEffect(() => {
    let isMounted = true;
    const fetchAddons = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/addons", { credentials: "include" });
        if (!res.ok) {
          if (isMounted) setMessage("⚠️ Greška pri dohvaćanju dodataka.");
          return;
        }
        const data: Addon[] = await res.json();
        if (isMounted) setAddons(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (isMounted) setMessage("⚠️ Veza sa serverom nije uspjela.");
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAddons();
    return () => { isMounted = false; };
  }, []);





  if (loading) return <div>Učitavanje...</div>;


  const fetchAvailableRooms = async () => {
  if (!dateFrom || !dateTo) {
    setMessage("⚠️ Molimo odaberite datume za rezervaciju.");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const res = await fetch(
      `/api/room-categories/available?from=${dateFrom}&to=${dateTo}&persons=${persons}`,
      { credentials: "include" }
    );

    if (!res.ok) {
  
      let errorMsg = `Greška pri dohvaćanju dostupnih soba (status ${res.status})`;

      try {
        const text = await res.text();
        if (text) {
          try {
            const json = JSON.parse(text);
            errorMsg = json?.detail || json?.message || text;
          } catch {
            errorMsg = text; 
          }
        }
      } catch (err) {
        console.warn("Nije uspjelo dohvatiti body iz odgovora:", err);
      }

      setMessage(`⚠️ ${errorMsg}`);
      setAvailableRooms([]);
      return;
    }

    const data: Room[] = await res.json();
    setAvailableRooms(Array.isArray(data) ? data : []);

    if (data.length === 0) setMessage("⚠️ Nema dostupnih soba za odabrane datume.");
  } catch (err) {
    console.error(err);
    setMessage("⚠️ Veza sa serverom nije uspjela. Pokušajte ponovo.");
    setAvailableRooms([]);
  } finally {
    setLoading(false);
  }
};

  


  const updateAddon = (amnId: number, quantity: number) => {
  setSelectedAddons(prev => {
    const existing = prev.find(a => a.amn_id === amnId);

    if (existing) {
      return prev.map(a =>
        a.amn_id === amnId ? { ...a, quantity } : a
      );
    }

    if (quantity > 0) {
      return [...prev, { amn_id: amnId, quantity }];
    }

    return prev;
  });
};

const createReservation = async () => {
  if (!selectedRoom || !dateFrom || !dateTo) {
    setMessage("⚠️ Molimo odaberite sobu i datume.");
    return;
  }

  try {

    const payload = {
      dateFrom,
      dateTo,
      categoryId: selectedRoom.id,
      amenities: selectedAddons
        .filter(a => a.quantity > 0)
        .map(a => ({
          amenityId: a.amn_id,
          quantity: a.quantity,
        })),
    };

    const res = await fetch("/api/reservations", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = `Greška pri rezervaciji (status ${res.status})`;

      try {
        const text = await res.text();
        if (text) {
          try {
            const json = JSON.parse(text);
            errorMessage = json?.message || errorMessage;
          } catch {
            errorMessage = text;
          }
        }
      } catch (err) {
        console.warn("Nije uspjelo dohvatiti body iz odgovora:", err);
      }

      throw new Error(errorMessage);
    }

    const created = await res.json();
    setReservations(prev => [created, ...prev]);
    setAvailableRooms([]);
    setSelectedRoom(null);
    setSelectedAddons([]);
    setDateFrom("");
    setDateTo("");
    setPersons(1);

    setMessage("✅ Rezervacija uspješno kreirana!");
  } catch (err: any) {
    console.error("Greška u createReservation:", err);
    setMessage(`⚠️ ${err.message}`);
  }
};


  const handleSave = async () => {
    if (!formData) return;

    try {
      const isEdit = !!formData.id;

      const res = await fetch(
        isEdit ? `/api/reservations/${formData.id}` : "/api/reservations",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateFrom: formData.dateFrom,
            dateTo: formData.dateTo,
            amenities: selectedAddons.map(a => ({
              amenityId: a.amn_id,
              quantity: a.quantity,
            })),
          }),
        }
      );

      if (!res.ok) throw new Error("Greška pri spremanju");

      const saved = await res.json();
      setReservations(prev =>
        isEdit ? prev.map(r => (r.id === saved.id ? saved : r)) : [saved, ...prev]
      );

      setFormData(null);
      setSelectedAddons([]);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Greška pri spremanju rezervacije.");
    }
  };


  const filteredData = reservations.filter(res => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      res.categoryName?.toLowerCase().includes(search) ||
      String(res.unitNumber || "").includes(search);
    const matchesStatus =
      statusFilter === "all" || res.status === statusFilter;
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
      key: "categoryName",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{row.categoryName}</span>
          <span className="text-sm text-white-500">
            {row.unitNumber ? `Soba ${row.unitNumber}` : "Nije dodijeljena"}
          </span>
        </div>
      ),
    },
    { key: "dateFrom", label: "Dolazak", sortable: true },
    { key: "dateTo", label: "Odlazak", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (value: Reservation["status"]) => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${value === "PENDING"
              ? "bg-gray-300 text-gray-900"
              : value === "CONFIRMED"
                ? "bg-green-200 text-green-900 border border-green-400"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
        >
          {statusLabels[value]}
        </span>
      ),
    },
    {
      label: "Iznos",
      key: "categoryPrice",
      render: (_, row) => {
        const start = new Date(row.dateFrom);
        const end = new Date(row.dateTo);
        const msPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerDay));
        const amenitiesTotal = row.amenities?.reduce((sum, a) => sum + a.price * a.quantity, 0) || 0;
        const total = (row.categoryPrice) * nights + amenitiesTotal;
        return <span className="text-emerald-400 font-bold">{total.toFixed(2)} €</span>;
      },
    },
    {
      label: "Dodaci",
      key: "amenities",
      render: (_, row) => {
        if (!row.amenities || row.amenities.length === 0) return <span className="text-gray-400">—</span>;
        return (

          <ul className="text-sm space-y-1">
            {row.amenities.map(a => (
              <li key={a.id} className="flex justify-between gap-2">
                <span className="text-white-800">{a.name} × {a.quantity}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
  ];


  //novo
  const getAddonQuantity = (addonId: number) =>
    selectedAddons.find(a => a.amn_id === addonId)?.quantity || 0;



  return (
    <div className="dashboard-main space-y-12 p-6">
      {/* CREATE NEW RESERVATION */}
      <section className="reservation-create space-y-6 p-6 border rounded shadow-sm bg-gray-100">
        <h1 className="page-title text-2xl font-bold text-black">Rezerviraj</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* OD KADA */}
          <div className="flex flex-col ">
            <label htmlFor="dateFrom" className="font-semibold mb-1 text-black">Od kada</label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input-field border border-gray-400 rounded p-2 bg-gray-200 text-black focus:ring-2 focus:ring-red-500 white-calendar"
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
              className="w-auto input-field border border-gray-400 rounded p-2 bg-gray-200 text-black focus:ring-2 focus:ring-red-500  white-calendar"
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
          id="dostupneSobeBtn"
          className="btn-primary mt-4 w-full sm:w-auto bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchAvailableRooms}
        >
          Prikaži dostupne sobe
        </button>

        {/* Available rooms */}
        <div className="room-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {availableRooms.map(room => (
            <div
          id={"room-" + room.id.toString()}
          key={room.id}
          className={`room-card group p-4 border rounded cursor-pointer ${
            selectedRoom?.id === room.id
              ? "border-red-600 bg-gray-200 shadow-md"
              : "border-gray-400 hover:border-red-500 hover:bg-gray-200"
          }`}
          onClick={() => setSelectedRoom(room)}
        >
          <h4 className="font-semibold text-black">Soba {room.roomNumber} - {room.name}</h4>
          <p className="text-gray-800 mt-1">{room.capacity} osoba</p>
          <p className="text-gray-800 mt-1">{room.price} €</p>

          <div className="relative w-full h-40 mt-2 overflow-hidden rounded-md">
            {room.imagePath ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${room.imagePath}` || "/placeholder.svg"}
                alt={room.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                <Bed className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </div>

          ))}
        </div>

        {/* Add-ons */}
        <h3 className="mt-6 mb-2 text-lg font-semibold text-black">Dodatne usluge</h3>
        <div className="space-y-2">
          {addons.map(addon => {
            const quantity = getAddonQuantity(addon.id);

            return (
              <div
                key={addon.id}
                id={"addon-" + addon.id.toString()}
                className="amenity-row flex items-center justify-between p-2 border border-gray-400 rounded bg-gray-100 max-w-sm"
              >
                <span className="text-gray-800">{addon.name}</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateAddon(addon.id, Math.max(0, quantity - 1))
                    }
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-400 bg-gray-100 hover:bg-gray-200 text-black"
                  >
                    −
                  </button>

                  <span className="w-5 text-center text-black text-sm font-medium">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateAddon(addon.id, quantity + 1)
                    }
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-400 bg-gray-100 hover:bg-gray-200 text-black"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}



        </div>

        <button
          id="rezervirajBtn"
          className="btn-primary mt-4 w-full sm:w-auto bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedRoom}
          onClick={createReservation}
        >
          Rezerviraj
        </button>
      </section>

      {message && <p id="resultMessage" className="text-red-500 mt-4">{message}</p>}

      {/* MY RESERVATIONS */}
      <section className="my-reservations space-y-4">
        <h1 className="page-title text-2xl font-bold text-white">Moje rezervacije</h1>
        <DataTable
          data={paginatedData}
          columns={columns}
          onEdit={row => {
            if (row.status === "PENDING") {
              setFormData(row);
              setSelectedAddons(row.amenities.map(a => ({ id: a.id, amn_id: a.amn_id, quantity: a.quantity })));
            }
          }}
          className="data-table bg-gray-100 text-white"
        />

        {/* Modal za uređivanje */}
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
                    className="input-field white-calendar"
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
                    className="input-field white-calendar"
                    value={formData.dateTo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dateTo: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Edit addons */}
              <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-600">Dodatne usluge</h3>
              <div className="space-y-2">
                {addons.map(addon => {
                  const existing = selectedAddons.find(a => a.amn_id === addon.id);
                  const quantity = existing ? existing.quantity : 0;
                  return (
                    <div key={addon.id} className="amenity-row flex items-center justify-between p-2 border border-gray-400 rounded bg-gray-100 hover:bg-gray-200">
                      <span className="text-gray-800">{addon.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateAddon(addon.id, Math.max(0, quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded border border-gray-400 bg-gray-100 hover:bg-gray-200 text-black"
                        >
                          −
                        </button>

                        <span className="w-5 text-center text-black text-sm font-medium">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateAddon(addon.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-gray-400 bg-gray-100 hover:bg-gray-200 text-black"
                        >
                          +
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-end w-full border-t border-[#262626] pt-4 mt-4">
                <button className="btn-secondary" onClick={() => setFormData(null)}>Odustani</button>
                <button className="btn-primary px-6" onClick={handleSave}>Spremi promjene</button>
              </div>
            </div>
          )}
        </Modal>

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
