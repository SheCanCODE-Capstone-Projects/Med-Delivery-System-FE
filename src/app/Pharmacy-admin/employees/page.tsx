"use client";
import React, { useEffect, useState } from 'react';
import { Users, Loader2, AlertCircle, Mail, Phone, Copy, Check, Info, ShieldOff, ShieldCheck } from 'lucide-react';
import { getPharmacistsByPharmacy, getMyPharmacy } from '@/services/pharmacyApi';
import { setPharmacyPharmacistStatus } from '@/services/branchService';
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
      // ignore
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [toggling, setToggling] = useState<number | null>(null);

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
      .then((pharmacy) => load(pharmacy.id))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pharmacy'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (p: PharmacistResponse, activate: boolean) => {
    const confirmMsg = activate
      ? 'Activate this pharmacist? They will be able to log in again.'
      : 'Deactivate this pharmacist? They will no longer be able to log in.';
    if (!window.confirm(confirmMsg)) return;
    setToggling(p.id);
    setActionMsg('');
    try {
      await setPharmacyPharmacistStatus(p.id, activate);
      setActionMsg(`Pharmacist ${activate ? 'activated' : 'deactivated'}.`);
      setPharmacists((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: activate } : x));
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : `Failed to ${activate ? 'activate' : 'deactivate'}`);
    } finally {
      setToggling(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Personnel Management</h1>
          <p className="text-slate-500 mt-1">Manage your pharmacy&apos;s pharmacists and staff.</p>
        </div>
      </div>

      <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>
          This is a view of all pharmacists across your pharmacy. To add pharmacists to a specific branch, the branch manager should use their portal.
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
            <p className="font-medium">No pharmacists yet.</p>
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
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{p.pharmacistUniqueId ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${status.style}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {!p.isVerified && <SetupLinkButton email={p.email} />}
                          {!p.isActive && p.isVerified && (
                            <button
                              onClick={() => handleToggleActive(p, true)}
                              disabled={toggling === p.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition disabled:opacity-50 bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                            >
                              {toggling === p.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                              Activate
                            </button>
                          )}
                          {p.isActive && p.isVerified && (
                            <button
                              onClick={() => handleToggleActive(p, false)}
                              disabled={toggling === p.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition disabled:opacity-50 bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                            >
                              {toggling === p.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                              Deactivate
                            </button>
                          )}
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
