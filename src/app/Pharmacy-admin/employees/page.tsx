"use client";
import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Loader2, AlertCircle, X, Mail, Phone } from 'lucide-react';
import { getPharmacistsByPharmacy, addPharmacist, removePharmacist } from '@/services/pharmacyApi';
import { getPharmacyId } from '@/services/authApi';
import type { PharmacistResponse } from '@/types/api';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function EmployeesPage() {
  const [pharmacists, setPharmacists] = useState<PharmacistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '' });

  const pharmacyId = getPharmacyId();

  const load = async () => {
    if (!pharmacyId) { setLoading(false); return; }
    try {
      const data = await getPharmacistsByPharmacy(pharmacyId);
      setPharmacists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pharmacists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!pharmacyId) return;
    setSubmitting(true);
    setActionMsg('');
    try {
      await addPharmacist(pharmacyId, form);
      setActionMsg('Pharmacist added successfully.');
      setShowForm(false);
      setForm({ fullName: '', email: '', phoneNumber: '' });
      load();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Failed to add pharmacist');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!pharmacyId || !window.confirm('Remove this pharmacist from the pharmacy?')) return;
    setRemoving(id);
    setActionMsg('');
    try {
      await removePharmacist(pharmacyId, id);
      setActionMsg('Pharmacist removed.');
      setPharmacists((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Failed to remove pharmacist');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Personnel Management</h1>
          <p className="text-slate-500 mt-1">Manage your pharmacy's pharmacists and staff.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition"
        >
          <Plus size={16} /> Add Pharmacist
        </button>
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">
          {actionMsg}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Pharmacist</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Dr. Jane Doe"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="jane@pharmacy.rw"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone (optional)</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+250 788 000 000"
                />
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
                  Add Pharmacist
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
            <span>Loading staff...</span>
          </div>
        ) : pharmacists.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Users size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No pharmacists yet. Add one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pharmacists.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition text-sm">
                  <td className="px-6 py-4 font-semibold text-slate-800">{p.fullName}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-xs"><Mail size={12} /> {p.email}</span>
                      {p.phoneNumber && (
                        <span className="flex items-center gap-1.5 text-xs"><Phone size={12} /> {p.phoneNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLOR[p.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleRemove(p.id)}
                      disabled={removing === p.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition disabled:opacity-50 mx-auto"
                    >
                      {removing === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {pharmacists.length} staff member{pharmacists.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
