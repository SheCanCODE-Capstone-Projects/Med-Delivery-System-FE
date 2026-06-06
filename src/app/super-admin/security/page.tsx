"use client";
import React, { useEffect, useState } from 'react';
import { ShieldAlert, Loader2, AlertTriangle, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import {
  getLoginHistory, getSuspiciousActivity, getSecurityStats, forceLogout,
  type LoginEvent, type SuspiciousActivity, type SecurityStats,
} from '@/services/securityService';

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function SecurityPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [suspicious, setSuspicious] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [forcingOut, setForcingOut] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const load = async (p = 0) => {
    try {
      const [s, h, susp] = await Promise.all([
        getSecurityStats(),
        getLoginHistory(p, 20),
        getSuspiciousActivity(),
      ]);
      setStats(s);
      setEvents(h.content);
      setTotalEvents(h.totalElements);
      setSuspicious(susp);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load security data');
    }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleForceLogout = async (userId: number) => {
    if (!window.confirm(`Force logout user ID ${userId}?`)) return;
    setForcingOut(userId);
    try {
      await forceLogout(userId);
      setMsg(`User ${userId} has been logged out.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to force logout');
    } finally { setForcingOut(null); }
  };

  const changePage = (p: number) => {
    setPage(p);
    load(p);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading security data...</span>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">{error}</div>
  );

  const totalPages = Math.ceil(totalEvents / 20);

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <ShieldAlert size={22} className="text-rose-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Security Monitoring</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Login activity, suspicious IPs, and session management.</p>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">{msg}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Logins (24h)" value={stats?.totalLogins24h ?? 0} color="text-slate-800" />
        <StatCard label="Successful" value={stats?.successfulLogins24h ?? 0} color="text-emerald-600" />
        <StatCard label="Failed Attempts" value={stats?.failedAttempts24h ?? 0} color="text-rose-600" />
        <StatCard label="Success Rate" value={`${stats?.successRate ?? 0}%`} color="text-blue-600" />
      </div>

      {suspicious.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Suspicious Activity ({suspicious.length} IP{suspicious.length !== 1 ? 's' : ''})
          </h2>
          <div className="space-y-2">
            {suspicious.map((s) => (
              <div key={s.ipAddress} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                <span className="text-sm font-mono text-slate-700">{s.ipAddress}</span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                  {s.failedAttempts} failed attempts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Login History</h2>
          <span className="text-xs text-slate-400">{totalEvents} total events</span>
        </div>
        {events.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldAlert size={32} className="mx-auto mb-3 opacity-30" />
            <p>No login events recorded yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/60 transition text-sm">
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-700">{ev.email ?? '—'}</p>
                        {ev.userId && <p className="text-xs text-slate-400">ID: {ev.userId}</p>}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{ev.ipAddress ?? '—'}</td>
                      <td className="px-6 py-3">
                        {ev.success ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 size={12} /> Success
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-600 text-xs font-bold">
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-400">{ev.failureReason ?? '—'}</td>
                      <td className="px-6 py-3 text-xs text-slate-400">
                        {new Date(ev.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {ev.userId && ev.success && (
                          <button
                            onClick={() => handleForceLogout(ev.userId!)}
                            disabled={forcingOut === ev.userId}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition disabled:opacity-50 mx-auto"
                          >
                            {forcingOut === ev.userId ? <Loader2 size={10} className="animate-spin" /> : <LogOut size={10} />}
                            Logout
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <button disabled={page === 0} onClick={() => changePage(page - 1)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                  Previous
                </button>
                <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => changePage(page + 1)}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
