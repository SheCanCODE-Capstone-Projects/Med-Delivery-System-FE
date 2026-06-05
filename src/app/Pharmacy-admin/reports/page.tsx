"use client";
import React, { useEffect, useState } from "react";
import {
  TrendingUp, Package2, Users, ClipboardList,
  DollarSign, AlertTriangle, CheckCircle2, XCircle, Loader2, AlertCircle, Printer,
} from "lucide-react";
import { getMyPharmacy, getMyPharmacyOrders, getInventory, getPharmacistsByPharmacy } from "@/services/pharmacyApi";
import type { OrderResponse, PharmacyInventoryResponse, PharmacistResponse } from "@/types/api";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(n);
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleString("en", { month: "short" });
}

// ── bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ bars, color = "#0E9384" }: {
  bars: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="flex items-end gap-2 h-36 w-full print:hidden">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-slate-600">{b.value}</span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{ height: `${Math.max((b.value / max) * 112, b.value ? 6 : 2)}px`, background: color, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
          />
          <span className="text-[10px] text-slate-500 truncate w-full text-center">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── line chart (SVG polyline) ─────────────────────────────────────────────────

function LineChart({ points, color = "#6366f1" }: {
  points: { label: string; value: number }[];
  color?: string;
}) {
  const W = 300, H = 100;
  const max = Math.max(...points.map(p => p.value), 1);
  const n = points.length;
  if (n === 0) return <p className="text-sm text-slate-400 text-center py-10">No data</p>;
  const xs = points.map((_, i) => n === 1 ? W / 2 : (i / (n - 1)) * (W - 24) + 12);
  const ys = points.map(p => H - Math.max((p.value / max) * (H - 20), p.value > 0 ? 6 : 0) - 4);
  const poly = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" style={{ height: 136 }}>
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="4" fill="white" stroke={color} strokeWidth="2" />
          <text x={x} y={Math.max(ys[i] - 7, 10)} textAnchor="middle" fontSize="9" fontWeight="600" fill={color}>{points[i].value}</text>
          <text x={x} y={H + 18} textAnchor="middle" fontSize="9" fill="#94a3b8">{points[i].label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── area chart (SVG area) ─────────────────────────────────────────────────────

function AreaChart({ points, color = "#8b5cf6" }: {
  points: { label: string; value: number }[];
  color?: string;
}) {
  const W = 300, H = 100;
  const max = Math.max(...points.map(p => p.value), 1);
  const n = points.length;
  if (n === 0) return <p className="text-sm text-slate-400 text-center py-10">No data</p>;
  const xs = points.map((_, i) => n === 1 ? W / 2 : (i / (n - 1)) * (W - 24) + 12);
  const ys = points.map(p => H - Math.max((p.value / max) * (H - 20), p.value > 0 ? 6 : 0) - 4);
  const lineStr = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const areaStr = `${xs[0]},${H} ${lineStr} ${xs[n - 1]},${H}`;
  const gradId = `ag${color.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" style={{ height: 136 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaStr} fill={`url(#${gradId})`} />
      <polyline points={lineStr} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="4" fill="white" stroke={color} strokeWidth="2" />
          <text x={x} y={Math.max(ys[i] - 7, 10)} textAnchor="middle" fontSize="9" fontWeight="600" fill={color}>{points[i].value}</text>
          <text x={x} y={H + 18} textAnchor="middle" fontSize="9" fill="#94a3b8">{points[i].label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
      <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [inventory, setInventory] = useState<PharmacyInventoryResponse[]>([]);
  const [pharmacists, setPharmacists] = useState<PharmacistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const ph = await getMyPharmacy();
        const [o, inv, pharm] = await Promise.all([
          getMyPharmacyOrders(ph.id).catch(() => []),
          getInventory(ph.id).catch(() => []),
          getPharmacistsByPharmacy(ph.id).catch(() => []),
        ]);
        setOrders(o);
        setInventory(inv);
        setPharmacists(pharm);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading reports…</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-600">
      <AlertCircle size={32} /><p>{error}</p>
    </div>
  );

  // ── derived metrics ──────────────────────────────────────────────────────

  const completed  = orders.filter(o => o.status === "COMPLETED");
  const cancelled  = orders.filter(o => o.status === "CANCELLED");
  const active     = orders.filter(o => !["COMPLETED","CANCELLED"].includes(o.status));
  const revenue    = completed.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const lowStock   = inventory.filter(i => i.quantity < 10);

  // orders by status
  const statusGroups: Record<string, number> = {};
  orders.forEach(o => { statusGroups[o.status] = (statusGroups[o.status] ?? 0) + 1; });
  const statusBars = Object.entries(statusGroups)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label: label.replace(/_/g, " "), value }));

  // orders by month (last 6 months)
  const monthMap: Record<string, number> = {};
  orders.forEach(o => {
    const key = monthLabel(o.createdAt);
    monthMap[key] = (monthMap[key] ?? 0) + 1;
  });
  const monthBars = Object.entries(monthMap).slice(-6).map(([label, value]) => ({ label, value }));

  // revenue by month
  const revMap: Record<string, number> = {};
  completed.forEach(o => {
    const key = monthLabel(o.createdAt);
    revMap[key] = (revMap[key] ?? 0) + (o.totalAmount ?? 0);
  });
  const revBars = Object.entries(revMap).slice(-6).map(([label, value]) => ({ label, value: Math.round(value / 1000) }));

  // top medicines by quantity
  const topMeds = [...inventory].sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  const maxMedQty = Math.max(...topMeds.map(m => m.quantity), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <style>{`
        @media print {
          nav, aside, header, [data-sidebar], .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; font-size: 12px; }
          .shadow-sm, .shadow-md { box-shadow: none !important; }
          .rounded-2xl, .rounded-xl { border-radius: 4px !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pharmacy Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Live summary derived from your pharmacy data</p>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
        >
          <Printer size={16} />
          Print Report
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Total Orders"     value={orders.length}    color="bg-[#0E9384]" />
        <StatCard icon={CheckCircle2} label="Completed"         value={completed.length} color="bg-emerald-500" />
        <StatCard icon={TrendingUp}   label="Active / Pending"  value={active.length}    color="bg-sky-500" />
        <StatCard icon={DollarSign}   label="Total Revenue"     value={fmt(revenue)}     color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={XCircle}      label="Cancelled Orders"  value={cancelled.length}   color="bg-rose-500" />
        <StatCard icon={Package2}     label="Inventory Items"   value={inventory.length}   color="bg-amber-500" />
        <StatCard icon={AlertTriangle}label="Low Stock (< 10)"  value={lowStock.length}    color="bg-orange-500" />
        <StatCard icon={Users}        label="Pharmacists"       value={pharmacists.length} color="bg-indigo-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Orders by status — Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 col-span-1">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Orders by Status</h2>
          <p className="text-[10px] text-slate-400 mb-4">Bar chart — order count per status</p>
          {statusBars.length === 0
            ? <p className="text-sm text-slate-400 text-center py-10">No orders yet</p>
            : <BarChart bars={statusBars} color="#0E9384" />}
          {/* print fallback */}
          <table className="hidden print:table w-full text-xs mt-2 border-collapse">
            <thead><tr><th className="text-left border border-slate-200 px-2 py-1">Status</th><th className="text-right border border-slate-200 px-2 py-1">Count</th></tr></thead>
            <tbody>{statusBars.map(b => <tr key={b.label}><td className="border border-slate-200 px-2 py-1">{b.label}</td><td className="border border-slate-200 px-2 py-1 text-right">{b.value}</td></tr>)}</tbody>
          </table>
        </div>

        {/* Orders by month — Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 col-span-1">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Orders per Month</h2>
          <p className="text-[10px] text-slate-400 mb-4">Line chart — monthly order trend</p>
          {monthBars.length === 0
            ? <p className="text-sm text-slate-400 text-center py-10">No orders yet</p>
            : <LineChart points={monthBars} color="#6366f1" />}
          <table className="hidden print:table w-full text-xs mt-2 border-collapse">
            <thead><tr><th className="text-left border border-slate-200 px-2 py-1">Month</th><th className="text-right border border-slate-200 px-2 py-1">Orders</th></tr></thead>
            <tbody>{monthBars.map(b => <tr key={b.label}><td className="border border-slate-200 px-2 py-1">{b.label}</td><td className="border border-slate-200 px-2 py-1 text-right">{b.value}</td></tr>)}</tbody>
          </table>
        </div>

        {/* Revenue by month — Area Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 col-span-1">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Revenue per Month</h2>
          <p className="text-[10px] text-slate-400 mb-4">Area chart — revenue in RWF&apos;000</p>
          {revBars.length === 0
            ? <p className="text-sm text-slate-400 text-center py-10">No completed orders</p>
            : <AreaChart points={revBars} color="#8b5cf6" />}
          <table className="hidden print:table w-full text-xs mt-2 border-collapse">
            <thead><tr><th className="text-left border border-slate-200 px-2 py-1">Month</th><th className="text-right border border-slate-200 px-2 py-1">Revenue (RWF&apos;000)</th></tr></thead>
            <tbody>{revBars.map(b => <tr key={b.label}><td className="border border-slate-200 px-2 py-1">{b.label}</td><td className="border border-slate-200 px-2 py-1 text-right">{b.value}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      {/* Inventory bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Top Medicines by Stock Level</h2>
        {inventory.length === 0
          ? <p className="text-sm text-slate-400 text-center py-10">No inventory items</p>
          : (
            <div className="space-y-3">
              {topMeds.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 w-36 min-w-0 truncate overflow-hidden flex-shrink-0" title={item.medicineName}>{item.medicineName}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden min-w-0">
                    <div
                      className={`h-full rounded-full transition-all ${item.quantity < 10 ? "bg-rose-400" : "bg-[#0E9384]"}`}
                      style={{ width: `${(item.quantity / maxMedQty) * 100}%`, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
                    />
                  </div>
                  <span className={`text-xs font-semibold w-16 text-right flex-shrink-0 ${item.quantity < 10 ? "text-rose-600" : "text-slate-700"}`}>
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Low stock alert table */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-rose-500" />
            <h2 className="text-sm font-semibold text-rose-700">Low Stock Alerts ({lowStock.length} items)</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-2 font-semibold text-slate-500">Medicine</th>
                <th className="text-right pb-2 font-semibold text-slate-500">Qty</th>
                <th className="text-right pb-2 font-semibold text-slate-500">Unit</th>
                <th className="text-right pb-2 font-semibold text-slate-500">Price (RWF)</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(item => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-700">{item.medicineName}</td>
                  <td className="py-2 text-right font-bold text-rose-600">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-500">{item.unit}</td>
                  <td className="py-2 text-right text-slate-700">{item.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent orders table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent Orders (last 10)</h2>
        {orders.length === 0
          ? <p className="text-sm text-slate-400 text-center py-6">No orders yet</p>
          : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 font-semibold text-slate-500">ID</th>
                  <th className="text-left pb-2 font-semibold text-slate-500">Patient</th>
                  <th className="text-left pb-2 font-semibold text-slate-500">Status</th>
                  <th className="text-right pb-2 font-semibold text-slate-500">Amount</th>
                  <th className="text-right pb-2 font-semibold text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10).map(o => (
                    <tr key={o.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 text-slate-400">#{o.id}</td>
                      <td className="py-2 text-slate-700">{o.patientName}</td>
                      <td className="py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          o.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                          o.status === "CANCELLED" ? "bg-rose-100 text-rose-700" :
                          "bg-sky-100 text-sky-700"
                        }`}>{o.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-2 text-right text-slate-700">
                        {o.totalAmount ? fmt(o.totalAmount) : "—"}
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
