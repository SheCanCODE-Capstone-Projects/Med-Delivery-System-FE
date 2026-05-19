"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Loader2, AlertCircle, Search, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  getAssignedOrders,
  validatePrescription,
  confirmStock,
  dispenseMedicine,
  suggestSubstitution,
  getActionLogs,
} from '@/services/pharmacistApi';
import type { DispensingOrderResponse, ActionLogResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-100',
  PROCESSING: 'bg-violet-50 text-violet-700 border-violet-100',
  DISPENSED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  COMPLETED: 'bg-teal-50 text-teal-700 border-teal-100',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
};

const ALL_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'DISPENSED', 'COMPLETED', 'CANCELLED'];

export default function PharmacistOrdersPage() {
  const [orders, setOrders] = useState<DispensingOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<number, ActionLogResponse[]>>({});
  const [subForm, setSubForm] = useState<{ orderId: number; original: string; substitute: string; reason: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await getAssignedOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'ALL') list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.patientName?.toLowerCase().includes(q) || String(o.id).includes(q));
    }
    return list;
  }, [orders, statusFilter, search]);

  const handleAction = async (order: DispensingOrderResponse, action: 'validate' | 'stock' | 'dispense') => {
    setActionLoading(order.id);
    setError('');
    try {
      if (action === 'validate') await validatePrescription(order.id);
      else if (action === 'stock') await confirmStock(order.id);
      else await dispenseMedicine(order.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubstitution = async () => {
    if (!subForm) return;
    setActionLoading(subForm.orderId);
    try {
      await suggestSubstitution(subForm.orderId, {
        originalMedicineName: subForm.original,
        substituteMedicineName: subForm.substitute,
        reason: subForm.reason,
      });
      setSubForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Substitution failed');
    } finally {
      setActionLoading(null);
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-slate-500 mt-1">Dispensing queue — validate, confirm stock, and dispense.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex gap-2 items-center">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search patient or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
          />
        </div>
        <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${statusFilter === s ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Substitution modal */}
      {subForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Suggest Substitution</h2>
              <button onClick={() => setSubForm(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Original Medicine</label>
              <input value={subForm.original} onChange={(e) => setSubForm((f) => f && { ...f, original: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Substitute Medicine</label>
              <input value={subForm.substitute} onChange={(e) => setSubForm((f) => f && { ...f, substitute: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Reason</label>
              <textarea rows={2} value={subForm.reason} onChange={(e) => setSubForm((f) => f && { ...f, reason: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSubForm(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleSubstitution} disabled={actionLoading !== null}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading !== null && <Loader2 size={14} className="animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No orders found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((order) => (
              <div key={order.id}>
                <div className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">{order.patientName}</span>
                      <span className="text-xs text-slate-400">#{order.id}</span>
                      {order.prescriptionUrl && (
                        <a href={order.prescriptionUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded hover:bg-violet-100">
                          View Rx
                        </a>
                      )}
                    </div>
                    {order.medicines && order.medicines.length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">{order.medicines.map((m) => `${m.medicineName} ×${m.quantity}`).join(' · ')}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {order.status}
                    </span>

                    {order.status === 'PENDING' && (
                      <button onClick={() => handleAction(order, 'validate')} disabled={actionLoading === order.id}
                        className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-1">
                        {actionLoading === order.id ? <Loader2 size={11} className="animate-spin" /> : null}
                        Validate Rx
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && !order.stockConfirmed && (
                      <>
                        <button onClick={() => handleAction(order, 'stock')} disabled={actionLoading === order.id}
                          className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1">
                          {actionLoading === order.id ? <Loader2 size={11} className="animate-spin" /> : null}
                          Confirm Stock
                        </button>
                        <button onClick={() => setSubForm({ orderId: order.id, original: '', substitute: '', reason: '' })}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg hover:bg-amber-100">
                          Substitute
                        </button>
                      </>
                    )}
                    {order.stockConfirmed && order.status !== 'DISPENSED' && order.status !== 'COMPLETED' && (
                      <button onClick={() => handleAction(order, 'dispense')} disabled={actionLoading === order.id}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1">
                        {actionLoading === order.id ? <Loader2 size={11} className="animate-spin" /> : null}
                        Dispense
                      </button>
                    )}

                    <button onClick={() => toggleExpand(order.id)} className="p-1.5 text-slate-400 hover:text-slate-600 transition">
                      {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="px-6 pb-4 bg-slate-50/50 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-2">Action Log</p>
                    {(logs[order.id] ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400">No logs yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {logs[order.id].map((log) => (
                          <div key={log.id} className="flex items-start gap-3 text-xs">
                            <span className="text-slate-400 shrink-0">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</span>
                            <span className="font-semibold text-slate-700">{log.action}</span>
                            <span className="text-slate-500">{log.performedBy}</span>
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
          Showing {filtered.length} of {orders.length} orders
        </div>
      </div>
    </div>
  );
}
