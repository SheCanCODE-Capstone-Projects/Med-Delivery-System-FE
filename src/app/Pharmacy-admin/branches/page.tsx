"use client";
import React, { useEffect, useState } from 'react';
import { GitBranch, Plus, Loader2, Mail, MapPin, X, Users, Package2 } from 'lucide-react';
import { getPharmacyBranches, inviteBranchManager, type BranchResponse } from '@/services/branchService';
import Link from 'next/link';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [inviteForm, setInviteForm] = useState({ email: '', branchName: '', branchAddress: '' });

  useEffect(() => {
    getPharmacyBranches()
      .then(setBranches)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load branches'))
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setSubmitError('');
    try {
      await inviteBranchManager(inviteForm.email, inviteForm.branchName, inviteForm.branchAddress);
      setMsg(`Invitation sent to ${inviteForm.email}.`);
      setShowInvite(false);
      setInviteForm({ email: '', branchName: '', branchAddress: '' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Branches</h1>
          <p className="text-slate-500 mt-1">Manage your pharmacy branches and invite branch managers.</p>
        </div>
        <button onClick={() => { setShowInvite(true); setSubmitError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition">
          <Plus size={16} /> Invite Branch Manager
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">{msg}</div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">Invite Branch Manager</h2>
              <button onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              The manager will receive an email with a link to set up their account and branch details.
            </p>
            {submitError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm">{submitError}</div>
            )}
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Manager Email *</label>
                <input required type="email" value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="manager@pharmacy.rw" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Branch Name *</label>
                <input required value={inviteForm.branchName}
                  onChange={(e) => setInviteForm((f) => ({ ...f, branchName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Kigali Central Branch" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Branch Address</label>
                <input value={inviteForm.branchAddress}
                  onChange={(e) => setInviteForm((f) => ({ ...f, branchAddress: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="KN 5 Ave, Kigali" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)}
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
            <Loader2 className="animate-spin" size={22} /><span>Loading branches...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-rose-700 text-sm font-semibold">{error}</div>
        ) : branches.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <GitBranch size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No branches yet. Invite a branch manager to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <GitBranch size={14} className="text-teal-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800">{b.name}</p>
                          {b.address && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />{b.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {b.managerName ? (
                        <div>
                          <p className="text-sm font-medium text-slate-700">{b.managerName}</p>
                          {b.managerEmail && (
                            <p className="text-xs flex items-center gap-1 text-slate-400">
                              <Mail size={10} />{b.managerEmail}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-slate-300 text-xs italic">Not assigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users size={11} />{b.pharmacistCount}</span>
                        <span className="flex items-center gap-1"><Package2 size={11} />{b.inventoryItemCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[b.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/Pharmacy-admin/branches/${b.id}`}
                        className="px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {branches.length} branch{branches.length !== 1 ? 'es' : ''}
        </div>
      </div>
    </>
  );
}
