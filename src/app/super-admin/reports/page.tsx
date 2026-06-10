"use client";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2, Users, Shield, Loader2, AlertCircle, RefreshCw, Printer, UserCheck,
} from 'lucide-react';
import {
  getDashboardStats, getAllPharmaciesAdmin, getAuditLogs, searchUsers,
} from '@/services/adminApi';
import type { PharmacyResponse, AuditLogResponse, DashboardStatsResponse } from '@/types/api';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString();
}

function fmtDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  PENDING_APPROVAL: 'Pending',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
};

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-sky-50 text-sky-700',
  DELETE: 'bg-rose-50 text-rose-700',
  APPROVE: 'bg-teal-50 text-teal-700',
  REJECT: 'bg-amber-50 text-amber-700',
  SUSPEND: 'bg-orange-50 text-orange-700',
  LOGIN: 'bg-violet-50 text-violet-700',
};

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLOR).find((k) => action?.toUpperCase().includes(k));
  return key ? ACTION_COLOR[key] : 'bg-slate-100 text-slate-600';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [allPharmacies, setAllPharmacies] = useState<PharmacyResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [reportDate] = useState(() => new Date().toLocaleString());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, ph, logs, usersRes] = await Promise.all([
        getDashboardStats().catch(() => null),
        getAllPharmaciesAdmin().catch(() => [] as PharmacyResponse[]),
        getAuditLogs().catch(() => [] as AuditLogResponse[]),
        searchUsers({ page: 0, size: 1 }).catch(() => ({ totalElements: 0, content: [] })),
      ]);
      setStats(s);
      setAllPharmacies(Array.isArray(ph) ? ph : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setTotalUsers(usersRes?.totalElements ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading report…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-600">
        <AlertCircle size={36} />
        <p className="font-semibold">{error}</p>
        <button onClick={load} className="text-sm text-teal-600 underline">Retry</button>
      </div>
    );
  }

  const activePharmacies = allPharmacies.filter((p) => p.status === 'ACTIVE');
  const pendingPharmacies = allPharmacies.filter((p) => p.status === 'PENDING_APPROVAL');
  const suspendedPharmacies = allPharmacies.filter((p) => p.status === 'SUSPENDED');

  return (
    <>
      {/* Print CSS — hides the app shell and formats as a document */}
      <style>{`
        @media print {
          aside, header, nav, .no-print { display: none !important; }
          body { background: white !important; font-size: 12px; }
          .report-content { padding: 0 !important; }
          .print-card { border: 1px solid #e2e8f0 !important; break-inside: avoid; }
          .print-section { break-inside: avoid; }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-table th, .print-table td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; font-size: 11px; }
          .print-table th { background: #f8fafc; font-weight: 700; }
          h2.print-section-title { font-size: 14px; font-weight: 700; border-bottom: 2px solid #14b8a6; padding-bottom: 4px; margin-bottom: 12px; }
          .print-page-break { page-break-before: always; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="report-content space-y-8">

        {/* Page header — screen */}
        <div className="no-print flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">System Reports</h1>
            <p className="text-slate-500 mt-0.5">Comprehensive platform summary</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="no-print flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition"
            >
              <Printer size={15} /> Print Report
            </button>
          </div>
        </div>

        {/* Document title — visible in print */}
        <div className="print-section">
          <div className="border-b-2 border-teal-600 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 no-print hidden">MedDelivery — Platform Report</h1>
            {/* Print-only title */}
            <div className="hidden print-only" style={{ display: 'none' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>MedDelivery System — Comprehensive Platform Report</h1>
              <p style={{ fontSize: '11px', color: '#64748b' }}>Generated: {reportDate} &nbsp;·&nbsp; Super Admin</p>
            </div>
          </div>
        </div>

        {/* ── Section 1: Platform Summary ── */}
        <section className="print-section">
          <h2 className="print-section-title text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            1. Platform Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Pharmacies', value: fmt(allPharmacies.length),
                sub: `${activePharmacies.length} active · ${pendingPharmacies.length} pending`,
                icon: Building2, iconBg: 'bg-teal-50', iconColor: 'text-teal-600',
              },
              {
                label: 'Total Users', value: fmt(totalUsers),
                sub: `${fmt(stats?.totalPatients ?? 0)} patients`,
                icon: Users, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
              },
              {
                label: 'Active Pharmacies', value: fmt(activePharmacies.length),
                sub: 'Approved & operating',
                icon: Shield, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
              },
              {
                label: 'Active Pharmacists', value: fmt(stats?.activePharmacists ?? 0),
                sub: 'Staff across all pharmacies',
                icon: UserCheck, iconBg: 'bg-sky-50', iconColor: 'text-sky-600',
              },
            ].map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
              <div key={label} className="print-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex justify-between items-start mb-3 no-print">
                  <span className="text-xs font-medium text-slate-500">{label}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon size={16} className={iconColor} />
                  </div>
                </div>
                {/* Print version */}
                <p className="text-xs font-medium text-slate-500 hidden">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Pharmacy Registry ── */}
        <section className="print-section">
          <h2 className="print-section-title text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            2. Pharmacy Registry
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {allPharmacies.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No pharmacies found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="print-table w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Pharmacy Name</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Code</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">License</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Contact</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allPharmacies.map((ph) => (
                      <tr key={ph.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800 text-sm">{ph.name}</p>
                          {ph.address && <p className="text-xs text-slate-400">{ph.address}</p>}
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {ph.pharmacyCode ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600">{ph.licenseNumber ?? '—'}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{ph.managerEmail ?? ph.contactInfo ?? '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            ph.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                            ph.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700' :
                            ph.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {STATUS_LABEL[ph.status ?? ''] ?? ph.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex flex-wrap gap-6 text-xs text-slate-500">
              <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />{activePharmacies.length} Active</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />{pendingPharmacies.length} Pending</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1" />{suspendedPharmacies.length} Suspended</span>
            </div>
          </div>
        </section>

        {/* ── Section 3: Platform Statistics ── */}
        <section className="print-section">
          <h2 className="print-section-title text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            3. Platform User Statistics
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="print-table w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-700">Total Registered Users</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{fmt(totalUsers)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-700">Patients</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{fmt(stats?.totalPatients ?? 0)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-700">Active Pharmacists</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{fmt(stats?.activePharmacists ?? 0)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-700">Pending Pharmacy Approvals</td>
                  <td className="px-5 py-3 font-bold text-amber-600">{fmt(pendingPharmacies.length)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 4: Recent Administrative Activity ── */}
        <section className="print-section print-page-break">
          <h2 className="print-section-title text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
            4. Recent Administrative Activity
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No audit logs.</div>
            ) : (
              <table className="print-table w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Action</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Details</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Performed By</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {auditLogs.slice(0, 20).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-700">
                        {log.details ?? `${log.action} on ${log.targetType ?? 'resource'}${log.targetId ? ` #${log.targetId}` : ''}`}
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-slate-600">{log.performedBy}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">{fmtDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>
    </>
  );
}
