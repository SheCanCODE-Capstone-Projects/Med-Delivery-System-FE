"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, UserRound } from 'lucide-react';
import { getMyProfile } from '@/services/pharmacistApi';
import type { PharmacistResponse } from '@/types/api';

export default function PharmacistProfilePage() {
  const [profile, setProfile] = useState<PharmacistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">Your pharmacist account details.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={22} />
          <span>Loading profile…</span>
        </div>
      ) : error ? (
        <p className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm">{error}</p>
      ) : !profile ? (
        <p className="text-slate-400 text-sm">Profile not found. Please contact your pharmacy manager.</p>
      ) : (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Avatar section */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-8 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40">
              <UserRound className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{profile.fullName}</p>
              <p className="text-teal-100 text-sm mt-0.5">{profile.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
                Pharmacist
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-1">
            {[
              { label: 'Full Name',     value: profile.fullName },
              { label: 'Email',         value: profile.email },
              { label: 'Phone',         value: profile.phoneNumber ?? '—' },
              { label: 'Pharmacist ID', value: profile.pharmacistUniqueId ?? '—' },
              { label: 'Pharmacy',      value: profile.pharmacyName ?? '—' },
              { label: 'Branch',        value: profile.branchName ?? '—' },
              { label: 'Status',        value: profile.isActive ? 'Active' : 'Inactive', isStatus: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                <span className={`text-sm font-semibold ${
                  'isStatus' in row
                    ? profile.isActive ? 'text-emerald-600' : 'text-rose-600'
                    : 'text-slate-800'
                }`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              To update your profile details, please contact your pharmacy manager.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
