"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, Plus, X, Package2, Layers, Clock, ShieldCheck, ShieldOff,
} from 'lucide-react';
import { getMedicineDetail, getStockEntries, addStockEntry } from '@/services/branchService';
import type { MedicineResponse, StockEntryResponse, StockEntryRequest } from '@/types/api';

const STATUS_CONFIG = {
  IN_STOCK:      { label: 'In Stock',      color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  LOW_STOCK:     { label: 'Low Stock',     color: 'bg-amber-50 text-amber-700 border-amber-100' },
  OUT_OF_STOCK:  { label: 'Out of Stock',  color: 'bg-rose-50 text-rose-700 border-rose-100' },
  EXPIRING_SOON: { label: 'Expiring Soon', color: 'bg-orange-50 text-orange-700 border-orange-100' },
} as const;

const BATCH_STATUS_CONFIG = {
  ACTIVE:        { label: 'Active',        color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  EXPIRED:       { label: 'Expired',       color: 'bg-rose-50 text-rose-700 border-rose-100' },
  EXPIRING_SOON: { label: 'Expiring Soon', color: 'bg-orange-50 text-orange-700 border-orange-100' },
} as const;

const emptyStockForm: StockEntryRequest = {
  quantityReceived: 1, batchNumber: '', purchasePrice: undefined,
  supplier: '', manufacturingDate: '', expiryDate: '', notes: '',
};

export default function MedicineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [medicine, setMedicine] = useState<MedicineResponse | null>(null);
  const [batches, setBatches] = useState<StockEntryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [showStock, setShowStock] = useState(false);
  const [stockForm, setStockForm] = useState<StockEntryRequest>(emptyStockForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const [m, b] = await Promise.all([getMedicineDetail(id), getStockEntries(id)]);
      setMedicine(m);
      setBatches(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load medicine');
    }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    try {
      await addStockEntry(id, stockForm);
      setShowStock(false);
      setStockForm(emptyStockForm);
      showToast('Stock batch added.');
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add stock');
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
        <Loader2 className="animate-spin" size={24} /><span>Loading...</span>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="p-6 text-rose-700 text-sm font-semibold">
        {error || 'Medicine not found.'}
      </div>
    );
  }

  const sc = STATUS_CONFIG[medicine.status] ?? STATUS_CONFIG.IN_STOCK;
  const newTotal = medicine.totalQuantity + (stockForm.quantityReceived || 0);

  return (
    <>
      {/* Back nav */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition">
        <ArrowLeft size={16} /> Back to Inventory
      </button>

      {toast && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">
          {toast}
        </div>
      )}

      {/* Medicine Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{medicine.name}</h1>
            {medicine.genericName && (
              <p className="text-slate-500 mt-0.5">{medicine.genericName}</p>
            )}
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${sc.color}`}>
            {sc.label}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoField label="Category" value={medicine.category ?? '—'} />
          <InfoField label="Unit" value={medicine.unit ?? '—'} />
          <InfoField label="Selling Price"
            value={medicine.sellingPrice != null ? `${medicine.sellingPrice.toLocaleString()} RWF` : '—'} />
          <InfoField label="Low Stock Alert"
            value={medicine.lowStockAlert != null ? String(medicine.lowStockAlert) : '20'} />
          <InfoField label="Prescription"
            value={medicine.requiresPrescription ? 'Required' : 'Not Required'}
            icon={medicine.requiresPrescription
              ? <ShieldCheck size={14} className="text-amber-500" />
              : <ShieldOff size={14} className="text-slate-400" />
            } />
          <InfoField label="Added On"
            value={medicine.createdAt ? new Date(medicine.createdAt).toLocaleDateString() : '—'} />
        </div>

        {medicine.description && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
            <p className="text-sm text-slate-600">{medicine.description}</p>
          </div>
        )}
      </div>

      {/* Stock Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryTile
          icon={<Package2 size={20} className="text-teal-600" />}
          label="Total Quantity"
          value={medicine.totalQuantity}
          bg="bg-teal-50"
        />
        <SummaryTile
          icon={<Layers size={20} className="text-blue-600" />}
          label="Batches"
          value={medicine.batchCount}
          bg="bg-blue-50"
        />
        <SummaryTile
          icon={<Clock size={20} className="text-orange-600" />}
          label="Earliest Expiry"
          value={medicine.earliestExpiry ?? 'N/A'}
          bg="bg-orange-50"
        />
      </div>

      {/* Batch History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Batch History</h2>
          <button
            onClick={() => { setShowStock(true); setFormError(''); setStockForm(emptyStockForm); }}
            className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition">
            <Plus size={14} /> Add Stock
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Layers size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No stock batches yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-4">Batch #</th>
                  <th className="px-5 py-4">Qty Received</th>
                  <th className="px-5 py-4">Purchase Price</th>
                  <th className="px-5 py-4">Supplier</th>
                  <th className="px-5 py-4">Mfg Date</th>
                  <th className="px-5 py-4">Expiry Date</th>
                  <th className="px-5 py-4">Added On</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => {
                  const bsc = BATCH_STATUS_CONFIG[batch.status] ?? BATCH_STATUS_CONFIG.ACTIVE;
                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/60 transition text-sm">
                      <td className="px-5 py-4 font-mono text-xs text-slate-600">{batch.batchNumber ?? '—'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{batch.quantityReceived}</td>
                      <td className="px-5 py-4 text-slate-500">
                        {batch.purchasePrice != null ? `${Number(batch.purchasePrice).toLocaleString()} RWF` : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{batch.supplier ?? '—'}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{batch.manufacturingDate ?? '—'}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{batch.expiryDate ?? '—'}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${bsc.color}`}>
                          {bsc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showStock && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-slate-800">Add Stock</h2>
              <button onClick={() => setShowStock(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Medicine: <span className="font-semibold text-slate-700">{medicine.name}</span>
            </p>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 mb-5 text-sm">
              <span className="text-slate-600">Current: <strong>{medicine.totalQuantity}</strong></span>
              <span className="text-slate-400">→</span>
              <span className="text-teal-700 font-bold">New: {newTotal}</span>
              {stockForm.quantityReceived > 0 && (
                <span className="ml-auto text-teal-600 font-semibold">+{stockForm.quantityReceived}</span>
              )}
            </div>

            {formError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm">{formError}</div>
            )}
            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Quantity Received *</label>
                  <input required type="number" min="1"
                    value={stockForm.quantityReceived}
                    onChange={(e) => setStockForm((p) => ({ ...p, quantityReceived: Number(e.target.value) }))}
                    className="field-input" />
                </div>
                <div>
                  <label className="field-label">Batch Number</label>
                  <input value={stockForm.batchNumber ?? ''}
                    onChange={(e) => setStockForm((p) => ({ ...p, batchNumber: e.target.value }))}
                    className="field-input" />
                </div>
                <div>
                  <label className="field-label">Purchase Price (RWF)</label>
                  <input type="number" min="0" step="0.01"
                    value={stockForm.purchasePrice ?? ''}
                    onChange={(e) => setStockForm((p) => ({ ...p, purchasePrice: e.target.value ? Number(e.target.value) : undefined }))}
                    className="field-input" />
                </div>
                <div>
                  <label className="field-label">Supplier</label>
                  <input value={stockForm.supplier ?? ''}
                    onChange={(e) => setStockForm((p) => ({ ...p, supplier: e.target.value }))}
                    className="field-input" />
                </div>
                <div>
                  <label className="field-label">Manufacturing Date</label>
                  <input type="date" value={stockForm.manufacturingDate ?? ''}
                    onChange={(e) => setStockForm((p) => ({ ...p, manufacturingDate: e.target.value }))}
                    className="field-input" />
                </div>
                <div>
                  <label className="field-label">Expiry Date</label>
                  <input type="date" value={stockForm.expiryDate ?? ''}
                    onChange={(e) => setStockForm((p) => ({ ...p, expiryDate: e.target.value }))}
                    className="field-input" />
                </div>
                <div className="col-span-2">
                  <label className="field-label">Notes</label>
                  <textarea rows={2} value={stockForm.notes ?? ''}
                    onChange={(e) => setStockForm((p) => ({ ...p, notes: e.target.value }))}
                    className="field-input resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowStock(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function InfoField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 font-semibold flex items-center gap-1.5">
        {icon}{value}
      </p>
    </div>
  );
}

function SummaryTile({ icon, label, value, bg }: {
  icon: React.ReactNode; label: string; value: string | number; bg: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 ${bg} p-5 flex items-center gap-4`}>
      <div className="p-2.5 bg-white rounded-xl shadow-sm">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{String(value)}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
