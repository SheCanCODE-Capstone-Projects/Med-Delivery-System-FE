"use client";
import React, { useEffect, useState } from 'react';
import {
  TrendingUp, Users, Building2, Package, ShieldCheck,
  Globe, Activity, Loader2, AlertCircle, AlertTriangle, Printer,
} from 'lucide-react';
import {
  getDashboardStats,
  getAnalyticsReport,
  getLowStockAlerts,
  searchUsers,
} from '@/services/adminApi';
import { getAllPharmacies } from '@/services/pharmacyApi';
import { getSuperAdminReport, type SuperAdminReport } from '@/services/reportService';
import type { DashboardStatsResponse, AnalyticsReportResponse } from '@/types/api';
import PrintableReport from '@/components/report/PrintableReport';
import ReportTable from '@/components/report/ReportTable';

interface LowStockItem {
  id: number;
  medicineName: string;
  quantity: number;
  unit: string;
  lowStockThreshold?: number;
  pharmacyName?: string;
}

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

// ─── Role counts fetched individually ─────────────────────────────────────────
interface RoleCounts {
  patients: number;
  pharmacists: number;
  managers: number;
  admins: number;
}

// ─── Chart helpers ─────────────────────────────────────────────────────────────

function VerticalBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-sm font-bold text-slate-700">{value.toLocaleString()}</span>
      <div className="w-full h-28 bg-slate-100 rounded-lg flex items-end overflow-hidden">
        <div className={`w-full ${color} rounded-lg transition-all duration-700`} style={{ height: `${Math.max(pct, value > 0 ? 8 : 0)}%` }} />
      </div>
      <span className="text-[11px] text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-slate-400 text-sm">
        No users registered yet
      </div>
    );
  }
  const filtered = segments.filter(s => s.value > 0);
  const stops = filtered
    .reduce<string[]>((acc, seg, idx) => {
      const pct = (seg.value / total) * 100;
      const cumPct = filtered.slice(0, idx).reduce((sum, s) => sum + (s.value / total) * 100, 0);
      return [...acc, `${seg.color} ${cumPct.toFixed(2)}% ${(cumPct + pct).toFixed(2)}%`];
    }, [])
    .join(', ');

  return (
    <div className="flex items-center gap-8">
      <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
        />
        <div
          className="absolute rounded-full bg-white flex flex-col items-center justify-center"
          style={{ top: '20%', left: '20%', width: '60%', height: '60%' }}
        >
          <span className="text-lg font-black text-slate-800">{total.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 font-medium">users</span>
        </div>
      </div>
      <div className="space-y-2.5 flex-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-slate-600 flex-1">{seg.label}</span>
            <span className="text-xs font-bold text-slate-800">{seg.value.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 w-8 text-right">
              {total > 0 ? `${Math.round((seg.value / total) * 100)}%` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, sub }: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; bg: string; sub?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${bg} ${color}`}><Icon size={20} /></div>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      {sub && <p className="text-xs text-teal-600 font-semibold mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [report, setReport] = useState<AnalyticsReportResponse | null>(null);
  const [comprehensiveReport, setComprehensiveReport] = useState<SuperAdminReport | null>(null);
  const [period, setPeriod] = useState<Period>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({ patients: 0, pharmacists: 0, managers: 0, admins: 0 });
  const [pharmacyCount, setPharmacyCount] = useState(0);
  const [pendingPharmacyCount, setPendingPharmacyCount] = useState(0);
  const [activePharmacyCount, setActivePharmacyCount] = useState(0);

  useEffect(() => {
    setLoading(true);

    // Each role count is fetched independently with size:1 — reliable and fast
    const countByRole = (role: string) =>
      searchUsers({ role, page: 0, size: 1 })
        .then((r) => r.totalElements ?? 0)
        .catch(() => 0);

    Promise.all([
      getDashboardStats().catch(() => null),
      getAnalyticsReport(period).catch(() => null),
      getLowStockAlerts(10).catch(() => []),
      countByRole('PATIENT'),
      countByRole('PHARMACIST'),
      countByRole('MANAGER'),
      countByRole('SUPER_ADMIN'),
      getAllPharmacies().catch(() => []),
      getSuperAdminReport().catch(() => null),
    ]).then(([s, r, ls, patients, pharmacists, managers, admins, pharmacies, cr]) => {
      setStats(s);
      setReport(r);
      setComprehensiveReport(cr as SuperAdminReport | null);
      setLowStock(ls as LowStockItem[]);
      setRoleCounts({ patients, pharmacists, managers, admins });
      const pharmList = pharmacies as { status: string }[];
      setPharmacyCount(pharmList.length);
      setPendingPharmacyCount(pharmList.filter(p => p.status === 'PENDING_APPROVAL' || p.status === 'PENDING').length);
      setActivePharmacyCount(pharmList.filter(p => p.status === 'ACTIVE').length);
    })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-600">
        <AlertCircle size={36} />
        <p className="font-semibold">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-teal-600 underline">Retry</button>
      </div>
    );
  }

  const PERIODS: { label: string; value: Period }[] = [
    { label: '24h', value: 'DAILY' },
    { label: '7d', value: 'WEEKLY' },
    { label: '30d', value: 'MONTHLY' },
    { label: 'Yearly', value: 'YEARLY' },
  ];

  // Real counts: take backend stats value if > 0, otherwise use our direct role queries
  const totalPatients    = Math.max(stats?.totalPatients ?? 0,    roleCounts.patients);
  const totalPharmacists = Math.max(stats?.activePharmacists ?? 0, roleCounts.pharmacists);
  const totalManagers    = roleCounts.managers;
  const totalPharmacies  = Math.max(stats?.totalPharmacies ?? 0,  pharmacyCount);
  const pendingApprovals = Math.max(stats?.pendingApprovals ?? 0, pendingPharmacyCount);
  const totalOrders      = Math.max(stats?.totalOrders ?? 0, report?.totalOrders ?? 0);
  const ordersToday      = stats?.ordersToday ?? 0;

  const statCards = [
    { label: 'Total Pharmacies',    value: totalPharmacies,  icon: Building2,   color: 'text-sky-600',     bg: 'bg-sky-50',     sub: pendingApprovals ? `${pendingApprovals} pending approval` : undefined },
    { label: 'Registered Patients', value: totalPatients,    icon: Users,       color: 'text-teal-600',    bg: 'bg-teal-50' },
    { label: 'Total Orders',        value: totalOrders,      icon: Package,     color: 'text-orange-600',  bg: 'bg-orange-50',  sub: ordersToday ? `${ordersToday} today` : undefined },
    { label: 'Active Pharmacists',  value: totalPharmacists, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const userSegments = [
    { label: 'Patients',    value: totalPatients,    color: '#14b8a6' },
    { label: 'Pharmacists', value: totalPharmacists, color: '#0ea5e9' },
    { label: 'Managers',    value: totalManagers,    color: '#8b5cf6' },
    { label: 'Admins',      value: roleCounts.admins, color: '#f59e0b' },
  ];

  const totalUsers = userSegments.reduce((s, x) => s + x.value, 0);

  const ordersMax = Math.max(
    report?.totalOrders ?? 0,
    report?.completedOrders ?? 0,
    report?.cancelledOrders ?? 0,
    report?.newPatients ?? 0,
    1
  );
  const orderBars = [
    { label: 'Total',       value: report?.totalOrders ?? 0,    color: 'bg-teal-500' },
    { label: 'Completed',   value: report?.completedOrders ?? 0, color: 'bg-emerald-500' },
    { label: 'Cancelled',   value: report?.cancelledOrders ?? 0, color: 'bg-rose-400' },
    { label: 'New Patients',value: report?.newPatients ?? 0,     color: 'bg-sky-500' },
  ];

  const activePharmacies = Math.max(report?.activePharmacies ?? 0, activePharmacyCount);

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Analytics</h1>
          <p className="text-slate-500 mt-1">Real-time overview of MedDelivery platform performance.</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${period === p.value ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Orders Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-teal-600" />
            Order Breakdown — {report?.period ?? period}
          </h3>
          <p className="text-xs text-slate-400 mb-5">Orders processed on the platform for the selected period.</p>
          <div className="flex items-end gap-4 h-36 px-2">
            {orderBars.map((b) => (
              <VerticalBar key={b.label} value={b.value} max={ordersMax} color={b.color} label={b.label} />
            ))}
          </div>
        </div>

        {/* User Distribution Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Users size={18} className="text-sky-600" />
            User Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            {totalUsers} registered user{totalUsers !== 1 ? 's' : ''} across all roles.
          </p>
          <DonutChart segments={userSegments} />
        </div>
      </div>

      {/* Platform Health + Pharmacy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
            <Globe size={18} className="text-sky-600" /> Platform Health
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Revenue', value: `RWF ${(report?.totalRevenue ?? 0).toLocaleString()}`, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
              { label: 'Active Pharmacies', value: activePharmacies, tone: 'text-sky-700 bg-sky-50 border-sky-100' },
              { label: 'New Patients', value: report?.newPatients ?? 0, tone: 'text-teal-700 bg-teal-50 border-teal-100' },
              { label: 'Low Stock Alerts', value: lowStock.length, tone: 'text-orange-700 bg-orange-50 border-orange-100' },
            ].map((c) => (
              <div key={c.label} className={`rounded-xl border p-4 ${c.tone}`}>
                <p className="text-xs font-semibold opacity-70">{c.label}</p>
                <p className="text-xl font-bold mt-1">{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
            <Building2 size={18} className="text-slate-600" /> Pharmacy Overview
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Total registered', value: totalPharmacies, color: 'bg-slate-400' },
              { label: 'Active', value: activePharmacies, color: 'bg-emerald-500' },
              { label: 'Pending approval', value: pendingApprovals, color: 'bg-amber-400' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-bold text-slate-800">{row.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full transition-all duration-700`}
                    style={{ width: totalPharmacies > 0 ? `${Math.min(100, (row.value / totalPharmacies) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Platform Pulse</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Orders', value: totalOrders },
                { label: 'Pending Approvals', value: pendingApprovals },
                { label: 'Active Pharmacists', value: totalPharmacists },
                { label: 'Low Stock Alerts', value: lowStock.length },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-medium">{item.label}</p>
                  <p className="text-lg font-bold text-slate-800">{item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-600"><Activity size={18} /></div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Platform Summary</h3>
            <p className="text-xs text-slate-500">Current user counts across all roles</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
          {[
            { label: 'Patients',    value: totalPatients,    color: 'text-teal-600',    dot: 'bg-teal-500' },
            { label: 'Pharmacists', value: totalPharmacists, color: 'text-sky-600',     dot: 'bg-sky-500' },
            { label: 'Managers',    value: totalManagers,    color: 'text-violet-600',  dot: 'bg-violet-500' },
            { label: 'Pharmacies',  value: totalPharmacies,  color: 'text-orange-600',  dot: 'bg-orange-500' },
          ].map((item) => (
            <div key={item.label} className="p-6 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              </div>
              <p className={`text-3xl font-black ${item.color}`}>{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Printable Report */}
      {comprehensiveReport && (
        <div className="mt-8">
          <PrintableReport
            title="Super Admin Comprehensive Report"
            generatedBy={comprehensiveReport.generatedBy}
            generatedDate={comprehensiveReport.generatedDate}
          >
            {/* Summary row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Pharmacies',  value: comprehensiveReport.totalPharmacies },
                { label: 'Total Branches',    value: comprehensiveReport.totalBranches },
                { label: 'Total Users',       value: comprehensiveReport.totalUsers },
                { label: 'Total Patients',    value: comprehensiveReport.totalPatients },
                { label: 'Total Orders',      value: comprehensiveReport.totalOrders },
                { label: 'Total Revenue',     value: `RWF ${(comprehensiveReport.totalRevenue ?? 0).toLocaleString()}` },
              ].map((c) => (
                <div key={c.label} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{c.value}</p>
                </div>
              ))}
            </div>

            <ReportTable
              title="Pharmacy Performance"
              columns={['Pharmacy', 'Branches', 'Staff', 'Orders', 'Revenue']}
              rows={(comprehensiveReport.pharmacyPerformance ?? []).map((r) => [
                r.pharmacyName, r.branches, r.staff, r.orders,
                `RWF ${(r.revenue ?? 0).toLocaleString()}`,
              ])}
              emptyMessage="No pharmacy data."
            />

            <ReportTable
              title="Users by Role"
              columns={['Role', 'Count']}
              rows={Object.entries(comprehensiveReport.userStatsByRole ?? {}).map(([role, count]) => [role, count])}
              emptyMessage="No user data."
            />

            <ReportTable
              title="Recent Audit Activities"
              columns={['User', 'Action', 'IP Address', 'Timestamp']}
              rows={(comprehensiveReport.recentAuditActivities ?? []).map((r) => [
                r.userEmail, r.action, r.ipAddress, r.timestamp,
              ])}
              emptyMessage="No audit log entries."
            />
          </PrintableReport>
        </div>
      )}

      {/* Print button for the comprehensive report */}
      {comprehensiveReport && (
        <div className="no-print flex justify-end mt-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition"
          >
            <Printer size={15} /> Print Comprehensive Report
          </button>
        </div>
      )}

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><AlertTriangle size={18} /></div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition text-sm">
                    <td className="px-6 py-3 font-semibold text-slate-800">{item.medicineName}</td>
                    <td className="px-6 py-3 text-slate-500">{item.pharmacyName ?? '—'}</td>
                    <td className="px-6 py-3 font-bold text-orange-600">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {item.lowStockThreshold != null ? `≤ ${item.lowStockThreshold} ${item.unit}` : '—'}
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
