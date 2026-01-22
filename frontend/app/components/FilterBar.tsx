"use client";

import { ReactNode } from "react";
import { Search } from "lucide-react";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Pretraži...",
  children,
}: FilterBarProps) {
  return (
    <div
      className="filter-bar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ position: "relative", width: "280px" }}>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="filter-input"
          style={{
            paddingRight: "40px",
            width: "100%",
            paddingLeft: "12px",
            height: "40px",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        />
        <Search
          size={18}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#6b7280",
          }}
        />
      </div>
      {children}
    </div>
  );
}
