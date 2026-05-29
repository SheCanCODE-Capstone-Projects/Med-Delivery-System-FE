"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Pill, Loader2, AlertCircle, RefreshCw, Search, ExternalLink } from 'lucide-react';
import { getAssignedOrders, validatePrescription } from '@/services/pharmacistApi';
import { BASE_URL } from '@/services/apiClient';
import type { DispensingOrderResponse } from '@/types/api';

const VALIDATION_STYLE: Record<string, string> = {
  VALID: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  INVALID: 'bg-rose-50 text-rose-700 border-rose-100',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function PharmacistPrescriptionsPage() {
  const [orders, setOrders] = useState<DispensingOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssignedOrders();
      setOrders(data.filter((o) => o.prescriptionUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prescriptions');
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

  const handleValidate = async (orderId: number, valid: boolean) => {
    setActionLoading(orderId);
    setError('');
    try {
      await validatePrescription(orderId, { valid, notes: valid ? undefined : 'Invalid prescription' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setActionLoading(null);
    }
  };

  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const validated = orders.filter((o) => o.validationStatus === 'VALID').length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-slate-500 mt-1">Orders requiring prescription validation.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total with Rx', value: orders.length, color: 'text-teal-600 bg-teal-50' },
          { label: 'Pending Review', value: pending, color: 'text-amber-600 bg-amber-50' },
          { label: 'Validated', value: validated, color: 'text-emerald-600 bg-emerald-50' },
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
            <span>Loading prescriptions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Pill size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No prescription orders found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Medicines</th>
                <th className="px-6 py-4">Prescription</th>
                <th className="px-6 py-4">Validation</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition text-sm">
                  <td className="px-6 py-4 text-slate-500 text-xs font-semibold">#{order.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{order.patientName}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {order.medicines?.map((m) => m.medicineName).join(', ') ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`${BASE_URL}${order.prescriptionUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-teal-600 text-xs font-semibold hover:text-teal-700"
                    >
                      <ExternalLink size={12} /> View Rx
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      VALIDATION_STYLE[order.validationStatus ?? 'PENDING'] ?? VALIDATION_STYLE.PENDING
                    }`}>
                      {order.validationStatus ?? 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order.status === 'PENDING' && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleValidate(order.id, true)}
                          disabled={actionLoading === order.id}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleValidate(order.id, false)}
                          disabled={actionLoading === order.id}
                          className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        {actionLoading === order.id && <Loader2 size={14} className="animate-spin text-slate-400" />}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {filtered.length} prescription order{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
