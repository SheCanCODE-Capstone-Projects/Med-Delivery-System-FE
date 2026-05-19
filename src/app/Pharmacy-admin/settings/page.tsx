"use client";
import React, { useEffect, useState } from 'react';
import { Building2, UserCog, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getMyPharmacy, transferManager } from '@/services/pharmacyApi';
import type { PharmacyResponse } from '@/types/api';

export default function SettingsPage() {
  const [pharmacy, setPharmacy] = useState<PharmacyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [transferEmail, setTransferEmail] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMsg, setTransferMsg] = useState('');
  const [transferError, setTransferError] = useState('');

  useEffect(() => {
    getMyPharmacy()
      .then(setPharmacy)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pharmacy'))
      .finally(() => setLoading(false));
  }, []);

  const handleTransfer = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!window.confirm(`Transfer manager role to ${transferEmail}? You will lose manager access.`)) return;
    setTransferLoading(true);
    setTransferMsg('');
    setTransferError('');
    try {
      await transferManager({ newManagerEmail: transferEmail });
      setTransferMsg('Manager role transferred. You will be redirected to login.');
      setTimeout(() => { window.location.href = '/auth/login'; }, 3000);
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <Loader2 className="animate-spin" size={22} />
        <span>Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-rose-600 p-8">
        <AlertCircle size={24} />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-slate-500 mt-1">Pharmacy configuration and administrative controls.</p>
      </div>

      {/* Pharmacy Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Building2 size={20} className="text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Pharmacy Information</h2>
            <p className="text-xs text-slate-500">Read-only — contact support to update.</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          {[
            { label: 'Name', value: pharmacy?.name },
            { label: 'Licence Number', value: pharmacy?.licenseNumber },
            { label: 'Manager', value: pharmacy?.managerName },
            { label: 'Manager Email', value: pharmacy?.managerEmail },
            { label: 'Email', value: pharmacy?.email },
            { label: 'Phone', value: pharmacy?.phoneNumber },
            { label: 'Address', value: pharmacy?.address },
            { label: 'Status', value: pharmacy?.status },
          ].map((row) => (
            <div key={row.label}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{row.label}</span>
              <span className="font-semibold text-slate-700">{row.value ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <UserCog size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Transfer Manager Role</h2>
            <p className="text-xs text-slate-500">Assign another user as the pharmacy manager. This action is irreversible.</p>
          </div>
        </div>
        <div className="p-6">
          {transferMsg && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} /> {transferMsg}
            </div>
          )}
          {transferError && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {transferError}
            </div>
          )}
          <form onSubmit={handleTransfer} className="flex gap-3">
            <input
              required
              type="email"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              placeholder="new.manager@email.com"
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={transferLoading || !transferEmail.trim()}
              className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition flex items-center gap-2"
            >
              {transferLoading && <Loader2 size={14} className="animate-spin" />}
              Transfer
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-400">
            The new manager must already have a registered account. After transfer, you will be logged out.
          </p>
        </div>
      </div>
    </div>
  );
}
