"use client";
import { useState, useEffect, useCallback } from 'react';
import { Package, Loader2, Search, AlertCircle, XCircle, RefreshCw, RefreshCcw, ShieldAlert } from 'lucide-react';
import { getGlobalOrders, forceCancelOrder, reassignOrder, overrideSubstitution } from '@/services/adminApi';
import type { AdminOrderResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-100',
  PROCESSING: 'bg-violet-50 text-violet-700 border-violet-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CANCELLED: 'bg-rose-50 text-rose-600 border-rose-100',
  DELIVERED: 'bg-teal-50 text-teal-700 border-teal-100',
};

const ALL_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'DELIVERED'];

export default function SuperAdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getGlobalOrders(page, 20, statusFilter === 'ALL' ? undefined : statusFilter);
      setOrders(res.content);
      setTotal(res.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.patientName?.toLowerCase().includes(search.toLowerCase()) ||
          o.pharmacyName?.toLowerCase().includes(search.toLowerCase()) ||
          String(o.id).includes(search)
      )
    : orders;

  const handleCancel = async (orderId: number) => {
    if (!window.confirm('Force cancel this order?')) return;
    setActionLoading(orderId);
    setActionMsg('');
    try {
      await forceCancelOrder(orderId, { reason: 'Admin intervention' });
      setActionMsg(`Order #${orderId} cancelled.`);
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Cancel failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const [subOverrideId, setSubOverrideId] = useState('');
  const [subOverrideReason, setSubOverrideReason] = useState('');
  const [subOverrideLoading, setSubOverrideLoading] = useState(false);
  const [subOverrideMsg, setSubOverrideMsg] = useState('');

  const handleSubOverride = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const id = Number(subOverrideId.trim());
    if (!id || !subOverrideReason.trim()) return;
    setSubOverrideLoading(true);
    setSubOverrideMsg('');
    try {
      await overrideSubstitution(id, { reason: subOverrideReason.trim() });
      setSubOverrideMsg(`Substitution #${id} overridden successfully.`);
      setSubOverrideId('');
      setSubOverrideReason('');
    } catch (err) {
      setSubOverrideMsg(err instanceof Error ? err.message : 'Override failed.');
    } finally {
      setSubOverrideLoading(false);
    }
  };

  const handleReassign = async (orderId: number) => {
    const pharmacyId = window.prompt('Enter the Pharmacy ID to reassign this order to:');
    if (!pharmacyId || isNaN(Number(pharmacyId))) return;
    setActionLoading(orderId);
    setActionMsg('');
    try {
      await reassignOrder(orderId, { reason: 'Admin reassignment', newPharmacyId: Number(pharmacyId) });
      setActionMsg(`Order #${orderId} reassigned to pharmacy #${pharmacyId}.`);
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Reassign failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Global Orders</h1>
          <p className="text-slate-500 mt-1">Platform-wide order management and intervention.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-teal-600">{total.toLocaleString()}</p>
        </div>
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">{actionMsg}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search patient, pharmacy, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${statusFilter === s ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50 transition">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold flex gap-2"><AlertCircle size={16} />{error}</div>}

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={24} />
              <span>Loading orders...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Pharmacy</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition text-sm">
                    <td className="px-6 py-4 font-bold text-slate-500 text-xs">#{order.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{order.patientName}</td>
                    <td className="px-6 py-4 text-slate-500">{order.pharmacyName ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {order.totalAmount != null ? `RWF ${order.totalAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[order.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleReassign(order.id)}
                            disabled={actionLoading === order.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-sky-50 text-sky-600 border border-sky-100 rounded-lg hover:bg-sky-100 transition disabled:opacity-50"
                          >
                            {actionLoading === order.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                            Reassign
                          </button>
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={actionLoading === order.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
                          >
                            {actionLoading === order.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      <Package size={32} className="mx-auto mb-2 opacity-40" />
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/30">
          <span>Showing {filteredOrders.length} of {total} orders</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50 bg-white hover:bg-slate-50">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={orders.length < 20} className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50 bg-white hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="text-violet-600" size={18} />
          <h2 className="text-base font-bold text-slate-800">Substitution Override</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Override a pharmacist's substitution decision by substitution ID.
        </p>
        <form onSubmit={handleSubOverride} className="flex flex-col gap-3 max-w-lg">
          <input
            type="number"
            min={1}
            value={subOverrideId}
            onChange={(e) => setSubOverrideId(e.target.value)}
            placeholder="Substitution ID"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="text"
            value={subOverrideReason}
            onChange={(e) => setSubOverrideReason(e.target.value)}
            placeholder="Override reason (required)"
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {subOverrideMsg && (
            <p className={`text-sm font-semibold ${subOverrideMsg.includes('success') ? 'text-emerald-600' : 'text-rose-600'}`}>
              {subOverrideMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={subOverrideLoading || !subOverrideId.trim() || !subOverrideReason.trim()}
            className="self-start flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {subOverrideLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
            Override Substitution
          </button>
        </form>
      </div>
    </>
  );
}
