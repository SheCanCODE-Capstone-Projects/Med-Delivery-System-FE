"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { PackageSearch, Loader2, AlertCircle, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { getInventory } from '@/services/pharmacyApi';
import { getPharmacyId } from '@/services/authApi';
import type { PharmacyInventoryResponse } from '@/types/api';

export default function PharmacistInventoryPage() {
  const [items, setItems] = useState<PharmacyInventoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const pharmacyId = getPharmacyId();

  const load = async () => {
    if (!pharmacyId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setItems(await getInventory(pharmacyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.medicineName?.toLowerCase().includes(q));
  }, [items, search]);

  const isLow = (i: PharmacyInventoryResponse) =>
    i.lowStockThreshold != null && i.quantity <= i.lowStockThreshold;

  const inStock = items.filter((i) => i.quantity > 0);
  const lowStock = items.filter(isLow);
  const outOfStock = items.filter((i) => i.quantity === 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-slate-500 mt-1">Current stock levels for your pharmacy.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Items', value: items.length, color: 'text-teal-600' },
          { label: 'In Stock', value: inStock.length, color: 'text-emerald-600' },
          { label: 'Low Stock', value: lowStock.length, color: 'text-amber-600' },
          { label: 'Out of Stock', value: outOfStock.length, color: 'text-rose-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
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
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
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
                  <th className="px-6 py-4">Medicine</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const low = isLow(item);
                  const out = item.quantity === 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition text-sm">
                      <td className="px-6 py-4 font-semibold text-slate-800">{item.medicineName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${out ? 'text-rose-600' : low ? 'text-amber-600' : 'text-slate-800'}`}>
                            {item.quantity}
                          </span>
                          {low && !out && <AlertTriangle size={13} className="text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{item.unit}</td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">RWF {item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          out ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          low ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {out ? 'Out of Stock' : low ? 'Low Stock' : 'In Stock'}
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
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
