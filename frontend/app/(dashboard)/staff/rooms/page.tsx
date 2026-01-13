"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { DataTable, type Column } from "../../../components/DataTable"
import { Pagination } from "../../../components/Pagination"
import { FilterBar } from "../../../components/FilterBar"
import { Modal } from "../../../components/Modal"
import { Plus } from "lucide-react"

interface Room {
  id: number
  roomNumber: number
  floor: number
  isCleaned: boolean
  underMaintenance: boolean
  categoryId: number
  categoryName?: string
}

interface Category {
  id: number
  name: string
  unitsNumber: number
  capacity: number
  twinBeds: boolean
  price: number
  checkInTime: string
  checkOutTime: string
}

const getErrorMessage = async (response: Response) => {
  if (response.status === 401) return "❌ Niste prijavljeni."
  if (response.status === 403) return "⛔ Nemate ovlasti."
  try {
    const data = await response.json()
    return data?.detail || "⚠️ Greška na serveru."
  } catch {
    return "⚠️ Pogreška."
  }
}

export default function RoomsPage() {
  const pathname = usePathname()
  const apiBase = "/api"

  const [rooms, setRooms] = useState<Room[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState<Partial<Room> | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    fetchRooms()
    fetchCategories() // Fetch categories from separate endpoint
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/rooms?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        const roomsData = Array.isArray(data) ? data : []
        setRooms(roomsData)
      } else {
        setMessage(await getErrorMessage(response))
      }
    } catch {
      setMessage("⚠️ Veza odbijena.")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiBase}/room-categories?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch {
      console.error("Failed to fetch categories")
    }
  }

  const handleSave = async () => {
    if (!formData) return
    const isNew = !formData.id
    const url = isNew ? `${apiBase}/rooms` : `${apiBase}/rooms/${formData.id}`
    const method = isNew ? "POST" : "PATCH"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: Number(formData.roomNumber),
          floor: Number(formData.floor),
          isCleaned: formData.isCleaned === true,
          underMaintenance: formData.underMaintenance === true,
          categoryId: Number(formData.categoryId),
        }),
      })

      if (response.ok) {
        await fetchRooms()
        setFormData(null)
        setMessage("✅ Soba spremljena!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage(await getErrorMessage(response))
      }
    } catch {
      setMessage("⚠️ Greška pri spremanju.")
    }
  }

  const handleDelete = async (row: Room) => {
    if (!confirm(`Obriši sobu ${row.roomNumber}?`)) return
    try {
      const response = await fetch(`${apiBase}/rooms/${row.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setRooms(rooms.filter((r) => r.id !== row.id))
        setMessage("✅ Soba obrisana.")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage(await getErrorMessage(response))
      }
    } catch {
      setMessage("⚠️ Greška.")
    }
  }

  const filteredData = rooms.filter((r) => r.roomNumber.toString().includes(searchTerm))
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const columns: Column<Room>[] = [
    { key: "roomNumber", label: "Broj sobe", sortable: true },
    { key: "floor", label: "Kat", sortable: true },
    { key: "categoryName", label: "Kategorija" },
    {
      key: "isCleaned",
      label: "Čišćenje",
      render: (v) => (
        <span className={`status-badge ${v ? "badge-confirmed" : "badge-pending"}`}>{v ? "Čisto" : "Prljavo"}</span>
      ),
    },
    {
      key: "underMaintenance",
      label: "Održavanje",
      render: (v) => (
        <span className={`status-badge ${v ? "badge-rejected" : "badge-confirmed"}`}>{v ? "Kvar" : "Ispravno"}</span>
      ),
    },
  ]

  return (
    <div className="dashboard-main p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Upravljanje sobama</h1>
          {message && (
            <p className={`text-xs mt-2 font-medium ${message.includes("✅") ? "text-emerald-400" : "text-red-400"}`}>
              {message}
            </p>
          )}
        </div>
        <button
          className="btn-primary"
          onClick={() =>
            setFormData({
              roomNumber: 0,
              floor: 0,
              isCleaned: true,
              underMaintenance: false,
              categoryId: categories[0]?.id || 1,
            })
          }
        >
          <Plus className="w-4 h-4 mr-2" /> Dodaj sobu
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Pretraži po broju sobe..."
        />
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Učitavanje...</div>
        ) : (
          <DataTable
            data={paginatedData}
            columns={columns}
            onEdit={setFormData}
            onDelete={handleDelete}
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
        title={formData?.id ? "Uredi sobu" : "Nova soba"}
        footer={
          <div className="flex gap-3 justify-end w-full border-t border-[#262626] pt-4 mt-4">
            <button className="btn-secondary" onClick={() => setFormData(null)}>
              Odustani
            </button>
            <button className="btn-primary px-6" onClick={handleSave}>
              Spremi
            </button>
          </div>
        }
      >
        {formData && (
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Broj sobe</label>
              <input
                className="input-field"
                type="number"
                value={formData.roomNumber || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roomNumber: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kat</label>
                <input
                  className="input-field"
                  type="number"
                  value={formData.floor || ""}
                  onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kategorija</label>
                <select
                  className="input-field"
                  value={formData.categoryId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Odaberi kategoriju</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Čišćenje</label>
                <select
                  className="input-field"
                  value={formData.isCleaned ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isCleaned: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Čisto</option>
                  <option value="false">Prljavo</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Održavanje</label>
                <select
                  className="input-field"
                  value={formData.underMaintenance ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      underMaintenance: e.target.value === "true",
                    })
                  }
                >
                  <option value="false">Ispravno</option>
                  <option value="true">Kvar / Popravak</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
