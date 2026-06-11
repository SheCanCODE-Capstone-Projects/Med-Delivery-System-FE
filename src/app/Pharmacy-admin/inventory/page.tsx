"use client";
import React, { useEffect, useState } from 'react';
import { Package2, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { getAllBranchesInventory, type PharmacyInventoryRow } from '@/services/branchService';

const STATUS_STYLE: Record<string, string> = {
  IN_STOCK:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  LOW_STOCK:   'bg-amber-50 text-amber-700 border-amber-100',
  OUT_OF_STOCK:'bg-rose-50 text-rose-600 border-rose-100',
};

export default function PharmacyAdminInventoryPage() {
  const [items, setItems] = useState<PharmacyInventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');

  useEffect(() => {
    getAllBranchesInventory()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load inventory'))
      .finally(() => setLoading(false));
  }, []);

  const branches = ['ALL', ...Array.from(new Set(items.map((i) => i.branchName)))];

  const filtered = items.filter((item) => {
    const matchSearch = item.medicineName.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'ALL' || item.branchName === branchFilter;
    return matchSearch && matchBranch;
  });

  const totalItems = filtered.length;
  const lowStock = filtered.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStock = filtered.filter((i) => i.status === 'OUT_OF_STOCK').length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inventory — All Branches</h1>
        <p className="text-slate-500 mt-1">Stock levels across every branch in your pharmacy.</p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Items', value: totalItems, color: 'bg-teal-600' },
          { label: 'Low Stock', value: lowStock, color: 'bg-amber-500' },
          { label: 'Out of Stock', value: outOfStock, color: 'bg-rose-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} shrink-0`}>
              <Package2 size={17} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search medicine…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={13} />
            </button>
          )}
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
        >
          {branches.map((b) => <option key={b} value={b}>{b === 'ALL' ? 'All Branches' : b}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} /><span>Loading inventory…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Package2 size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">No inventory found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Medicine</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Price (RWF)</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3 font-semibold text-slate-800">{item.medicineName}</td>
                    <td className="px-6 py-3 text-slate-500">{item.branchName}</td>
                    <td className="px-6 py-3 font-mono text-slate-700">{item.quantity}</td>
                    <td className="px-6 py-3 text-slate-500">{item.unit || '—'}</td>
                    <td className="px-6 py-3 font-mono text-slate-700">
                      {Number(item.price).toLocaleString('en-RW')}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[item.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {branchFilter !== 'ALL' && ` in ${branchFilter}`}
        </div>
      </div>
    </>
  );
}
