"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Loader2, AlertCircle, Search, Filter,
  CheckCircle2, XCircle, Ban, AlertTriangle, X, Mail, Clock, RefreshCw,
} from 'lucide-react';
import { getAllPharmacies } from '@/services/pharmacyApi';
import { approvePharmacy, suspendPharmacy } from '@/services/adminApi';
import {
  invitePharmacyAdmin,
  getPendingPharmacyAdminInvitations,
  type PendingPharmacyAdminInvitation,
} from '@/services/invitationService';
import type { PharmacyResponse } from '@/types/api';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'REJECTED'];

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-600 border-amber-100',
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  SUSPENDED: 'bg-rose-50 text-rose-600 border-rose-100',
  REJECTED: 'bg-slate-50 text-slate-500 border-slate-200',
};

function SuspendModal({
  pharmacy,
  onConfirm,
  onClose,
  loading,
}: {
  pharmacy: PharmacyResponse;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Suspend Pharmacy
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Provide a reason for suspending <strong className="text-slate-700">{pharmacy.name}</strong>.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for suspension..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirm Suspend
          </button>
        </div>
      </div>
    </div>
  );
}

const isPending = (status: string) => status === 'PENDING_APPROVAL' || status === 'PENDING';

export default function SuperAdminPharmaciesPage() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<PharmacyResponse[]>([]);
  const [filtered, setFiltered] = useState<PharmacyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actioning, setActioning] = useState<number | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<PharmacyResponse | null>(null);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [pendingInvites, setPendingInvites] = useState<PendingPharmacyAdminInvitation[]>([]);
  const [resending, setResending] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getAllPharmacies().catch(() => [] as PharmacyResponse[]),
      getPendingPharmacyAdminInvitations().catch(() => [] as PendingPharmacyAdminInvitation[]),
    ])
      .then(([data, pending]) => { setPharmacies(data); setFiltered(data); setPendingInvites(pending); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pharmacies'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: number, approved: boolean) => {
    setActioning(id);
    try {
      await approvePharmacy(id, { action: approved ? 'APPROVE' : 'REJECT' });
      setPharmacies((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: approved ? 'ACTIVE' : 'REJECTED' } : p)
      );
    } catch {
      // user can retry from detail page
    } finally {
      setActioning(null);
    }
  };

  const handleSuspend = async (reason: string) => {
    if (!suspendTarget) return;
    setSuspendLoading(true);
    try {
      await suspendPharmacy(suspendTarget.id, reason);
      setPharmacies((prev) =>
        prev.map((p) => p.id === suspendTarget.id ? { ...p, status: 'SUSPENDED' } : p)
      );
      setSuspendTarget(null);
    } catch {
      // user can retry from detail page
    } finally {
      setSuspendLoading(false);
    }
  };

  useEffect(() => {
    let list = pharmacies;
    if (statusFilter !== 'ALL') list = list.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.contactInfo?.toLowerCase().includes(q) ||
          p.licenseNumber?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, statusFilter, pharmacies]);

  const pendingCount = pharmacies.filter((p) => p.status === 'PENDING_APPROVAL' || p.status === 'PENDING').length;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true); setInviteError('');
    try {
      await invitePharmacyAdmin(inviteEmail);
      setInviteMsg(`Invitation sent to ${inviteEmail}.`);
      setPendingInvites((prev) => prev.filter((p) => p.email !== inviteEmail));
      setShowInvite(false);
      setInviteEmail('');
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally { setInviting(false); }
  };

  const handleResend = async (inv: PendingPharmacyAdminInvitation) => {
    if (!window.confirm(`Resend pharmacy admin invitation to ${inv.email}?\n\nThis will send a new 48-hour setup link.`)) return;
    setResending(inv.email);
    try {
      await invitePharmacyAdmin(inv.email);
      setInviteMsg(`New invitation sent to ${inv.email}.`);
      setPendingInvites((prev) =>
        prev.map((p) =>
          p.email === inv.email
            ? { ...p, expired: false, sentAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString() }
            : p
        )
      );
    } catch (err) {
      setInviteMsg(err instanceof Error ? err.message : 'Failed to resend invitation');
    } finally {
      setResending(null);
    }
  };

  return (
    <>
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Invite Pharmacy Admin</h2>
              <button onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              They will receive an email with a link to register their pharmacy.
            </p>
            {inviteError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm">{inviteError}</div>
            )}
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email *</label>
                <input required type="email" value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="admin@pharmacy.rw" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={inviting}
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {inviting && <Loader2 size={14} className="animate-spin" />}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-4 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Pharmacies</h1>
          <p className="text-slate-500 mt-1">View, approve, reject, or suspend all registered pharmacies.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowInvite(true); setInviteError(''); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition">
            <Mail size={14} /> Invite Pharmacy Admin
          </button>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => setStatusFilter('PENDING')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold hover:bg-amber-100 transition"
          >
            <AlertTriangle size={15} />
            {pendingCount} pending approval
          </button>
        )}
      </div>

      {inviteMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">{inviteMsg}</div>
      )}

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Clock size={15} className="text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800">Pending Pharmacy Admin Invitations</h2>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              {pendingInvites.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingInvites.map((inv) => (
              <div key={inv.email} className="flex items-center gap-4 px-6 py-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${inv.expired ? 'bg-rose-50' : 'bg-amber-50'}`}>
                  {inv.expired
                    ? <AlertTriangle size={15} className="text-rose-500" />
                    : <Clock size={15} className="text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{inv.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sent {new Date(inv.sentAt).toLocaleDateString()} · Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${inv.expired ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {inv.expired ? 'Expired' : 'Pending'}
                </span>
                <button
                  onClick={() => handleResend(inv)}
                  disabled={resending === inv.email}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-600 border border-teal-100 rounded-lg hover:bg-teal-100 transition disabled:opacity-50"
                >
                  {resending === inv.email
                    ? <Loader2 size={12} className="animate-spin" />
                    : <RefreshCw size={12} />}
                  Resend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by name, email, licence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-72"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          <Filter size={14} className="text-slate-400 ml-2" />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                statusFilter === s ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading pharmacies...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-xl border border-slate-200 shadow-sm gap-3 text-rose-600">
          <AlertCircle size={32} />
          <p className="font-semibold">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-teal-600 underline">Retry</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h2 className="font-bold text-slate-800">Pharmacy Directory</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filtered.length} / {pharmacies.length} pharmacies
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Pharmacy</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((pharmacy) => (
                    <tr key={pharmacy.id} className={`hover:bg-slate-50/80 transition ${isPending(pharmacy.status) ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{pharmacy.name}</div>
                        <div className="text-xs text-slate-400">{pharmacy.licenseNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{pharmacy.managerName ?? '—'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{pharmacy.contactInfo ?? '—'}</div>
                        <div className="text-xs text-slate-400">{pharmacy.address ?? ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {pharmacy.createdAt ? new Date(pharmacy.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[pharmacy.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {pharmacy.status === 'PENDING_APPROVAL' ? 'PENDING' : pharmacy.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {isPending(pharmacy.status) && (
                            <>
                              <button
                                onClick={() => handleApprove(pharmacy.id, true)}
                                disabled={actioning === pharmacy.id}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-50"
                              >
                                {actioning === pharmacy.id
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : <CheckCircle2 size={12} />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleApprove(pharmacy.id, false)}
                                disabled={actioning === pharmacy.id}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition disabled:opacity-50"
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                          {pharmacy.status === 'ACTIVE' && (
                            <button
                              onClick={() => setSuspendTarget(pharmacy)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
                            >
                              <Ban size={12} /> Suspend
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/super-admin/pharmacies/${pharmacy.id}`)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-teal-600 border border-teal-100 bg-teal-50 hover:bg-teal-100 transition"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Building2 size={32} className="opacity-40" />
                        <p className="font-medium">No pharmacies found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {suspendTarget && (
        <SuspendModal
          pharmacy={suspendTarget}
          onConfirm={handleSuspend}
          onClose={() => setSuspendTarget(null)}
          loading={suspendLoading}
        />
      )}
    </>
  );
}
