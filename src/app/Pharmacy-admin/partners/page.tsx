"use client";
import React, { useState } from 'react';
import { Handshake, Search, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { getInsuranceCard, verifyInsurance, markInsurancePending } from '@/services/pharmacyApi';
import { getPharmacyId } from '@/services/authApi';
import type { InsuranceCardResponse } from '@/types/api';

const STATUS_COLOR: Record<string, string> = {
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
  UNVERIFIED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function InsurancePage() {
  const [cardId, setCardId] = useState('');
  const [card, setCard] = useState<InsuranceCardResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const pharmacyId = getPharmacyId();

  const handleLookup = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const id = Number(cardId.trim());
    if (!id) return;
    setLookupLoading(true);
    setLookupError('');
    setCard(null);
    setActionMsg('');
    try {
      const data = await getInsuranceCard(id);
      setCard(data);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Card not found');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleVerify = async (approved: boolean) => {
    if (!card || !pharmacyId) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await verifyInsurance(card.id, pharmacyId, approved, notes || undefined);
      setActionMsg(approved ? 'Insurance card approved successfully.' : 'Insurance card rejected.');
      setCard((prev) => prev ? { ...prev, status: approved ? 'VERIFIED' : 'REJECTED', verified: approved } : null);
      setNotes('');
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPending = async () => {
    if (!card) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await markInsurancePending(card.id);
      setActionMsg('Card moved back to pending review.');
      setCard((prev) => prev ? { ...prev, status: 'PENDING', verified: false } : null);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Insurance Verification</h1>
        <p className="text-slate-500 mt-1">Look up a patient's insurance card by ID and verify coverage.</p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="number"
            min={1}
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            placeholder="Enter insurance card ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={!cardId.trim() || lookupLoading}
          className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          {lookupLoading && <Loader2 size={14} className="animate-spin" />}
          Look Up
        </button>
      </form>

      {lookupError && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex gap-2">
          <AlertCircle size={16} /> {lookupError}
        </div>
      )}

      {actionMsg && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 text-sm font-semibold">
          {actionMsg}
        </div>
      )}

      {card && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Handshake size={20} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{card.providerName}</h2>
                  <p className="text-xs text-slate-500">Member ID: <span className="font-semibold text-slate-700">{card.memberId}</span></p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLOR[card.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {card.status}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Card ID', value: `#${card.id}` },
              { label: 'Coverage', value: card.coveragePercentage != null ? `${card.coveragePercentage}%` : '—' },
              { label: 'Verified', value: card.verified ? 'Yes' : 'No' },
              { label: 'Added', value: card.createdAt ? new Date(card.createdAt).toLocaleDateString() : '—' },
            ].map((row) => (
              <div key={row.label}>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-0.5">{row.label}</span>
                <span className="font-semibold text-slate-700">{row.value}</span>
              </div>
            ))}
          </div>

          {card.frontImageUrl && (
            <div className="px-6 pb-4 flex gap-3">
              <div className="rounded-lg overflow-hidden border border-slate-200 w-40">
                <img src={card.frontImageUrl} alt="Front" className="w-full object-cover" />
                <p className="text-center text-[10px] text-slate-500 py-1 bg-slate-50">Front</p>
              </div>
              {card.backImageUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-200 w-40">
                  <img src={card.backImageUrl} alt="Back" className="w-full object-cover" />
                  <p className="text-center text-[10px] text-slate-500 py-1 bg-slate-50">Back</p>
                </div>
              )}
            </div>
          )}

          {card.status !== 'VERIFIED' && card.status !== 'REJECTED' && (
            <div className="p-6 border-t border-slate-100 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add verification notes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify(true)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(false)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 disabled:opacity-50 transition"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              </div>
            </div>
          )}

          {(card.status === 'VERIFIED' || card.status === 'REJECTED') && (
            <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">
                This card has been {card.status.toLowerCase()}.
              </span>
              <button
                onClick={handleMarkPending}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 disabled:opacity-50 transition"
              >
                {actionLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                Mark as Pending
              </button>
            </div>
          )}
        </div>
      )}

      {!card && !lookupLoading && !lookupError && (
        <div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <Handshake size={36} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Enter a card ID above to begin verification.</p>
        </div>
      )}
    </div>
  );
}
