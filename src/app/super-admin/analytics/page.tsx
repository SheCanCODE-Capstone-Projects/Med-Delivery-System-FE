"use client";
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  Package,
  ShieldCheck,
  ArrowUpRight,
  Globe,
  Activity,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { getDashboardStats, getAnalyticsReport, getLowStockAlerts } from '@/services/adminApi';
import type { DashboardStatsResponse, AnalyticsReportResponse } from '@/types/api';

interface LowStockItem {
  id: number;
  medicineName: string;
  quantity: number;
  unit: string;
  lowStockThreshold?: number;
  pharmacyName?: string;
}

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  sub?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        {sub && <p className="text-xs text-teal-600 font-semibold mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [report, setReport] = useState<AnalyticsReportResponse | null>(null);
  const [period, setPeriod] = useState<Period>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDashboardStats(),
      getAnalyticsReport(period),
      getLowStockAlerts(10),
    ])
      .then(([s, r, ls]) => {
        setStats(s);
        setReport(r);
        setLowStock(ls as LowStockItem[]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-600">
        <AlertCircle size={36} />
        <p className="font-semibold">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-teal-600 underline">
          Retry
        </button>
      </div>
    );
  }

  const PERIODS: { label: string; value: Period }[] = [
    { label: '24h', value: 'DAILY' },
    { label: '7d', value: 'WEEKLY' },
    { label: '30d', value: 'MONTHLY' },
    { label: 'Yearly', value: 'YEARLY' },
  ];

  const statCards = [
    {
      label: 'Total Pharmacies',
      value: stats?.totalPharmacies ?? 0,
      icon: Building2,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      sub: `${stats?.pendingApprovals ?? 0} pending approval`,
    },
    {
      label: 'Active Patients',
      value: stats?.totalPatients ?? 0,
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      sub: `${stats?.ordersToday ?? 0} today`,
    },
    {
      label: 'Active Pharmacists',
      value: stats?.activePharmacists ?? 0,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Analytics</h1>
          <p className="text-slate-500 mt-1">Real-time overview of MedDelivery platform performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  period === p.value
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Analytics Report */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-teal-600" />
              Order Summary — {report.period}
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Total Orders', value: report.totalOrders ?? 0, color: 'bg-teal-500' },
                { label: 'Completed', value: report.completedOrders ?? 0, color: 'bg-emerald-500' },
                { label: 'Cancelled', value: report.cancelledOrders ?? 0, color: 'bg-rose-400' },
                { label: 'New Patients', value: report.newPatients ?? 0, color: 'bg-sky-500' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-bold text-slate-800">{row.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${row.color} rounded-full`}
                      style={{
                        width: report.totalOrders > 0
                          ? `${Math.min(100, (row.value / report.totalOrders) * 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Globe size={20} className="text-sky-600" />
              Platform Health
            </h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {[
                { label: 'Revenue', value: `RWF ${(report.totalRevenue ?? 0).toLocaleString()}`, icon: ArrowUpRight, tone: 'text-emerald-600 bg-emerald-50' },
                { label: 'Active Pharmacies', value: report.activePharmacies ?? 0, icon: Building2, tone: 'text-sky-600 bg-sky-50' },
                { label: 'New Patients', value: report.newPatients ?? 0, icon: Users, tone: 'text-teal-600 bg-teal-50' },
                { label: 'Low Stock Alerts', value: stats?.lowStockAlerts ?? 0, icon: AlertCircle, tone: 'text-orange-600 bg-orange-50' },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-slate-100 p-4 flex flex-col gap-2">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${card.tone}`}>
                    <card.icon size={16} />
                  </span>
                  <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                  <p className="text-xl font-bold text-slate-800">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Pulse */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Activity size={20} className="text-orange-600" />
          Platform Pulse
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Orders', value: stats?.totalOrders ?? 0 },
            { label: 'Pending Approvals', value: stats?.pendingApprovals ?? 0 },
            { label: 'Active Pharmacists', value: stats?.activePharmacists ?? 0 },
            { label: 'Low Stock Alerts', value: stats?.lowStockAlerts ?? 0 },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-1">{item.label}</p>
              <p className="text-2xl font-bold text-slate-800">{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Low Stock Alerts</h3>
            <p className="text-xs text-slate-500">Inventory items below threshold across all pharmacies</p>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-bold">
            {lowStock.length} items
          </span>
        </div>
        {lowStock.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <AlertTriangle size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No low stock alerts — all pharmacies are well stocked.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Medicine</th>
                  <th className="px-6 py-3">Pharmacy</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Threshold</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition text-sm">
                    <td className="px-6 py-3 font-semibold text-slate-800">{item.medicineName}</td>
                    <td className="px-6 py-3 text-slate-500">{item.pharmacyName ?? '—'}</td>
                    <td className="px-6 py-3 font-bold text-orange-600">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {item.lowStockThreshold != null ? `≤ ${item.lowStockThreshold} ${item.unit}` : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
