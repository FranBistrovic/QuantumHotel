"use client";

import { useState, useEffect } from "react";
import {
  DoorOpen,
  CalendarCheck,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileCode,
  AlertCircle,
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

const API_BASE_URL = "http://localhost:8080/api/admin/statistics";

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const COLORS = {
    CONFIRMED: "#10b981",
    PENDING: "#f59e0b",
    REJECTED: "#ef4444",
  };

  useEffect(() => {
    fetchStatistics();
  }, [startDate, endDate]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setDataReservations(data.monthlyData || []);

        const mappedStatus = (data.statusData || []).map((item: any) => ({
          ...item,
          color: COLORS[item.name as keyof typeof COLORS] || "#444",
        }));
        setDataStatus(mappedStatus);

        setTotals({
          occupancy: data.totals?.occupancy || "0%",
          monthlyProfit: `${data.totals?.monthlyProfit || 0} €`,
          newReservations: data.totals?.newReservations || 0,
          totalProfit: `${data.totals?.totalProfit || 0} €`,
        });
      } else {
        setMessage("⚠️ Greška pri dohvaćanju statistike.");
      }
    } catch (err) {
      setMessage("⚠️ Veza sa serverom nije uspjela.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    const url = `${API_BASE_URL}/export/${format}?startDate=${startDate}&endDate=${endDate}`;
    window.open(url, "_blank");
  };

  return (
    <div className="stats-page-container p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Statistika poslovanja
          </h1>
          {message && (
            <p className="text-xs text-red-400 mt-2 font-medium">{message}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("xml")}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-2"
          >
            <FileCode size={14} /> XML
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-2"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            <Download size={16} /> Izvezi PDF
          </button>
        </div>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4 flex flex-wrap gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Od datuma
          </label>
          <input
            type="date"
            className="input-field bg-[#141414] py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Do datuma
          </label>
          <input
            type="date"
            className="input-field bg-[#141414] py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500 italic text-sm">
          Učitavanje podataka...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Popunjenost"
              value={totals.occupancy}
              icon={<DoorOpen />}
              colorClass="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              label="Prihod (Period)"
              value={totals.monthlyProfit}
              icon={<TrendingUp />}
              colorClass="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              label="Nove rezervacije"
              value={totals.newReservations.toString()}
              icon={<CalendarCheck />}
              colorClass="bg-pink-500/10 text-pink-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0f0f0f] border border-[#262626] p-6 rounded-xl shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">
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
                      stroke="#555"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#555"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#1a1a1a" }}
                      contentStyle={{
                        backgroundColor: "#0f0f0f",
                        border: "1px solid #262626",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="profit"
                      fill="#9b1c31"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-[#262626] p-6 rounded-xl shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-widest">
                Statusi rezervacija
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataStatus}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {dataStatus.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f0f0f",
                        border: "1px solid #262626",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {Object.entries(COLORS).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">
                      {key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, colorClass }: any) {
  return (
    <div className="bg-[#0f0f0f] border border-[#262626] p-6 rounded-xl flex items-center gap-4 shadow-sm hover:border-gray-700 transition-colors">
      <div className={`p-3 rounded-lg ${colorClass}`}>{icon}</div>
      <div>
        <span className="text-gray-500 text-xs uppercase font-bold tracking-tight block">
          {label}
        </span>
        <span className="text-2xl font-bold text-white block">{value}</span>
      </div>
    </div>
  );
}
