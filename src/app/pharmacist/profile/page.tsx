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
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                <span className="text-sm font-semibold text-slate-800">{row.value}</span>
              </div>
            ))}
            {/* Status row — 4-state */}
            {(() => {
              const st = getStatus(profile.isActive, profile.isVerified);
              return (
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500 font-medium">Status</span>
                  <span className={`text-sm font-semibold ${st.color}`}>{st.label}</span>
                </div>
              );
            })()}
          </div>

          <div className="px-6 pb-6 space-y-3">
            {/* Hint when not fully active */}
            {!(profile.isActive && profile.isVerified) && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                {STATUS_HINT[getStatus(profile.isActive, profile.isVerified).label]}
              </p>
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
