"use client";
import { useEffect, useState } from "react";
import {
  TrendingUp, Package2, Users, ClipboardList,
  DollarSign, AlertTriangle, CheckCircle2, XCircle, Loader2, AlertCircle,
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

// ── pure-CSS bar chart ────────────────────────────────────────────────────────

function BarChart({ bars, color = "#0E9384" }: {
  bars: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-slate-600">{b.value}</span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{ height: `${Math.max((b.value / max) * 112, b.value ? 6 : 2)}px`, background: color }}
          />
          <span className="text-[10px] text-slate-500 truncate w-full text-center">{b.label}</span>
        </div>
      ))}
    </div>
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pharmacy Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Live summary derived from your pharmacy data</p>
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

        {/* Orders by status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 col-span-1">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">Orders by Status</h2>
          {statusBars.length === 0
            ? <p className="text-sm text-slate-400 text-center py-10">No orders yet</p>
            : <BarChart bars={statusBars} color="#0E9384" />}
        </div>

        {/* Orders by month */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 col-span-1">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">Orders per Month</h2>
          {monthBars.length === 0
            ? <p className="text-sm text-slate-400 text-center py-10">No orders yet</p>
            : <BarChart bars={monthBars} color="#6366f1" />}
        </div>

        {/* Revenue by month */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 col-span-1">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Revenue per Month <span className="text-[10px] text-slate-400">(RWF '000)</span></h2>
          {revBars.length === 0
            ? <p className="text-sm text-slate-400 text-center py-10">No completed orders</p>
            : <BarChart bars={revBars} color="#8b5cf6" />}
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
                  <span className="text-sm text-slate-700 w-44 truncate flex-shrink-0">{item.medicineName}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.quantity < 10 ? "bg-rose-400" : "bg-[#0E9384]"}`}
                      style={{ width: `${(item.quantity / maxMedQty) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${item.quantity < 10 ? "text-rose-600" : "text-slate-700"}`}>
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
