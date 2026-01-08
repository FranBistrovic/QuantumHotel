"use client";

import { useState } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "STAFF" | "GUEST";
  enabled: boolean;
  accountNonLocked: boolean;
  provider: "LOCAL" | "GOOGLE";
}

const roleLabels = {
  ADMIN: "Administrator",
  STAFF: "Osoblje",
  GUEST: "Gost",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<User> | null>(null);

  const itemsPerPage = 10;

  const filteredData = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddNew = () => {
    setFormData({
      id: 0,
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "GUEST",
      enabled: true,
      accountNonLocked: true,
      provider: "LOCAL",
    });
  };

  const handleSave = () => {
    if (!formData) return;
    if (formData.id === 0) {
      setUsers([{ ...formData, id: Date.now() } as User, ...users]);
    } else {
      setUsers(
        users.map((u) =>
          u.id === formData.id ? ({ ...u, ...formData } as User) : u
        )
      );
    }
    setFormData(null);
  };

  const columns: Column<User>[] = [
    { key: "username", label: "Korisničko ime", sortable: true },
    {
      label: "Ime i prezime",
      key: "fullName",
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Uloga",
      render: (value) => (
        <span className={`status-badge badge-role-${value.toLowerCase()}`}>
          {roleLabels[value as keyof typeof roleLabels]}
        </span>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      render: (value) => (
        <span
          className={`status-badge ${
            value ? "badge-active" : "badge-inactive"
          }`}
        >
          {value ? "Aktivan" : "Onemogućen"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="page-header flex justify-between items-center mb-6">
        <h1 className="page-title text-2xl font-bold text-white">
          Upravljanje korisnicima
        </h1>
        <button className="btn-primary" onClick={handleAddNew}>
          <Plus className="icon-small" /> Dodaj korisnika
        </button>
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pretraži korisnike..."
      >
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-input select-height-fixed bg-[#141414] border border-[#262626] text-white p-2 rounded"
        >
          <option value="all">Sve uloge</option>
          <option value="ADMIN">ADMIN</option>
          <option value="STAFF">STAFF</option>
          <option value="GUEST">GUEST</option>
        </select>
      </FilterBar>

      <DataTable
        data={paginatedData}
        columns={columns}
        onEdit={(row) => setFormData(row)}
        onDelete={(u) =>
          confirm(`Obriši ${u.username}?`) &&
          setUsers(users.filter((user) => user.id !== u.id))
        }
        className="data-table"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
      />

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id === 0 ? "Novi korisnik" : "Uredi korisnika"}
        footer={
          <div className="modal-footer-actions flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => setFormData(null)}>
              Odustani
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Spremi
            </button>
          </div>
        }
      >
        {formData && (
          <div className="form-vertical-layout flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm text-gray-400">Ime</label>
                <input
                  className="input-field"
                  value={formData.firstName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="text-sm text-gray-400">Prezime</label>
                <input
                  className="input-field"
                  value={formData.lastName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label className="text-sm text-gray-400">Korisničko ime</label>
              <input
                className="input-field"
                value={formData.username || ""}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="text-sm text-gray-400">Email adresa</label>
              <input
                className="input-field"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm text-gray-400">Uloga</label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                  <option value="GUEST">GUEST</option>
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm text-gray-400">Status</label>
                <select
                  className="input-field"
                  value={formData.enabled ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enabled: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Omogućen</option>
                  <option value="false">Onemogućen</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
