"use client";
import React, { useEffect, useState } from 'react';
import { Users, Trash2, Loader2, AlertCircle, Mail, Phone, Copy, Check, Info } from 'lucide-react';
import { getPharmacistsByPharmacy, removePharmacist, getMyPharmacy } from '@/services/pharmacyApi';
import type { PharmacistResponse } from '@/types/api';

function pharmacistStatus(p: PharmacistResponse): { label: string; style: string } {
  if (p.isActive && p.isVerified) return { label: 'ACTIVE', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  if (!p.isVerified && !p.isActive) return { label: 'SETUP NEEDED', style: 'bg-amber-50 text-amber-700 border-amber-100' };
  return { label: 'PENDING', style: 'bg-slate-100 text-slate-500 border-slate-200' };
}

function SetupLinkButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/verify-otp?username=${encodeURIComponent(email)}&after=pharmacist-setup`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy account setup link to share with pharmacist"
      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition whitespace-nowrap"
    >
      {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Setup Link</>}
    </button>
  );
}

export default function EmployeesPage() {
  const [pharmacists, setPharmacists] = useState<PharmacistResponse[]>([]);
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [removing, setRemoving] = useState<number | null>(null);

  const load = async (id: number) => {
    try {
      const data = await getPharmacistsByPharmacy(id);
      setPharmacists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pharmacists');
    }
  };

  useEffect(() => {
    getMyPharmacy()
      .then((pharmacy) => {
        setPharmacyId(pharmacy.id);
        return load(pharmacy.id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pharmacy'))
      .finally(() => setLoading(false));
  }, []);

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
    <>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Personnel Management</h1>
          <p className="text-slate-500 mt-1">Manage your pharmacy's pharmacists and staff.</p>
        </div>
      </div>

      <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>
          This is a read-only view of all pharmacists across your pharmacy. To add pharmacists to a specific branch, the branch manager should use their portal.
        </span>
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">
          {actionMsg}
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
            <Loader2 className="animate-spin" size={22} /><span>Loading staff...</span>
          </div>
        ) : pharmacists.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Users size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No pharmacists yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pharmacists.map((p) => {
                  const status = pharmacistStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition text-sm">
                      <td className="px-6 py-4 font-semibold text-slate-800">{p.fullName}</td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-xs"><Mail size={12} />{p.email}</span>
                          {p.phoneNumber && <span className="flex items-center gap-1.5 text-xs"><Phone size={12} />{p.phoneNumber}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {p.pharmacistUniqueId ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${status.style}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {!p.isActive && (
                            <SetupLinkButton email={p.email} />
                          )}
                          <button onClick={() => handleRemove(p.id)} disabled={removing === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition disabled:opacity-50">
                            {removing === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            Remove
                          </button>
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
          {pharmacists.length} staff member{pharmacists.length !== 1 ? 's' : ''}
        </div>
      </div>
    </>
  );
}
