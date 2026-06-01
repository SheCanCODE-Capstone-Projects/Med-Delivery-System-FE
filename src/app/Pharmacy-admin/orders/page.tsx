"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ClipboardList, Loader2, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { getMyPharmacyOrders } from '@/services/pharmacyApi';
import { getPharmacyId } from '@/services/authApi';
import type { OrderResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  PENDING:    'bg-amber-50 text-amber-700 border-amber-100',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-100',
  READY:      'bg-teal-50 text-teal-700 border-teal-100',
  DELIVERED:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  CANCELLED:  'bg-rose-50 text-rose-700 border-rose-100',
};

const PAYMENT_STYLE: Record<string, string> = {
  PAID:    'text-emerald-600',
  UNPAID:  'text-rose-500',
  PENDING: 'text-amber-600',
};

export default function OrderOversightPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const pharmacyId = getPharmacyId();

  const load = useCallback(async () => {
    if (!pharmacyId) {
      setError('Pharmacy ID not found. Please log out and log in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getMyPharmacyOrders(pharmacyId);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) =>
      o.patientName?.toLowerCase().includes(q) ||
      String(o.id).includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const processing = orders.filter((o) => o.status === 'PROCESSING').length;
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order Oversight</h1>
          <p className="text-slate-500 mt-1">All orders assigned to your pharmacy.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: orders.length, color: 'text-teal-600 bg-teal-50' },
          { label: 'Pending', value: pending, color: 'text-amber-600 bg-amber-50' },
          { label: 'Processing', value: processing, color: 'text-blue-600 bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{loading ? '—' : s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
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
          placeholder="Search patient, order ID or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <ClipboardList size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No orders found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Medicines</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition text-sm">
                  <td className="px-6 py-4 text-slate-500 text-xs font-semibold">#{order.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{order.patientName}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs max-w-[200px]">
                    {order.items?.map((i) => i.medicineName).join(', ') ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-semibold text-xs">
                    {order.totalAmount != null
                      ? `$${order.totalAmount.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    <span className={PAYMENT_STYLE[order.paymentStatus ?? 'UNPAID'] ?? 'text-slate-400'}>
                      {order.paymentStatus ?? 'UNPAID'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      STATUS_STYLE[order.status] ?? 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          {delivered > 0 && ` · ${delivered} delivered`}
        </div>
      </div>
    </div>
  );
}
