"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, GitBranch, MapPin, Phone, Mail } from 'lucide-react';
import { getMyBranch, type BranchResponse } from '@/services/branchService';
import { getUserName } from '@/services/authApi';

export default function BranchManagerProfilePage() {
  const [branch, setBranch] = useState<BranchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userName = typeof window !== 'undefined' ? getUserName() : null;

  useEffect(() => {
    getMyBranch()
      .then(setBranch)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 mt-1">Your account and branch information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Mail size={16} className="text-teal-600" /> Account
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-700">{userName ?? '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Role</span>
              <span className="font-semibold text-teal-700">Branch Manager</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <GitBranch size={16} className="text-teal-600" /> Branch Details
          </h2>
          {error ? (
            <p className="text-rose-600 text-sm">{error}</p>
          ) : branch ? (
            <div className="space-y-3 text-sm">
              {[
                { icon: GitBranch, label: 'Branch', value: branch.name },
                { icon: MapPin, label: 'Address', value: branch.address ?? '—' },
                { icon: Phone, label: 'Contact', value: branch.contactInfo ?? '—' },
                { icon: Mail, label: 'Pharmacy', value: branch.pharmacyName },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500 flex items-center gap-1.5"><Icon size={12} />{label}</span>
                  <span className="font-semibold text-slate-700 text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  branch.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>{branch.status}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
