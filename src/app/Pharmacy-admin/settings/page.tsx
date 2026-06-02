"use client";
import React, { useEffect, useState } from 'react';
import { Building2, UserCog, Loader2, AlertCircle, CheckCircle2, User, Phone, MapPin, Save } from 'lucide-react';
import { getMyPharmacy, transferManager, updateMyPharmacy } from '@/services/pharmacyApi';
import { getUserName } from '@/services/authApi';
import type { PharmacyResponse } from '@/types/api';

export default function SettingsPage() {
  const [pharmacy, setPharmacy] = useState<PharmacyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editable fields
  const [contactInfo, setContactInfo] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  // Transfer manager
  const [transferEmail, setTransferEmail] = useState('');
  const [transferName, setTransferName] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMsg, setTransferMsg] = useState('');
  const [transferError, setTransferError] = useState('');

  const managerName = typeof window !== 'undefined' ? getUserName() : null;

  useEffect(() => {
    getMyPharmacy()
      .then((ph) => {
        setPharmacy(ph);
        setContactInfo(ph.contactInfo ?? '');
        setAddress(ph.address ?? '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pharmacy'))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePharmacy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      const updated = await updateMyPharmacy({
        contactInfo: contactInfo || undefined,
        address: address || undefined,
      });
      setPharmacy(updated);
      setSaveMsg('Pharmacy details updated successfully.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update details');
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.confirm(`Transfer manager role to ${transferEmail}? You will lose manager access.`)) return;
    setTransferLoading(true);
    setTransferMsg('');
    setTransferError('');
    try {
      await transferManager({ managerEmail: transferEmail, managerName: transferName });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile and pharmacy configuration.</p>
      </div>

      {/* Manager Profile (read-only) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <User size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Manager Profile</h2>
            <p className="text-xs text-slate-500">Your personal account information.</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</span>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold">
              <User size={14} className="text-slate-400 shrink-0" />
              {managerName ?? pharmacy?.managerName ?? '—'}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email Address</span>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold">
              <span className="text-slate-400 shrink-0 text-xs">@</span>
              {pharmacy?.managerEmail ?? '—'}
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 text-xs text-slate-400">
          To update your name or email, please contact support.
        </div>
      </div>

      {/* Pharmacy Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Building2 size={20} className="text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Pharmacy Information</h2>
            <p className="text-xs text-slate-500">Update your contact info and address below.</p>
          </div>
        </div>

        {/* Read-only fields */}
        <div className="px-6 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Pharmacy Name', value: pharmacy?.name },
            { label: 'Pharmacy Code', value: pharmacy?.pharmacyCode },
            { label: 'Licence Number', value: pharmacy?.licenseNumber },
            { label: 'Status', value: pharmacy?.status },
          ].map((row) => (
            <div key={row.label}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{row.label}</span>
              <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm">
                {row.value ?? '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Editable fields */}
        <form onSubmit={handleSavePharmacy} className="px-6 pb-6 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Phone / Contact <span className="text-teal-600 normal-case font-normal">(editable)</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="+250 788 000 000"
                  className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Address <span className="text-teal-600 normal-case font-normal">(editable)</span>
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City"
                  className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {saveMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 size={15} /> {saveMsg}
            </div>
          )}
          {saveError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={15} /> {saveError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Transfer Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
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
          <form onSubmit={handleTransfer} className="space-y-3">
            <div className="flex gap-3">
              <input
                required
                type="text"
                value={transferName}
                onChange={(e) => setTransferName(e.target.value)}
                placeholder="New manager's full name"
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                required
                type="email"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                placeholder="new.manager@email.com"
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={transferLoading || !transferEmail.trim() || !transferName.trim()}
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
