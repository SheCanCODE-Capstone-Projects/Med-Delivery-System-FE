"use client";
import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Store, CheckCircle2, XCircle, Clock, AlertCircle,
  Building2, Phone, MapPin, User, Mail, Loader2,
  RefreshCw,
} from 'lucide-react';
import { getAllPharmaciesAdmin, approvePharmacy } from '@/services/adminApi';
import type { PharmacyResponse } from '@/types/api';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING_APPROVAL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Rejected', value: 'REJECTED' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    ACTIVE: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 size={12} /> },
    PENDING_APPROVAL: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock size={12} /> },
    SUSPENDED: { label: 'Suspended', cls: 'bg-orange-50 text-orange-700 border-orange-100', icon: <AlertCircle size={12} /> },
    REJECTED: { label: 'Rejected', cls: 'bg-rose-50 text-rose-700 border-rose-100', icon: <XCircle size={12} /> },
  };
  const s = map[status] ?? { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

export default function AdminPharmacyPage() {
  const [pharmacies, setPharmacies] = useState<PharmacyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: number; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllPharmaciesAdmin(activeTab || undefined);
      setPharmacies(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Approve this pharmacy? This will activate their account and notify the manager.')) return;
    setActionId(id);
    setError('');
    setSuccessMsg('');
    try {
      await approvePharmacy(id, { action: 'APPROVE' });
      setSuccessMsg('Pharmacy approved successfully. Manager will receive an activation email.');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to approve pharmacy');
    } finally {
      setActionId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setActionId(rejectModal.id);
    setError('');
    setSuccessMsg('');
    try {
      await approvePharmacy(rejectModal.id, { action: 'REJECT', reason: rejectReason || undefined });
      setSuccessMsg('Pharmacy rejected.');
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reject pharmacy');
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = pharmacies.filter(p => p.status === 'PENDING_APPROVAL').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pharmacy Management</h1>
            <p className="text-slate-500 mt-1">
              Review, approve, and manage pharmacy accounts.
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  {pendingCount} pending approval
                </span>
              )}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pharmacy Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading pharmacies...</span>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
            <Store size={36} className="text-slate-300" />
            <p className="font-medium">No pharmacies found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pharmacies.map(ph => (
              <div
                key={ph.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  ph.status === 'PENDING_APPROVAL'
                    ? 'border-amber-200 ring-1 ring-amber-100'
                    : 'border-slate-200'
                }`}
              >
                {ph.status === 'PENDING_APPROVAL' && (
                  <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-2">
                    <Clock size={13} /> Awaiting admin approval — orders will not be assigned until approved
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <Building2 size={22} className="text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-800 truncate">{ph.name}</h3>
                          <StatusBadge status={ph.status} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Code: {ph.pharmacyCode ?? '—'} &bull; License: {ph.licenseNumber}</p>
                        <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-slate-600">
                          {ph.managerName && (
                            <span className="flex items-center gap-1.5">
                              <User size={13} className="text-slate-400 shrink-0" />
                              {ph.managerName}
                            </span>
                          )}
                          {ph.managerEmail && (
                            <span className="flex items-center gap-1.5">
                              <Mail size={13} className="text-slate-400 shrink-0" />
                              {ph.managerEmail}
                            </span>
                          )}
                          {ph.contactInfo && (
                            <span className="flex items-center gap-1.5">
                              <Phone size={13} className="text-slate-400 shrink-0" />
                              {ph.contactInfo}
                            </span>
                          )}
                          {ph.address && (
                            <span className="flex items-center gap-1.5 col-span-2">
                              <MapPin size={13} className="text-slate-400 shrink-0" />
                              {ph.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {ph.status === 'PENDING_APPROVAL' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(ph.id)}
                          disabled={actionId === ph.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                          {actionId === ph.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: ph.id, name: ph.name })}
                          disabled={actionId === ph.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 disabled:opacity-50 transition"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                    {ph.status === 'ACTIVE' && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
                        <CheckCircle2 size={14} /> Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <XCircle size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Reject Pharmacy</h3>
                <p className="text-xs text-slate-500">{rejectModal.name}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Reason (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="License invalid, incomplete documents, etc."
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionId === rejectModal.id}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {actionId === rejectModal.id ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
