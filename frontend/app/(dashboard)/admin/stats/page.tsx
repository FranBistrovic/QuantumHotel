"use client";

import { useState, useEffect } from "react";
import {
  DoorOpen,
  CalendarCheck,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export default function StatsPage() {
  const [dataReservations, setDataReservations] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);
  const [totals, setTotals] = useState({
    occupancy: "0%",
    monthlyProfit: "0 €",
    newReservations: 0,
    totalProfit: "0 €",
  });

  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  const handleExport = (format: "pdf" | "xlsx" | "xml") => {
    const url = `http://localhost:8080/api/statistics/export/${format}?startDate=${startDate}&endDate=${endDate}`;
    window.open(url, "_blank");
  };

  return (
    <div className="stats-page-container p-6">
      <div className="page-header-responsive mb-6">
        <h1 className="page-title text-2xl font-bold text-white">
          Statistika poslovanja
        </h1>

        <div className="flex gap-2">
          <button
            className="btn-secondary btn-small"
            onClick={() => handleExport("xml")}
          >
            <FileCode size={16} /> XML
          </button>
          <button
            className="btn-secondary btn-small"
            onClick={() => handleExport("xlsx")}
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => handleExport("pdf")}
          >
            <Download size={18} /> <span>Izvezi PDF</span>
          </button>
        </div>
      </div>

      {/* Filter datuma */}
      <div className="filter-bar-stats mb-6 flex gap-4 p-4 bg-[#141414] rounded-lg border border-[#262626]">
        <div className="form-group mb-0">
          <label className="text-xs text-gray-400">Početni datum</label>
          <input
            type="date"
            className="input-field py-1"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group mb-0">
          <label className="text-xs text-gray-400">Završni datum</label>
          <input
            type="date"
            className="input-field py-1"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card bg-[#141414] p-6 rounded-xl border border-[#262626] flex items-center gap-4">
          <div className="stat-icon p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <DoorOpen />
          </div>
          <div className="stat-info">
            <span className="stat-label text-gray-400 text-sm block">
              Popunjenost
            </span>
            <span className="stat-value text-2xl font-bold text-white">
              {totals.occupancy}
            </span>
          </div>
        </div>

        <div className="stat-card bg-[#141414] p-6 rounded-xl border border-[#262626] flex items-center gap-4">
          <div className="stat-icon p-3 bg-green-500/10 text-green-500 rounded-lg">
            <TrendingUp />
          </div>
          <div className="stat-info">
            <span className="stat-label text-gray-400 text-sm block">
              Mjesečni Prihod
            </span>
            <span className="stat-value text-2xl font-bold text-white">
              {totals.monthlyProfit}
            </span>
          </div>
        </div>

        <div className="stat-card bg-[#141414] p-6 rounded-xl border border-[#262626] flex items-center gap-4">
          <div className="stat-icon p-3 bg-pink-500/10 text-pink-500 rounded-lg">
            <CalendarCheck />
          </div>
          <div className="stat-info">
            <span className="stat-label text-gray-400 text-sm block">
              Nove rezervacije
            </span>
            <span className="stat-value text-2xl font-bold text-white">
              {totals.newReservations}
            </span>
          </div>
        </div>
      </div>

      <div className="charts-responsive-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-card bg-[#141414] p-6 rounded-xl border border-[#262626]">
          <h3 className="chart-title text-lg font-semibold text-white mb-4">
            Prihod po mjesecima (€)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataReservations}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#262626"
                />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141414",
                    border: "1px solid #262626",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="profit" fill="#9b1c31" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card bg-[#141414] p-6 rounded-xl border border-[#262626]">
          <h3 className="chart-title text-lg font-semibold text-white mb-4">
            Statusi rezervacija
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStatus}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#444"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
