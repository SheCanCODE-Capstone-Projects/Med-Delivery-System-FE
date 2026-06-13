"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, UserRound } from 'lucide-react';
import { getMyProfile } from '@/services/pharmacistApi';
import type { PharmacistResponse } from '@/types/api';

function getStatus(isActive: boolean, isVerified: boolean) {
  if (isActive && isVerified)  return { label: 'Active',               color: 'text-emerald-600' };
  if (isActive && !isVerified) return { label: 'Pending Verification',  color: 'text-amber-600'   };
  if (!isActive && isVerified) return { label: 'Deactivated',           color: 'text-rose-600'    };
                               return { label: 'Setup Needed',          color: 'text-amber-600'   };
}

const STATUS_HINT: Record<string, string> = {
  'Setup Needed':         'Your account setup is incomplete. Ask your branch manager to resend your setup link.',
  'Pending Verification': 'Your setup is complete. Waiting for your branch manager to activate your account.',
  'Deactivated':          'Your account has been deactivated. Contact your branch manager.',
};

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

  const st = profile ? getStatus(profile.isActive, profile.isVerified) : null;
  const statusBadge: Record<string, string> = {
    'Active':               'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Pending Verification': 'bg-amber-50 text-amber-700 border-amber-200',
    'Deactivated':          'bg-rose-50 text-rose-700 border-rose-200',
    'Setup Needed':         'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">Your pharmacist account details.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[240px] gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm">Loading profile…</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 text-rose-700 text-sm font-medium">
          {error}
        </div>
      ) : !profile ? (
        <div className="text-center py-16 text-slate-400">
          <UserRound size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Profile not found.</p>
          <p className="text-xs mt-1">Please contact your pharmacy manager.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Avatar / Banner */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-500 px-6 py-8 flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/30 shrink-0 shadow-lg">
              <UserRound className="h-10 w-10 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-xl leading-tight truncate">{profile.fullName}</p>
              <p className="text-teal-100 text-sm mt-0.5 truncate">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold border border-white/20">
                  Pharmacist
                </span>
                {st && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge[st.label]}`}>
                    {st.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="divide-y divide-slate-50">
            {[
              { label: 'Full Name',     value: profile.fullName },
              { label: 'Email',         value: profile.email },
              { label: 'Phone',         value: profile.phoneNumber ?? '—' },
              { label: 'Pharmacist ID', value: profile.pharmacistUniqueId ?? '—' },
              { label: 'Pharmacy',      value: profile.pharmacyName ?? '—' },
              { label: 'Branch',        value: profile.branchName ?? '—' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{row.label}</span>
                <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%] truncate">{row.value}</span>
              </div>
            ))}
            {st && (
              <div className="flex items-center justify-between px-6 py-3.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge[st.label]}`}>
                  {st.label}
                </span>
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="px-6 pb-6 pt-4 space-y-3">
            {st && !(profile.isActive && profile.isVerified) && (
              <div className="flex gap-3 bg-amber-50 border-l-4 border-amber-400 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  {STATUS_HINT[st.label]}
                </p>
              </div>
            )}
            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              To update your profile details, please contact your pharmacy manager.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
