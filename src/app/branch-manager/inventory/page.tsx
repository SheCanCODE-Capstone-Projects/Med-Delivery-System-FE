"use client";
import React, { useEffect, useState, useMemo } from 'react';
import {
  Package2, Plus, Loader2, X, Search, Edit2, ChevronRight,
  Clock, TrendingDown, BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import {
  getInventoryStats, getMedicines, createMedicine, updateMedicine,
  deleteMedicine, addStockEntry,
} from '@/services/branchService';
import type {
  MedicineResponse, InventoryDashboardStats, MedicineFormRequest, StockEntryRequest,
} from '@/types/api';

const MEDICINE_CATEGORIES = [
  'Antibiotics', 'Pain Relievers', 'Vitamins & Supplements', 'Antimalarials',
  'Antifungals', 'Antihistamines', 'Diabetes Medications', 'Blood Pressure Medications',
  'Respiratory Medicines', 'Digestive Medicines', 'Eye Care', 'Skin Care',
  'Injectables', 'Medical Supplies', 'Baby Care', 'First Aid', 'Other',
];

const STATUS_CONFIG = {
  IN_STOCK:      { label: 'In Stock',      color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  LOW_STOCK:     { label: 'Low Stock',     color: 'bg-amber-50 text-amber-700 border-amber-100' },
  OUT_OF_STOCK:  { label: 'Out of Stock',  color: 'bg-rose-50 text-rose-700 border-rose-100' },
  EXPIRING_SOON: { label: 'Expiring Soon', color: 'bg-orange-50 text-orange-700 border-orange-100' },
} as const;

const emptyMedicineForm: MedicineFormRequest = {
  medicineName: '', genericName: '', category: '', unit: '',
  sellingPrice: undefined, lowStockAlert: 20, requiresPrescription: false, description: '',
};

const emptyStockForm: StockEntryRequest = {
  quantityReceived: 1, batchNumber: '', purchasePrice: undefined,
  supplier: '', manufacturingDate: '', expiryDate: '', notes: '',
};

export default function BranchInventoryPage() {
  const [stats, setStats] = useState<InventoryDashboardStats | null>(null);
  const [medicines, setMedicines] = useState<MedicineResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // filters
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // modals
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<MedicineResponse | null>(null);
  const [stockTarget, setStockTarget] = useState<MedicineResponse | null>(null);

  // form state
  const [medForm, setMedForm] = useState<MedicineFormRequest>(emptyMedicineForm);
  const [stockForm, setStockForm] = useState<StockEntryRequest>(emptyStockForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const [s, m] = await Promise.all([getInventoryStats(), getMedicines()]);
      setStats(s);
      setMedicines(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inventory');
    }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = useMemo(() => medicines.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
        !(m.genericName ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && m.category !== catFilter) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  }), [medicines, search, catFilter, statusFilter]);

  // ── Add Medicine ───────────────────────────────────────────────────────────
  const openAdd = () => { setMedForm(emptyMedicineForm); setFormError(''); setShowAdd(true); };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    try {
      await createMedicine(medForm);
      setShowAdd(false);
      showToast('Medicine added successfully.');
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add medicine');
    } finally { setSubmitting(false); }
  };

  // ── Edit Medicine ──────────────────────────────────────────────────────────
  const openEdit = (med: MedicineResponse) => {
    setEditTarget(med);
    setMedForm({
      medicineName: med.name, genericName: med.genericName ?? '',
      category: med.category ?? '', unit: med.unit ?? '',
      sellingPrice: med.sellingPrice, lowStockAlert: med.lowStockAlert ?? 20,
      requiresPrescription: med.requiresPrescription, description: med.description ?? '',
    });
    setFormError('');
  };

  const handleEditMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSubmitting(true); setFormError('');
    try {
      await updateMedicine(editTarget.id, medForm);
      setEditTarget(null);
      showToast('Medicine updated.');
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update medicine');
    } finally { setSubmitting(false); }
  };

  // ── Add Stock ──────────────────────────────────────────────────────────────
  const openStock = (med: MedicineResponse) => {
    setStockTarget(med);
    setStockForm(emptyStockForm);
    setFormError('');
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockTarget) return;
    setSubmitting(true); setFormError('');
    try {
      await addStockEntry(stockTarget.id, stockForm);
      setStockTarget(null);
      showToast(`Stock added for ${stockTarget.name}.`);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add stock');
    } finally { setSubmitting(false); }
  };

  // ── Delete (only if qty = 0) ───────────────────────────────────────────────
  const handleDelete = async (med: MedicineResponse) => {
    if (!confirm(`Remove "${med.name}" from this branch? This cannot be undone.`)) return;
    try {
      await deleteMedicine(med.id);
      showToast(`${med.name} removed.`);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cannot remove medicine with active stock.');
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Manage medicines and track stock batches for your branch.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition">
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {toast && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">
          {toast}
        </div>
      )}

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Package2 size={20} />} label="Total Medicines" value={stats.totalMedicines} color="teal" />
          <StatCard icon={<BarChart3 size={20} />} label="Total Stock Units" value={stats.totalStockUnits} color="blue" />
          <StatCard icon={<TrendingDown size={20} />} label="Low Stock" value={stats.lowStockItems} color="amber" />
          <StatCard icon={<Clock size={20} />} label="Expiring Soon" value={stats.expiringSoonItems} color="orange" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search medicines..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="">All Categories</option>
          {MEDICINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="">All Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} /><span>Loading inventory...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-rose-700 text-sm font-semibold">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Package2 size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">{medicines.length === 0 ? 'No medicines yet. Add your first medicine.' : 'No medicines match the current filters.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-4">Medicine</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Qty</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Expiry</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((med) => {
                  const sc = STATUS_CONFIG[med.status] ?? STATUS_CONFIG.IN_STOCK;
                  return (
                    <tr key={med.id} className="hover:bg-slate-50/60 transition text-sm">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{med.name}</p>
                        {med.genericName && <p className="text-xs text-slate-400">{med.genericName}</p>}
                        {med.batchCount > 0 && (
                          <p className="text-xs text-slate-400">{med.batchCount} batch{med.batchCount !== 1 ? 'es' : ''}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{med.category ?? '—'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {med.totalQuantity} {med.unit && <span className="text-xs text-slate-400">{med.unit}</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {med.sellingPrice != null ? `${med.sellingPrice.toLocaleString()} RWF` : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {med.earliestExpiry ?? '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button onClick={() => openStock(med)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100 transition">
                            <Plus size={11} /> Stock
                          </button>
                          <button onClick={() => openEdit(med)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                            <Edit2 size={13} />
                          </button>
                          <Link href={`/branch-manager/inventory/${med.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition">
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {filtered.length} of {medicines.length} medicine{medicines.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAdd && (
        <MedicineModal
          title="Add Medicine"
          form={medForm}
          setForm={setMedForm}
          onSubmit={handleAddMedicine}
          onClose={() => setShowAdd(false)}
          submitting={submitting}
          error={formError}
        />
      )}

      {/* Edit Medicine Modal */}
      {editTarget && (
        <MedicineModal
          title={`Edit — ${editTarget.name}`}
          form={medForm}
          setForm={setMedForm}
          onSubmit={handleEditMedicine}
          onClose={() => setEditTarget(null)}
          submitting={submitting}
          error={formError}
          isEdit
          onDelete={() => handleDelete(editTarget)}
          canDelete={editTarget.totalQuantity === 0}
        />
      )}

      {/* Add Stock Modal */}
      {stockTarget && (
        <StockModal
          medicine={stockTarget}
          form={stockForm}
          setForm={setStockForm}
          onSubmit={handleAddStock}
          onClose={() => setStockTarget(null)}
          submitting={submitting}
          error={formError}
        />
      )}
    </>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: string;
}) {
  const colors: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{Number(value).toLocaleString()}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

// ── Medicine Modal (shared for Add & Edit) ─────────────────────────────────────

function MedicineModal({ title, form, setForm, onSubmit, onClose, submitting, error, isEdit, onDelete, canDelete }: {
  title: string;
  form: MedicineFormRequest;
  setForm: React.Dispatch<React.SetStateAction<MedicineFormRequest>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitting: boolean;
  error: string;
  isEdit?: boolean;
  onDelete?: () => void;
  canDelete?: boolean;
}) {
  const f = (field: keyof MedicineFormRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        {error && <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="field-label">Medicine Name *</label>
              <input required value={form.medicineName} onChange={f('medicineName')} className="field-input" />
            </div>
            <div className="col-span-2">
              <label className="field-label">Generic Name</label>
              <input value={form.genericName ?? ''} onChange={f('genericName')} className="field-input" />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select value={form.category ?? ''} onChange={f('category')} className="field-input bg-white">
                <option value="">— Select —</option>
                {MEDICINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Unit</label>
              <input value={form.unit ?? ''} placeholder="tablet, ml, capsule…" onChange={f('unit')} className="field-input" />
            </div>
            <div>
              <label className="field-label">Selling Price (RWF)</label>
              <input type="number" min="0" step="0.01"
                value={form.sellingPrice ?? ''} onChange={(e) => setForm((p) => ({ ...p, sellingPrice: e.target.value ? Number(e.target.value) : undefined }))}
                className="field-input" />
            </div>
            <div>
              <label className="field-label">Low Stock Alert</label>
              <input type="number" min="0"
                value={form.lowStockAlert ?? ''} onChange={(e) => setForm((p) => ({ ...p, lowStockAlert: e.target.value ? Number(e.target.value) : undefined }))}
                className="field-input" />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <input type="checkbox" id="rx" checked={!!form.requiresPrescription}
                onChange={(e) => setForm((p) => ({ ...p, requiresPrescription: e.target.checked }))}
                className="w-4 h-4 text-teal-600 rounded" />
              <label htmlFor="rx" className="text-sm text-slate-700 font-medium cursor-pointer">
                Requires Prescription
              </label>
            </div>
            <div className="col-span-2">
              <label className="field-label">Description</label>
              <textarea rows={2} value={form.description ?? ''} onChange={f('description')}
                className="field-input resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            {isEdit && onDelete && (
              <button type="button" onClick={onDelete} disabled={!canDelete}
                className="px-3 py-2 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title={canDelete ? 'Remove medicine from branch' : 'Deplete stock before removing'}>
                Remove
              </button>
            )}
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Stock Modal ────────────────────────────────────────────────────────────────

function StockModal({ medicine, form, setForm, onSubmit, onClose, submitting, error }: {
  medicine: MedicineResponse;
  form: StockEntryRequest;
  setForm: React.Dispatch<React.SetStateAction<StockEntryRequest>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitting: boolean;
  error: string;
}) {
  const newTotal = medicine.totalQuantity + (form.quantityReceived || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-slate-800">Add Stock</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Medicine: <span className="font-semibold text-slate-700">{medicine.name}</span>
        </p>

        {/* Stock change preview */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 mb-5 text-sm">
          <span className="text-slate-600">Current stock: <strong>{medicine.totalQuantity}</strong></span>
          <span className="text-slate-400">→</span>
          <span className="text-teal-700 font-bold">New stock: {newTotal}</span>
          {form.quantityReceived > 0 && (
            <span className="ml-auto text-teal-600 font-semibold">+{form.quantityReceived}</span>
          )}
        </div>

        {error && <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Quantity Received *</label>
              <input required type="number" min="1"
                value={form.quantityReceived}
                onChange={(e) => setForm((p) => ({ ...p, quantityReceived: Number(e.target.value) }))}
                className="field-input" />
            </div>
            <div>
              <label className="field-label">Batch Number</label>
              <input value={form.batchNumber ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, batchNumber: e.target.value }))}
                className="field-input" />
            </div>
            <div>
              <label className="field-label">Purchase Price (RWF)</label>
              <input type="number" min="0" step="0.01"
                value={form.purchasePrice ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, purchasePrice: e.target.value ? Number(e.target.value) : undefined }))}
                className="field-input" />
            </div>
            <div>
              <label className="field-label">Supplier</label>
              <input value={form.supplier ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))}
                className="field-input" />
            </div>
            <div>
              <label className="field-label">Manufacturing Date</label>
              <input type="date" value={form.manufacturingDate ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, manufacturingDate: e.target.value }))}
                className="field-input" />
            </div>
            <div>
              <label className="field-label">Expiry Date</label>
              <input type="date" value={form.expiryDate ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
                className="field-input" />
            </div>
            <div className="col-span-2">
              <label className="field-label">Notes</label>
              <textarea rows={2} value={form.notes ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="field-input resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
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
  );
}
