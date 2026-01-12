"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Moon,
  Users,
  BarChart3,
  AlertCircle,
  RefreshCw,
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
  Legend,
} from "recharts";

const API_BASE = "/api/statistics";

type StatView = "overnights" | "guests-structure" | "addons";

export default function StatisticsPage() {
  const [activeView, setActiveView] = useState<StatView>("overnights");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  useEffect(() => {
    fetchStatistics();
  }, [startDate, endDate]);

  const fetchStatistics = async () => {
    setLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`${API_BASE}?${params}`);

      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      } else {
        setMessage("⚠️ Greška pri dohvaćanju podataka.");
        setStatsData(null);
      }
    } catch (err) {
      setMessage("⚠️ Veza sa serverom nije uspostavljena.");
      setStatsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "pdf" | "xml" | "xlsx") => {
    const params = new URLSearchParams({ startDate, endDate });
    const exportPath = `${API_BASE}/export/${format}`;
    window.open(`${exportPath}?${params}`, "_blank");
  };

  return (
    <div className="dashboard-main p-6 space-y-6 text-white bg-[#050505] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Statistika hotela
          </h1>
          {message && (
            <p className="text-xs mt-2 font-medium text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {message}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {["pdf", "xlsx", "xml"].map((f) => (
            <button
              key={f}
              onClick={() => handleExport(f as any)}
              className="btn-secondary text-[11px] px-3 py-2 flex items-center gap-2 border border-[#262626] rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all"
            >
              <Download size={14} /> {f.toUpperCase()}
            </button>
          ))}
          <button
            onClick={fetchStatistics}
            className="btn-secondary p-2 border border-[#262626] rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a]"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4 flex flex-wrap items-end gap-6 shadow-xl">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Kategorija
          </label>
          <div className="flex bg-[#050505] p-1 rounded-lg border border-[#262626]">
            <NavBtn
              active={activeView === "overnights"}
              onClick={() => setActiveView("overnights")}
              label="Noćenja"
              icon={<Moon size={14} />}
            />
            <NavBtn
              active={activeView === "guests-structure"}
              onClick={() => setActiveView("guests-structure")}
              label="Gosti"
              icon={<Users size={14} />}
            />
            <NavBtn
              active={activeView === "addons"}
              onClick={() => setActiveView("addons")}
              label="Usluge"
              icon={<BarChart3 size={14} />}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Period
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              className="bg-[#050505] border border-[#262626] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500/50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="bg-[#050505] border border-[#262626] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500/50"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500 animate-pulse">
          Učitavanje...
        </div>
      ) : statsData ? (
        <div className="animate-in fade-in duration-500">
          {activeView === "overnights" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartContainer
                title="Popunjenost po jedinicama (%)"
                className="lg:col-span-2"
              >
                <BarChart data={statsData?.occupancyData}>
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
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
              <div className="space-y-4">
                <StatMiniCard
                  label="Ukupno noćenja"
                  value={statsData?.totalNights || 0}
                  icon={<Moon className="text-purple-500" />}
                />
                <StatMiniCard
                  label="Prosječna zauzetost"
                  value={`${statsData?.occupancyRate || 0}%`}
                  icon={<RefreshCw className="text-blue-500" />}
                />
              </div>
            </div>
          )}

          {activeView === "guests-structure" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartContainer title="Po državama">
                <PieChart>
                  <Pie
                    data={statsData?.countryData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statsData?.countryData?.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f0f0f",
                      border: "1px solid #262626",
                    }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ChartContainer>
              <ChartContainer title="Dobna struktura">
                <BarChart data={statsData?.ageData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="range"
                    type="category"
                    stroke="#ccc"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {activeView === "addons" && (
            <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-[#141414] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#262626]">
                  <tr>
                    <th className="p-4">Usluga</th>
                    <th className="p-4 text-center">Korištenja</th>
                    <th className="p-4 text-right">Prihod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {statsData?.services?.map((s: any, i: number) => (
                    <tr
                      key={i}
                      className="hover:bg-[#141414] transition-colors"
                    >
                      <td className="p-4 text-sm">{s.name}</td>
                      <td className="p-4 text-sm text-center font-mono text-gray-400">
                        {s.usageCount}
                      </td>
                      <td className="p-4 text-sm text-right text-emerald-400 font-bold">
                        {s.revenue?.toLocaleString()} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-[#262626] rounded-xl bg-[#0f0f0f]/50">
          <AlertCircle className="text-gray-600 mb-2" size={32} />
          <p className="text-gray-500 text-sm">
            Podaci nisu dostupni za odabrani period.
          </p>
        </div>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold transition-all ${
        active
          ? "bg-[#262626] text-white border border-[#333]"
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatMiniCard({ label, value, icon }: any) {
  return (
    <div className="bg-[#0f0f0f] border border-[#262626] p-6 rounded-xl flex items-center gap-4">
      <div className="p-3 bg-[#050505] rounded-lg border border-[#262626]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function ChartContainer({ title, children, className = "" }: any) {
  return (
    <div
      className={`bg-[#0f0f0f] border border-[#262626] p-6 rounded-xl ${className}`}
    >
      <h3 className="text-[11px] font-bold text-gray-400 uppercase mb-6 tracking-widest flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{" "}
        {title}
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
