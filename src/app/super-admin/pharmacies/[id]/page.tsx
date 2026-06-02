"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Loader2,
  Mail,
  Phone,
  User,
  AlertTriangle,
  Ban,
  UserCog,
} from 'lucide-react';
import { getPharmacy } from '@/services/pharmacyApi';
import { approvePharmacy, suspendPharmacy, replacePharmacyManager } from '@/services/adminApi';
import type { PharmacyResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-600 border-amber-100',
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  SUSPENDED: 'bg-rose-50 text-rose-600 border-rose-100',
  REJECTED: 'bg-slate-50 text-slate-500 border-slate-200',
};

const isPending = (status: string) => status === 'PENDING_APPROVAL' || status === 'PENDING';

export default function PharmacyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<PharmacyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [replaceManagerLoading, setReplaceManagerLoading] = useState(false);
  const [replaceManagerMsg, setReplaceManagerMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    getPharmacy(Number(id))
      .then(setPharmacy)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pharmacy'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!pharmacy) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await approvePharmacy(pharmacy.id, { action: 'APPROVE' });
      setPharmacy((p) => p ? { ...p, status: 'ACTIVE' } : p);
      setActionMsg('Pharmacy approved successfully.');
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!pharmacy) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await approvePharmacy(pharmacy.id, { action: 'REJECT', reason: 'Does not meet requirements' });
      setPharmacy((p) => p ? { ...p, status: 'REJECTED' } : p);
      setActionMsg('Pharmacy rejected.');
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!pharmacy || !suspendReason.trim()) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await suspendPharmacy(pharmacy.id, suspendReason);
      setPharmacy((p) => p ? { ...p, status: 'SUSPENDED' } : p);
      setActionMsg('Pharmacy suspended.');
      setShowSuspendDialog(false);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplaceManager = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!pharmacy || !newManagerEmail.trim()) return;
    if (!window.confirm(`Replace pharmacy manager with ${newManagerEmail}?`)) return;
    setReplaceManagerLoading(true);
    setReplaceManagerMsg('');
    try {
      await replacePharmacyManager(pharmacy.id, { 
        newManagerEmail: newManagerEmail.trim(), 
        newManagerName: newManagerName.trim() 
      });
      setReplaceManagerMsg(`Manager updated to ${newManagerName.trim()}.`);
      setNewManagerEmail('');
      setNewManagerName('');
      setPharmacy((p) => p ? { ...p, managerEmail: newManagerEmail.trim(), managerName: newManagerName.trim() } : p);
    } catch (err) {
      setReplaceManagerMsg(err instanceof Error ? err.message : 'Failed to replace manager.');
    } finally {
      setReplaceManagerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading pharmacy details...</p>
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="text-center p-24">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">{error || 'Pharmacy Not Found'}</h2>
        <button onClick={() => router.push('/super-admin/pharmacies')} className="mt-4 text-teal-600 font-bold hover:underline">
          Back to Pharmacies
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium mb-4">
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border-2 border-teal-100 shadow-sm">
              <Building2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{pharmacy.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[pharmacy.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {pharmacy.status === 'PENDING_APPROVAL' ? 'PENDING' : pharmacy.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium">Pharmacy ID: #{pharmacy.id}</p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {isPending(pharmacy.status) && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold hover:bg-rose-100 transition disabled:opacity-50"
                >
                  <XCircle size={16} /> Reject
                </button>
              </>
            )}
            {pharmacy.status === 'ACTIVE' && (
              <button
                onClick={() => setShowSuspendDialog(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold hover:bg-amber-100 transition disabled:opacity-50"
              >
                <Ban size={16} /> Suspend
              </button>
            )}
          </div>
        </div>

        {actionMsg && (
          <p className="mt-4 px-4 py-3 rounded-xl border text-sm font-semibold bg-teal-50 border-teal-100 text-teal-700">
            {actionMsg}
          </p>
        )}
      </div>

      {/* Suspend Dialog */}
      {showSuspendDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" /> Suspend Pharmacy
            </h2>
            <p className="text-sm text-slate-500 mb-4">Provide a reason for suspending <strong>{pharmacy.name}</strong>.</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSuspend}
                disabled={actionLoading || !suspendReason.trim()}
                className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 disabled:opacity-50"
              >
                {actionLoading ? 'Suspending...' : 'Confirm Suspend'}
              </button>
              <button
                onClick={() => setShowSuspendDialog(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-800">
              Registration Information
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <InfoRow icon={ShieldCheck} label="Licence Number" value={pharmacy.licenseNumber ?? '—'} />
                <InfoRow icon={User} label="Manager" value={pharmacy.managerName ?? '—'} />
                <InfoRow icon={Mail} label="Manager Email" value={pharmacy.managerEmail ?? '—'} />
              </div>
              <div className="space-y-5">
                <InfoRow icon={MapPin} label="Address" value={pharmacy.address ?? '—'} />
                <InfoRow icon={Phone} label="Contact" value={pharmacy.contactInfo ?? '—'} />
                <InfoRow
                  icon={Calendar}
                  label="Registered"
                  value={pharmacy.createdAt ? new Date(pharmacy.createdAt).toLocaleDateString() : '—'}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 text-sm font-bold text-slate-800">Contact Details</div>
            <div className="p-6 space-y-4">
              <InfoRow icon={Phone} label="Contact" value={pharmacy.contactInfo ?? '—'} />
              <InfoRow icon={MapPin} label="Address" value={pharmacy.address ?? '—'} />
            </div>
          </div>

          <div className="p-6 bg-teal-600 rounded-2xl shadow-lg shadow-teal-600/20 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-1">Status</h4>
              <p className="text-xs text-white/70 mb-3">Current pharmacy status on the platform</p>
              <p className="text-2xl font-black">{pharmacy.status === 'PENDING_APPROVAL' ? 'PENDING' : pharmacy.status}</p>
            </div>
            <div className="absolute -bottom-6 -right-6 opacity-20">
              <Building2 size={120} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <UserCog size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Replace Manager</p>
                <p className="text-xs text-slate-500">Assign a new pharmacy manager</p>
              </div>
            </div>
            <div className="p-5">
              {replaceManagerMsg && (
                <p className={`mb-3 text-xs font-semibold px-3 py-2 rounded-lg ${replaceManagerMsg.startsWith('Failed') || replaceManagerMsg.startsWith('Error') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {replaceManagerMsg}
                </p>
              )}
              <form onSubmit={handleReplaceManager} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  placeholder="New Manager Full Name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
                <input
                  type="email"
                  required
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                  placeholder="new.manager@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="submit"
                  disabled={replaceManagerLoading || !newManagerEmail.trim()}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {replaceManagerLoading && <Loader2 size={14} className="animate-spin" />}
                  Replace Manager
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="font-semibold text-slate-700 text-sm">{value}</p>
      </div>
    </div>
  );
}
