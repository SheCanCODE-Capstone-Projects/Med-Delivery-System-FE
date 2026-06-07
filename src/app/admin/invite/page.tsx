"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Mail, GitBranch, Building2, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { invitePharmacyAdmin, inviteBranchManager, getAllPharmaciesAdmin } from '@/services/adminApi';
import type { PharmacyResponse } from '@/types/api';

type Tab = 'pharmacy' | 'branch';

interface FormState {
  email: string;
  branchName: string;
  pharmacyId: string;
}

const INITIAL_FORM: FormState = { email: '', branchName: '', pharmacyId: '' };

export default function AdminInvitePage() {
  const [tab, setTab] = useState<Tab>('pharmacy');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [activePharmacies, setActivePharmacies] = useState<PharmacyResponse[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);

  useEffect(() => {
    setLoadingPharmacies(true);
    getAllPharmaciesAdmin('ACTIVE')
      .then(setActivePharmacies)
      .catch(() => {})
      .finally(() => setLoadingPharmacies(false));
  }, []);

  const reset = () => { setForm(INITIAL_FORM); setSuccessMsg(''); setError(''); };

  const handleTabChange = (t: Tab) => { setTab(t); reset(); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      if (tab === 'pharmacy') {
        await invitePharmacyAdmin(form.email.trim());
        setSuccessMsg(`Invitation sent to ${form.email.trim()}. They can now set up their pharmacy.`);
      } else {
        if (!form.pharmacyId) throw new Error('Please select a pharmacy.');
        await inviteBranchManager(form.email.trim(), form.branchName.trim(), Number(form.pharmacyId));
        setSuccessMsg(`Invitation sent to ${form.email.trim()} to manage "${form.branchName}".`);
      }
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Send Invitation</h1>
          <p className="text-slate-500 mt-1">
            Invite pharmacy admins to register their pharmacy, or branch managers to set up a branch.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          <button
            onClick={() => handleTabChange('pharmacy')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'pharmacy' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 size={15} />
            Pharmacy Admin
          </button>
          <button
            onClick={() => handleTabChange('branch')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'branch' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch size={15} />
            Branch Manager
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* Context */}
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${
            tab === 'pharmacy' ? 'bg-teal-50 border border-teal-100' : 'bg-blue-50 border border-blue-100'
          }`}>
            <div className={`mt-0.5 ${tab === 'pharmacy' ? 'text-teal-600' : 'text-blue-600'}`}>
              {tab === 'pharmacy' ? <Building2 size={18} /> : <GitBranch size={18} />}
            </div>
            <div>
              {tab === 'pharmacy' ? (
                <>
                  <p className="text-sm font-semibold text-teal-800">Pharmacy Admin Invitation</p>
                  <p className="text-xs text-teal-700 mt-0.5">
                    The invited person will receive a link to register their pharmacy and create their account.
                    Their pharmacy will be <strong>pending your approval</strong> until you review and activate it.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-blue-800">Branch Manager Invitation</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    The invited person will receive a link to set up a new branch under the selected pharmacy
                    and activate their account immediately.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
              <CheckCircle2 size={15} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="manager@pharmacy.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Branch-only fields */}
            {tab === 'branch' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Pharmacy *
                  </label>
                  {loadingPharmacies ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                      <Loader2 size={14} className="animate-spin" /> Loading pharmacies...
                    </div>
                  ) : (
                    <select
                      required
                      value={form.pharmacyId}
                      onChange={e => setForm(f => ({ ...f, pharmacyId: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="">— Select a pharmacy —</option>
                      {activePharmacies.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Branch Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.branchName}
                    onChange={e => setForm(f => ({ ...f, branchName: e.target.value }))}
                    placeholder="e.g. Kicukiro Branch"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">
                Invitation link expires in <strong>48 hours</strong>.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
