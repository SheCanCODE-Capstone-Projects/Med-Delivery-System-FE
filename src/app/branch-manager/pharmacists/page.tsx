"use client";
import React, { useEffect, useState } from 'react';
import { Users, Plus, Loader2, Mail, Phone, X, Copy, Check, RefreshCw, RotateCw, ShieldOff, ShieldCheck } from 'lucide-react';
import {
  getBranchPharmacists, addBranchPharmacist, deactivateBranchPharmacist, activateBranchPharmacist, resendPharmacistSetup,
  type BranchPharmacistResponse,
} from '@/services/branchService';

function statusStyle(p: BranchPharmacistResponse) {
  if (p.isActive && p.isVerified) return { label: 'ACTIVE', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  if (!p.isActive && !p.isVerified) return { label: 'SETUP NEEDED', style: 'bg-amber-50 text-amber-700 border-amber-100' };
  return { label: 'PENDING', style: 'bg-slate-100 text-slate-500 border-slate-200' };
}

function SetupLinkButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/verify-otp?username=${encodeURIComponent(email)}&after=pharmacist-setup`;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition">
      {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Setup Link</>}
    </button>
  );
}

export default function BranchPharmacistsPage() {
  const [pharmacists, setPharmacists] = useState<BranchPharmacistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [removing, setRemoving] = useState<number | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  const load = () => getBranchPharmacists()
    .then(setPharmacists)
    .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load().finally(() => setLoading(false));
    const id = setInterval(() => load(), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setSubmitError('');
    try {
      await addBranchPharmacist({ email });
      setMsg('Invitation sent. The pharmacist will receive an email to set up their account.');
      setShowForm(false);
      setEmail('');
      load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally { setSubmitting(false); }
  };

  const handleResendSetup = async (p: BranchPharmacistResponse) => {
    setResendingId(p.id);
    setMsg('');
    try {
      await resendPharmacistSetup(p.id);
      setMsg(`Setup email resent to ${p.email}.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to resend setup email');
    } finally {
      setResendingId(null);
    }
  };

  const handleToggleActive = async (p: BranchPharmacistResponse, activate: boolean) => {
    const confirmMsg = activate
      ? 'Activate this pharmacist? They will be able to log in again.'
      : 'Deactivate this pharmacist? They will no longer be able to log in.';
    if (!window.confirm(confirmMsg)) return;
    setRemoving(p.id);
    try {
      if (activate) {
        await activateBranchPharmacist(p.id);
      } else {
        await deactivateBranchPharmacist(p.id);
      }
      setPharmacists((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: activate } : x));
      setMsg(`Pharmacist ${activate ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : `Failed to ${activate ? 'activate' : 'deactivate'}`);
    } finally { setRemoving(null); }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pharmacists</h1>
          <p className="text-slate-500 mt-1">Manage pharmacists assigned to your branch.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} title="Refresh status"
            className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
            <RotateCw size={15} /> Refresh
          </button>
          <button onClick={() => { setShowForm(true); setSubmitError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition">
            <Plus size={16} /> Invite Pharmacist
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">
          {msg}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Invite Pharmacist</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {submitError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-sm">{submitError}</div>
            )}
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pharmacist@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-slate-400 mt-1">They will receive an email to set up their own account details.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} /><span>Loading...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-rose-700 text-sm font-semibold">{error}</div>
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
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pharmacists.map((p) => {
                  const s = statusStyle(p);
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.style}`}>{s.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {!p.isVerified && (
                            <>
                              <button
                                onClick={() => handleResendSetup(p)}
                                disabled={resendingId === p.id}
                                title="Resend account setup email"
                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-teal-50 text-teal-600 border border-teal-100 rounded-lg hover:bg-teal-100 transition disabled:opacity-50"
                              >
                                {resendingId === p.id ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                                Resend
                              </button>
                              <SetupLinkButton email={p.email} />
                            </>
                          )}
                          {p.isActive && (
                            <button
                              onClick={() => handleToggleActive(p, false)}
                              disabled={removing === p.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition disabled:opacity-50 bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                            >
                              {removing === p.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                              Deactivate
                            </button>
                          )}
                          {!p.isActive && p.isVerified && (
                            <button
                              onClick={() => handleToggleActive(p, true)}
                              disabled={removing === p.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition disabled:opacity-50 bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                            >
                              {removing === p.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                              Activate
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
          {pharmacists.length} pharmacist{pharmacists.length !== 1 ? 's' : ''}
        </div>
      </div>
    </>
  );
}
