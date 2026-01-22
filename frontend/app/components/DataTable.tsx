"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export type SortDirection = "asc" | "desc";

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onConfirm?: (row: T) => void;
  onReject?: (row: T) => void;
  onRowClick?: (row: T) => void;
  actions?: boolean;
  className?: string;
  onSort?: (key: keyof T, direction: SortDirection) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onConfirm,
  onReject,
  onRowClick,
  actions = true,
  className = "",
  onSort,
}: DataTableProps<T>) {
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const handleSort = (key: string) => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    if (onSort) onSort(key as keyof T, newDirection);
  };

  return (
    <table className={`datatable-table ${className}`}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>
              <span>{col.label}</span>
              {col.sortable && (
                <button
                  onClick={() => handleSort(String(col.key))}
                  style={{
                    marginLeft: "0.25rem",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    color: "inherit",
                  }}
                >
                  ↕
                </button>
              )}
            </th>
          ))}
          {actions && <th>Akcije</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={row.id}
            className={idx % 2 === 0 ? "row-even" : ""}
            onClick={() => onRowClick && onRowClick(row)}
            style={{ cursor: onRowClick ? "pointer" : "default" }}
          >
            {columns.map((col) => (
              <td key={String(col.key)} data-label={col.label}>
                {col.render
                  ? col.render(row[col.key as keyof T], row)
                  : String(row[col.key as keyof T] ?? "")}
              </td>
            ))}
            {actions && (
              <td data-label="Akcije">
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "inherit",
                  }}
                >
                  {onConfirm && (
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirm(row);
                      }}
                      title="Potvrdi"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  {onReject && (
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(row);
                      }}
                      title="Odbij"
                    >
                      <X size={18} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                      }}
                      title="Uredi"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row);
                      }}
                      title="Obriši"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
