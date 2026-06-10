"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Loader2, AlertCircle, RefreshCw, Search, ClipboardList } from 'lucide-react';
import { getBranchOrders } from '@/services/branchService';
import type { DispensingOrderResponse } from '@/types/api';

const STATUS_TABS = ['All', 'PENDING', 'CONFIRMED', 'PROCESSING', 'DISPENSED', 'COMPLETED', 'CANCELLED'] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  DISPENSED:  'bg-teal-100 text-teal-700',
  COMPLETED:  'bg-emerald-100 text-emerald-700',
  CANCELLED:  'bg-rose-100 text-rose-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BranchOrdersPage() {
  const [orders, setOrders] = useState<DispensingOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    setError('');
    getBranchOrders()
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = activeTab === 'All' || o.status === activeTab;
      const q = search.toLowerCase();
      const matchesSearch = !q
        || String(o.id).includes(q)
        || o.patientName.toLowerCase().includes(q)
        || (o.patientEmail ?? '').toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList size={20} className="text-teal-600" />
            Branch Orders
            <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-teal-600/10 text-teal-700 text-xs font-bold">
              {orders.length}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">All dispensing orders assigned to your branch</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, patient name or email..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === tab
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <ClipboardList size={48} className="mb-4 opacity-30" />
          <p className="font-semibold text-slate-500">No orders found</p>
          <p className="text-sm mt-1">
            {search || activeTab !== 'All' ? 'Try adjusting your filters.' : 'No dispensing orders have been assigned to your branch yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Medicines</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pharmacist</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">#{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{order.patientName}</p>
                      {order.patientEmail && (
                        <p className="text-xs text-slate-400">{order.patientEmail}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.medicines && order.medicines.length > 0
                        ? `${order.medicines.length} item${order.medicines.length !== 1 ? 's' : ''}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.pharmacistName ?? <span className="text-slate-300 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                  </tr>
                  {expandedId === order.id && order.medicines && order.medicines.length > 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medicine Items</p>
                        <div className="flex flex-wrap gap-2">
                          {order.medicines.map((m) => (
                            <span key={m.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700 font-medium">
                              {m.medicineName}
                              <span className="text-slate-400">× {m.quantity}</span>
                              {m.inStock === false && (
                                <span className="text-rose-500 font-semibold">Out of stock</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
