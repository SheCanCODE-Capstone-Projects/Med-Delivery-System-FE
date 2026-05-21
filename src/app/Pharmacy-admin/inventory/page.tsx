"use client";
import React, { useEffect, useState } from 'react';
import { Package2, Plus, Trash2, Loader2, AlertCircle, X, AlertTriangle } from 'lucide-react';
import { getInventory, addInventoryItem, deleteInventoryItem } from '@/services/pharmacyApi';
import { getPharmacyId } from '@/services/authApi';
import type { PharmacyInventoryResponse } from '@/types/api';

const EMPTY_FORM = {
  medicineName: '',
  quantity: '',
  unit: '',
  price: '',
  expiryDate: '',
  lowStockThreshold: '',
};

export default function InventoryPage() {
  const [items, setItems] = useState<PharmacyInventoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const pharmacyId = getPharmacyId();

  const load = async () => {
    if (!pharmacyId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getInventory(pharmacyId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pharmacyId) return;
    setSubmitting(true);
    setActionMsg('');
    try {
      await addInventoryItem(pharmacyId, {
        medicineName: form.medicineName,
        quantity: Number(form.quantity),
        unit: form.unit,
        price: Number(form.price),
        expiryDate: form.expiryDate || undefined,
        lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : undefined,
      });
      setActionMsg('Inventory item added.');
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: number, name: string) => {
    if (!pharmacyId || !window.confirm(`Remove "${name}" from inventory?`)) return;
    setDeleting(itemId);
    setActionMsg('');
    try {
      await deleteInventoryItem(pharmacyId, itemId);
      setActionMsg('Item removed from inventory.');
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  const isLowStock = (item: PharmacyInventoryResponse) =>
    item.lowStockThreshold != null && item.quantity <= item.lowStockThreshold;

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-slate-500 mt-1">Manage medicines and stock levels.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">
          {actionMsg}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Inventory Item</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Medicine Name</label>
                  <input
                    required
                    value={form.medicineName}
                    onChange={(e) => setForm((f) => ({ ...f, medicineName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Amoxicillin 500mg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Quantity</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Unit</label>
                  <input
                    required
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="tablets"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Price (RWF)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    min={0}
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="10"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Expiry Date (optional)</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold flex gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading inventory...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Package2 size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Inventory is empty. Add your first item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Medicine</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition text-sm">
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.medicineName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isLowStock(item) ? 'text-amber-600' : 'text-slate-800'}`}>
                          {item.quantity}
                        </span>
                        {isLowStock(item) && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                            <AlertTriangle size={10} /> Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{item.unit}</td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      RWF {item.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id, item.medicineName)}
                        disabled={deleting === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition disabled:opacity-50 mx-auto"
                      >
                        {deleting === item.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {items.length} item{items.length !== 1 ? 's' : ''} in inventory
          {items.some(isLowStock) && (
            <span className="ml-3 text-amber-600 font-semibold">
              · {items.filter(isLowStock).length} low stock alert{items.filter(isLowStock).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
