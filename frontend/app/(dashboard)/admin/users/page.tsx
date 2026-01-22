"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable, Column } from "../../../components/DataTable";
import { Pagination } from "../../../components/Pagination";
import { FilterBar } from "../../../components/FilterBar";
import { Modal } from "../../../components/Modal";
import { Plus, UserCheck, UserX, ImageIcon } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "STAFF" | "USER";
  enabled: boolean;
  gender: "MALE" | "FEMALE" | "OTHER";
  city?: string;
  dateOfBirth?: string;
  imageUrl?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<User> | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  } | null>(null);

  const itemsPerPage = 10;

  const getAvatarUrl = (path?: string) => {
    if (!path) return "/default-avatar.jpg";
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(
          Array.isArray(data)
            ? data.map((u) => ({ ...u, enabled: !!u.enabled }))
            : []
        );
      } else {
        setMessage("❌ Greška pri dohvaćanju korisnika.");
      }
    } catch (err) {
      setMessage("⚠️ Veza sa serverom nije uspjela.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    const isNew = !formData.id || formData.id === 0;

    try {
      if (isNew) {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            password: Array.from(crypto.getRandomValues(new Uint32Array(32)), x => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?"[x % 90]).join(""),
            provider: "LOCAL",
            emailVerified: true,
            enabled: formData.enabled ?? true,
            accountNonLocked: formData.enabled ?? true,
          }),
        });
        if (!res.ok) throw new Error("Neuspješno kreiranje korisnika");

        const response = await fetch(`/api/auth/request-reset?email=${encodeURIComponent(formData.email!)}`, {
          method: "POST",
          credentials: "include",
        });
        if(!response.ok) throw new Error("Neuspješno slanje emaila za reset lozinke novom korisniku.");

      } else {
        const originalUser = users.find((u) => u.id === formData.id);
        const { role, ...basicData } = formData;

        const res = await fetch(`/api/admin/users/${formData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(basicData),
        });
        if (!res.ok) throw new Error("Neuspješno ažuriranje profila");

        if (originalUser && originalUser.role !== role) {
          const roleRes = await fetch(`/api/admin/users/${formData.id}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
          });
          if (!roleRes.ok)
            throw new Error("Profil ažuriran, ali promjena uloge nije uspjela");
        }
      }

      await fetchUsers();
      setMessage(isNew ? "✅ Korisnik kreiran!" : "✅ Promjene spremljene!");
      setFormData(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(`❌ ${err.message || "Greška pri spremanju"}`);
    }
  };

  const handleDelete = async (u: User) => {
    if (
      !confirm(`Jeste li sigurni da želite obrisati korisnika ${u.username}?`)
    )
      return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setUsers(users.filter((user) => user.id !== u.id));
        setMessage("✅ Korisnik obrisan.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage("⚠️ Brisanje nije uspjelo.");
    }
  };

  const processedData = useMemo(() => {
    let result = [...users].filter(
      (u) =>
        (u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (roleFilter === "all" || u.role === roleFilter)
    );

    if (sortConfig && sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, searchTerm, roleFilter, sortConfig]);

  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<User>[] = [
    {
      key: "username",
      label: "KORISNIK",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-10 w-10 rounded-full bg-[#1a1a1a] border border-[#262626] overflow-hidden flex-shrink-0">
            {row.imageUrl ? (
              <img
                src={getAvatarUrl(row.imageUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-600">
                <ImageIcon size={18} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base leading-tight">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-xs text-gray-500">@{row.username}</span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "EMAIL",
      sortable: true,
      render: (v) => <span className="text-gray-300 font-medium">{v}</span>,
    },
    {
      key: "city",
      label: "GRAD",
      sortable: true,
      render: (v) => (
        <span className="text-gray-400 font-medium">{v || "-"}</span>
      ),
    },
    {
      key: "role",
      label: "ULOGA",
      sortable: true,
      render: (v) => (
        <span className={`status-badge badge-role-${String(v).toLowerCase()}`}>
          {v}
        </span>
      ),
    },
    {
      key: "enabled",
      label: "STATUS",
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2">
          {v ? (
            <UserCheck size={16} className="text-emerald-400" />
          ) : (
            <UserX size={16} className="text-red-400" />
          )}
          <span
            className={
              v
                ? "text-emerald-400 font-semibold"
                : "text-red-400 font-semibold text-xs"
            }
          >
            {v ? "AKTIVAN" : "ONEMOGUĆEN"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-main p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Upravljanje korisnicima
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
        <button
          className="btn-primary"
          onClick={() =>
            setFormData({
              id: 0,
              role: "USER",
              enabled: true,
              gender: "FEMALE",
              city: "",
              dateOfBirth: "",
              imageUrl: "",
            })
          }
        >
          <Plus size={18} className="mr-2" /> Dodaj korisnika
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Pretraži korisnike..."
        >
          <select
            className="filter-input bg-[#141414] text-white border-[#262626] rounded-lg h-[40px] px-3 outline-none"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Sve uloge</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="GUEST">GUEST</option>
          </select>
        </FilterBar>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">
            Učitavanje...
          </div>
        ) : (
          <DataTable<User>
            data={paginatedData}
            columns={columns}
            onEdit={(row) => setFormData({ ...row })}
            onDelete={handleDelete}
            className="data-table"
            onSort={(key, direction) =>
              setSortConfig({ key: key as keyof User, direction })
            }
          />
        )}
      </div>

      <div className="flex justify-center pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(processedData.length / itemsPerPage) || 1}
          onPageChange={setCurrentPage}
          totalItems={processedData.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      <Modal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        title={formData?.id === 0 ? "Novi korisnik" : "Uredi korisnika"}
      >
        {formData && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Ime
                </label>
                <input
                  className="input-field"
                  value={formData.firstName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Prezime
                </label>
                <input
                  className="input-field"
                  value={formData.lastName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Grad
                </label>
                <input
                  className="input-field"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Datum rođenja
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.dateOfBirth?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Korisničko ime
              </label>
              <input
                className="input-field"
                value={formData.username || ""}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase">
                URL Slike
              </label>
              <input
                className="input-field"
                placeholder="/uploads/..."
                value={formData.imageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Email
              </label>
              <input
                className="input-field"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Uloga
                </label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
                >
                  <option value="GUEST">GUEST</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Spol
                </label>
                <select
                  className="input-field"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as any })
                  }
                >
                  <option value="MALE">M</option>
                  <option value="FEMALE">Ž</option>
                  <option value="OTHER">O</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Status
                </label>
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
                  <option value="true">AKTIVAN</option>
                  <option value="false">ONEMOGUĆEN</option>
                </select>
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
