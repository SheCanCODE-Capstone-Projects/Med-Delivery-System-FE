"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { History, Loader2, AlertCircle, Search, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getAssignedOrders, getActionLogs } from '@/services/pharmacistApi';
import type { DispensingOrderResponse, ActionLogResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  DISPENSED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  COMPLETED: 'bg-teal-50 text-teal-700 border-teal-100',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function PharmacistHistoryPage() {
  const [orders, setOrders] = useState<DispensingOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<number, ActionLogResponse[]>>({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssignedOrders();
      setOrders(data.filter((o) => ['DISPENSED', 'COMPLETED', 'CANCELLED'].includes(o.status)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) => o.patientName?.toLowerCase().includes(q) || String(o.id).includes(q));
  }, [orders, search]);

  const toggleExpand = async (orderId: number) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (!logs[orderId]) {
      try {
        const data = await getActionLogs(orderId);
        setLogs((prev) => ({ ...prev, [orderId]: data }));
      } catch { /* ignore */ }
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaction History</h1>
          <p className="text-slate-500 mt-1">Completed and cancelled orders with action logs.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Search patient or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading history...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <History size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No completed orders yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((order) => (
              <div key={order.id}>
                <div
                  className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition cursor-pointer"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-slate-800 text-sm">{order.patientName}</span>
                      <span className="text-xs text-slate-400">#{order.id}</span>
                    </div>
                    {order.medicines && order.medicines.length > 0 && (
                      <p className="text-xs text-slate-500">{order.medicines.map((m) => m.medicineName).join(', ')}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {order.status}
                    </span>
                    {expandedId === order.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="px-6 pb-4 bg-slate-50/50 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-2">Action Log</p>
                    {(logs[order.id] ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400">No action logs for this order.</p>
                    ) : (
                      <div className="space-y-2">
                        {logs[order.id].map((log) => (
                          <div key={log.id} className="flex items-start gap-3 text-xs">
                            <span className="text-slate-400 shrink-0 min-w-[140px]">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                            </span>
                            <span className="font-semibold text-slate-700">{log.action}</span>
                            <span className="text-slate-500">by {log.performedBy}</span>
                            {log.notes && <span className="text-slate-400 italic">"{log.notes}"</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {filtered.length} of {orders.length} historical orders
        </div>
      </div>
    </div>
  );
}
