"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, GitBranch, MapPin, Mail, Phone, Users, Package2, Ban } from 'lucide-react';
import { getBranchDetails, suspendBranch, type BranchResponse } from '@/services/branchService';

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [branch, setBranch] = useState<BranchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suspending, setSuspending] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getBranchDetails(Number(id))
      .then(setBranch)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load branch'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSuspend = async () => {
    if (!window.confirm('Suspend this branch? Its operations will be halted.')) return;
    setSuspending(true);
    try {
      await suspendBranch(Number(id));
      setMsg('Branch suspended.');
      setBranch((b) => b ? { ...b, status: 'SUSPENDED' } : b);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to suspend');
    } finally { setSuspending(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">{error}</div>
  );

  if (!branch) return null;

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-between items-start gap-4">
        <div>
          <button onClick={() => router.push('/Pharmacy-admin/branches')}
            className="text-xs text-slate-400 hover:text-slate-600 mb-2 flex items-center gap-1">
            ← Back to Branches
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GitBranch size={22} className="text-teal-600" />
            {branch.name}
          </h1>
          <span className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            branch.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>{branch.status}</span>
        </div>
        {branch.status === 'ACTIVE' && (
          <button onClick={handleSuspend} disabled={suspending}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 transition">
            {suspending ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            Suspend Branch
          </button>
        )}
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">{msg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Branch Information</h2>
          <div className="space-y-3 text-sm">
            {[
              { icon: MapPin, label: 'Address', value: branch.address ?? '—' },
              { icon: Phone, label: 'Contact', value: branch.contactInfo ?? '—' },
              { icon: Mail, label: 'Pharmacy', value: branch.pharmacyName },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-slate-500 flex items-center gap-1.5"><Icon size={12} />{label}</span>
                <span className="font-semibold text-slate-700">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Manager</h2>
          {branch.managerName ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-700">{branch.managerName}</span>
              </div>
              {branch.managerEmail && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 flex items-center gap-1.5"><Mail size={12} />Email</span>
                  <span className="font-semibold text-slate-700">{branch.managerEmail}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No manager assigned yet.</p>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-1">
                <Users size={12} /> Pharmacists
              </div>
              <p className="text-2xl font-bold text-slate-800">{branch.pharmacistCount}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-1">
                <Package2 size={12} /> Inventory
              </div>
              <p className="text-2xl font-bold text-slate-800">{branch.inventoryItemCount}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
