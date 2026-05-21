"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Loader2, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { getAuditLogs } from '@/services/adminApi';
import type { AuditLogResponse } from '@/types/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [filtered, setFiltered] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAuditLogs();
      setLogs(data);
      setFiltered(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(logs); return; }
    const q = search.toLowerCase();
    setFiltered(logs.filter((l) =>
      l.action?.toLowerCase().includes(q) ||
      l.performedBy?.toLowerCase().includes(q) ||
      l.targetType?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    ));
  }, [search, logs]);

  const ACTION_COLOR: Record<string, string> = {
    CREATE: 'bg-emerald-50 text-emerald-700',
    UPDATE: 'bg-sky-50 text-sky-700',
    DELETE: 'bg-rose-50 text-rose-700',
    APPROVE: 'bg-teal-50 text-teal-700',
    REJECT: 'bg-amber-50 text-amber-700',
    SUSPEND: 'bg-orange-50 text-orange-700',
    LOGIN: 'bg-violet-50 text-violet-700',
  };

  const getActionColor = (action: string) => {
    const key = Object.keys(ACTION_COLOR).find((k) => action?.toUpperCase().includes(k));
    return key ? ACTION_COLOR[key] : 'bg-slate-100 text-slate-600';
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-slate-500 mt-1">Track all administrative actions and system events.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold flex gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading audit logs...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <Shield size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No audit logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition">
                <div className={`mt-0.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${getActionColor(log.action)}`}>
                  {log.action}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {log.details ?? `${log.action} on ${log.targetType ?? 'resource'} #${log.targetId ?? '—'}`}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    By <span className="font-semibold text-slate-500">{log.performedBy}</span>
                    {log.targetType && <> · {log.targetType}</>}
                    {log.targetId && <> #{log.targetId}</>}
                  </p>
                </div>
                <time className="text-xs text-slate-400 shrink-0">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                </time>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          Showing {filtered.length} of {logs.length} log entries
        </div>
      </div>
    </>
  );
}
