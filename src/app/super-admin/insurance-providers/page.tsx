"use client";
import React, { useState, useEffect } from 'react';
import { ShieldPlus, Pencil, Trash2, Plus, X, Loader2, AlertCircle, Check } from 'lucide-react';
import {
  getAllInsuranceProviders,
  createInsuranceProvider,
  updateInsuranceProvider,
  deleteInsuranceProvider,
} from '@/services/adminApi';
import type { InsuranceProvider } from '@/types/api';

interface FormState {
  name: string;
  code: string;
  coveragePercentage: string;
}

const EMPTY_FORM: FormState = { name: '', code: '', coveragePercentage: '' };

function ProviderModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial?: InsuranceProvider;
  onSave: (data: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? { name: initial.name, code: initial.code, coveragePercentage: String(initial.coveragePercentage) }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.code.trim()) e.code = 'Code is required.';
    const pct = Number(form.coveragePercentage);
    if (!form.coveragePercentage.trim() || isNaN(pct) || pct < 1 || pct > 100)
      e.coveragePercentage = 'Enter a percentage between 1 and 100.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {initial ? 'Edit Insurance Provider' : 'Add Insurance Provider'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Provider name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. RSSB"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.name ? 'border-rose-400' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Code <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. RSSB"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              className={`h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.code ? 'border-rose-400' : 'border-slate-200'}`}
            />
            {errors.code && <p className="text-xs text-rose-600">{errors.code}</p>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Coverage percentage <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={100}
                placeholder="e.g. 80"
                value={form.coveragePercentage}
                onChange={(e) => setForm((f) => ({ ...f, coveragePercentage: e.target.value }))}
                className={`h-10 w-full rounded-lg border px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.coveragePercentage ? 'border-rose-400' : 'border-slate-200'}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
            </div>
            {errors.coveragePercentage && <p className="text-xs text-rose-600">{errors.coveragePercentage}</p>}
            <p className="text-xs text-slate-400">The percentage of the order cost covered by this provider for all partnered pharmacies.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-10 rounded-lg bg-teal-600 text-sm font-bold text-white hover:bg-teal-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {initial ? 'Save changes' : 'Add provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onConfirm, onCancel, deleting }: {
  name: string; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-rose-600" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Delete provider?</h3>
        <p className="text-sm text-slate-500 mb-5">
          <span className="font-semibold text-slate-700">{name}</span> will be removed. Pharmacies linked to this provider will lose the association.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 h-10 rounded-lg bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting && <Loader2 size={15} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InsuranceProvidersPage() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InsuranceProvider | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InsuranceProvider | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllInsuranceProviders();
      setProviders(data);
    } catch {
      setError('Failed to load insurance providers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: FormState) => {
    setSaving(true);
    setSaveError('');
    try {
      const data = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        coveragePercentage: Number(form.coveragePercentage),
      };
      if (editing) {
        const updated = await updateInsuranceProvider(editing.id, data);
        setProviders((prev) => prev.map((p) => p.id === editing.id ? updated : p));
      } else {
        const created = await createInsuranceProvider(data);
        setProviders((prev) => [...prev, created]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInsuranceProvider(deleteTarget.id);
      setProviders((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Insurance Providers</h1>
          <p className="text-slate-500 mt-1">
            Manage platform-wide insurance providers and their coverage percentages. Pharmacies select from this list.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setSaveError(''); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition shadow-sm"
        >
          <Plus size={16} /> Add Provider
        </button>
      </div>

      {saveError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={15} /> {saveError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading providers…</span>
          </div>
        ) : providers.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <ShieldPlus size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">No insurance providers yet</p>
            <p className="text-sm mt-1">Add the first provider so pharmacies can select it during registration.</p>
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition"
            >
              <Plus size={15} /> Add Provider
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Provider name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Coverage %</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs border border-teal-100">
                          {p.code.slice(0, 2)}
                        </div>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">{p.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${p.coveragePercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-teal-700">{p.coveragePercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditing(p); setSaveError(''); setModalOpen(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {providers.length} provider{providers.length !== 1 ? 's' : ''} — coverage % is platform-wide and applies to all partnered pharmacies
        </div>
      </div>

      {modalOpen && (
        <ProviderModal
          initial={editing ?? undefined}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </>
  );
}
