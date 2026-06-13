"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Users, Clock, CheckCircle2, XCircle, Eye, Loader2, AlertCircle, ShieldCheck,
} from 'lucide-react';
import {
  getAllPharmaciesAdmin, approvePharmacy, getAuditLogs, searchUsers,
} from '@/services/adminApi';
import type { PharmacyResponse, AuditLogResponse } from '@/types/api';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getLastSixMonths(): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return MONTHS[d.getMonth()];
  });
}

function buildGrowthFromPharmacies(pharmacies: PharmacyResponse[]): number[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const cutoff = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    return pharmacies.filter(p => new Date(p.createdAt) < cutoff).length;
  });
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  return `${Math.floor(hr / 24)} day ago`;
}

const ACTIVITY_DOT: Record<string, string> = {
  APPROVE: 'bg-emerald-500',
  CREATE: 'bg-sky-500',
  REJECT: 'bg-rose-500',
  UPDATE: 'bg-amber-400',
  LOGIN: 'bg-slate-400',
  SUSPEND: 'bg-orange-500',
  DELETE: 'bg-rose-600',
};

function activityDot(action: string): string {
  const key = Object.keys(ACTIVITY_DOT).find((k) => action?.toUpperCase().includes(k));
  return key ? ACTIVITY_DOT[key] : 'bg-slate-400';
}

// ─── Line Chart ────────────────────────────────────────────────────────────────

function LineChart({ labels, values }: { labels: string[]; values: number[] }) {
  const W = 900, H = 280;
  const pad = { top: 24, right: 32, bottom: 40, left: 56 };
  const w = W - pad.left - pad.right;
  const h = H - pad.top - pad.bottom;
  const max = Math.max(...values, 1);
  const n = values.length;

  const px = (i: number) => pad.left + (i / (n - 1)) * w;
  const py = (v: number) => pad.top + h - (v / max) * h;

  const linePath = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(v)}`).join(' ');
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((max / 4) * i));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={pad.left} y1={py(t)} x2={W - pad.right} y2={py(t)}
            stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
          <text x={pad.left - 8} y={py(t) + 4} textAnchor="end" fill="#94a3b8" fontSize={11}>
            {t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}
          </text>
        </g>
      ))}
      <path d={linePath} fill="none" stroke="#14b8a6" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={px(i)} cy={py(v)} r={5}
          fill="#14b8a6" stroke="white" strokeWidth={2} />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fill="#94a3b8" fontSize={11}>
          {l}
        </text>
      ))}
    </svg>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subColor, icon: Icon, iconBg, iconColor }: {
  label: string; value: string | number; sub?: string; subColor?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-slate-200 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {sub && <p className={`text-xs font-semibold mt-1 ${subColor ?? 'text-teal-600'}`}>{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [allPharmacies, setAllPharmacies] = useState<PharmacyResponse[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [recentActivity, setRecentActivity] = useState<AuditLogResponse[]>([]);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  const months = getLastSixMonths();

  const pendingPharmacies = allPharmacies.filter((p) => p.status === 'PENDING_APPROVAL');
  const activePharmacies = allPharmacies.filter((p) => p.status === 'ACTIVE');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pharmacies, logs, usersRes] = await Promise.all([
        getAllPharmaciesAdmin().catch(() => [] as PharmacyResponse[]),
        getAuditLogs().catch(() => [] as AuditLogResponse[]),
        searchUsers({ page: 0, size: 1 }).catch(() => ({ totalElements: 0, content: [] })),
      ]);

      setAllPharmacies(Array.isArray(pharmacies) ? pharmacies : []);
      setActiveUsers(usersRes?.totalElements ?? 0);
      setRecentActivity(Array.isArray(logs) ? logs.slice(0, 4) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    setActionError('');
    try {
      await approvePharmacy(id, { action: 'APPROVE' });
      setAllPharmacies((prev) => prev.map((p) => p.id === id ? { ...p, status: 'ACTIVE' } : p));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to approve');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Reject this pharmacy registration?')) return;
    setRejectingId(id);
    setActionError('');
    try {
      await approvePharmacy(id, { action: 'REJECT' });
      setAllPharmacies((prev) => prev.map((p) => p.id === id ? { ...p, status: 'REJECTED' } : p));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to reject');
    } finally {
      setRejectingId(null);
    }
  };

  const growthValues = buildGrowthFromPharmacies(allPharmacies);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading dashboard…</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B2F2B] to-[#0E9384] px-6 py-7 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative">
          <p className="text-teal-200 text-xs font-bold tracking-widest uppercase mb-1">Super Admin</p>
          <h1 className="text-2xl font-bold text-white leading-tight">System Overview</h1>
          <p className="text-teal-100 text-sm mt-0.5">MedDelivery platform-wide management panel</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Pharmacies" value={allPharmacies.length}
          sub={`${activePharmacies.length} active`}
          icon={Building2} iconBg="bg-teal-50" iconColor="text-teal-600" />
        <StatCard label="Active Users" value={activeUsers.toLocaleString()}
          sub="Registered on platform" icon={Users} iconBg="bg-violet-50" iconColor="text-violet-600" />
        <StatCard label="Pending Approvals" value={pendingPharmacies.length}
          sub={pendingPharmacies.length > 0 ? 'Needs review' : 'All clear'}
          subColor={pendingPharmacies.length > 0 ? 'text-amber-600' : 'text-emerald-600'}
          icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard label="Active Pharmacies" value={activePharmacies.length}
          sub="Approved & operating"
          icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      {/* Platform Growth Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-5">Pharmacy Registrations (Last 6 Months)</h2>
        <div className="h-56 overflow-hidden">
          <LineChart labels={months} values={growthValues} />
        </div>
      </div>

      {/* Pending Approvals + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

        {/* Pending Pharmacy Approvals */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Pending Pharmacy Approvals</h2>

          {actionError && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={13} /> {actionError}
            </div>
          )}

          {pendingPharmacies.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPharmacies.map((ph) => (
                <div key={ph.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{ph.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {ph.address && `${ph.address} · `}{ph.managerEmail ?? ph.contactInfo ?? '—'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Code: <span className="font-mono font-bold text-slate-600">{ph.pharmacyCode ?? '—'}</span>
                      {ph.licenseNumber && <> · License: {ph.licenseNumber}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => router.push('/super-admin/pharmacies')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      <Eye size={13} /> Review
                    </button>
                    <button
                      onClick={() => handleApprove(ph.id)}
                      disabled={approvingId === ph.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition"
                    >
                      {approvingId === ph.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <CheckCircle2 size={13} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(ph.id)}
                      disabled={rejectingId === ph.id}
                      className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 disabled:opacity-50 transition"
                    >
                      {rejectingId === ph.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <XCircle size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">No recent activity.</div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activityDot(log.action)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">
                      {log.details ?? `${log.action}${log.targetType ? ` · ${log.targetType}` : ''}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
