"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { PackageSearch, Loader2, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { getPharmacistInventory } from '@/services/pharmacistApi';
import type { MedicineResponse } from '@/types/api';

const STATUS_CONFIG = {
  IN_STOCK:      { label: 'In Stock',      color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  LOW_STOCK:     { label: 'Low Stock',     color: 'bg-amber-50 text-amber-700 border-amber-100' },
  OUT_OF_STOCK:  { label: 'Out of Stock',  color: 'bg-rose-50 text-rose-700 border-rose-100' },
  EXPIRING_SOON: { label: 'Expiring Soon', color: 'bg-orange-50 text-orange-700 border-orange-100' },
} as const;

export default function PharmacistInventoryPage() {
  const [items, setItems] = useState<MedicineResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await getPharmacistInventory());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => items.filter((i) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) &&
        !(i.genericName ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && i.category !== catFilter) return false;
    return true;
  }), [items, search, catFilter]);

  const inStock      = items.filter((i) => i.status === 'IN_STOCK').length;
  const lowStock     = items.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStock   = items.filter((i) => i.status === 'OUT_OF_STOCK').length;
  const expiringSoon = items.filter((i) => i.status === 'EXPIRING_SOON').length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-slate-500 mt-1">Current stock levels for your branch (read-only).</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Medicines', value: items.length,  color: 'text-teal-600' },
          { label: 'In Stock',        value: inStock,        color: 'text-emerald-600' },
          { label: 'Low Stock',       value: lowStock,       color: 'text-amber-600' },
          { label: 'Out of Stock',    value: outOfStock,     color: 'text-rose-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {expiringSoon > 0 && !loading && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-sm font-semibold">
          {expiringSoon} medicine{expiringSoon !== 1 ? 's' : ''} expiring within 30 days.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            placeholder="Search medicines..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
        {categories.length > 0 && (
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading inventory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <PackageSearch size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-4">Medicine</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4">Unit</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Expiry</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.IN_STOCK;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition text-sm">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        {item.genericName && <p className="text-xs text-slate-400">{item.genericName}</p>}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{item.category ?? '—'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{item.totalQuantity}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{item.unit ?? '—'}</td>
                      <td className="px-5 py-4 text-slate-700 font-semibold">
                        {item.sellingPrice != null ? `${Number(item.sellingPrice).toLocaleString()} RWF` : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{item.earliestExpiry ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {filtered.length} of {items.length} medicine{items.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
