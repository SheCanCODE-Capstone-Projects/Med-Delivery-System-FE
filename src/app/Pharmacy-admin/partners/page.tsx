"use client";
import React, { useEffect, useState } from 'react';
import {
  Handshake, Search, Loader2, AlertCircle, CheckCircle2, XCircle,
  Plus, Trash2, ShieldCheck, X,
} from 'lucide-react';
import {
  getInsuranceCard, verifyInsurance, markInsurancePending,
  getPharmacyInsuranceProviders, addPharmacyInsuranceProvider,
  removePharmacyInsuranceProvider, getMyPharmacy, getInsuranceProviders,
} from '@/services/pharmacyApi';
import type { InsuranceCardResponse, InsuranceProvider } from '@/types/api';

const STATUS_COLOR: Record<string, string> = {
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
  UNVERIFIED: 'bg-slate-100 text-slate-600 border-slate-200',
};

type Tab = 'providers' | 'verify';

export default function InsurancePage() {
  const [tab, setTab] = useState<Tab>('providers');
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);

  // ── Providers state ────────────────────────────────────────────────────────
  const [myProviders, setMyProviders] = useState<InsuranceProvider[]>([]);
  const [allProviders, setAllProviders] = useState<InsuranceProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState('');
  const [providerMsg, setProviderMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // ── Insurance card verification state ─────────────────────────────────────
  const [cardId, setCardId] = useState('');
  const [card, setCard] = useState<InsuranceCardResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    getMyPharmacy()
      .then(async (pharmacy) => {
        setPharmacyId(pharmacy.id);
        const [all, my] = await Promise.all([
          getInsuranceProviders().catch(() => []),
          getPharmacyInsuranceProviders(pharmacy.id).catch(() => []),
        ]);
        setAllProviders(all);
        setMyProviders(my);
      })
      .catch((err) => setProvidersError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setProvidersLoading(false));
  }, []);

  const handleAddProvider = async (provider: InsuranceProvider) => {
    if (!pharmacyId) return;
    setAddingId(provider.id);
    setProviderMsg('');
    try {
      await addPharmacyInsuranceProvider(pharmacyId, provider.id);
      setMyProviders((prev) => [...prev, provider]);
      setProviderMsg(`${provider.name} added to your providers.`);
    } catch (err) {
      setProviderMsg(err instanceof Error ? err.message : 'Failed to add provider');
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveProvider = async (provider: InsuranceProvider) => {
    if (!pharmacyId || !window.confirm(`Remove ${provider.name} from your insurance providers?`)) return;
    setRemovingId(provider.id);
    setProviderMsg('');
    try {
      await removePharmacyInsuranceProvider(pharmacyId, provider.id);
      setMyProviders((prev) => prev.filter((p) => p.id !== provider.id));
      setProviderMsg(`${provider.name} removed.`);
    } catch (err) {
      setProviderMsg(err instanceof Error ? err.message : 'Failed to remove provider');
    } finally {
      setRemovingId(null);
    }
  };

  const availableToAdd = allProviders.filter(
    (p) => !myProviders.some((mp) => mp.id === p.id)
  );

  // ── Verification handlers ──────────────────────────────────────────────────
  const handleLookup = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const id = Number(cardId.trim());
    if (!id) return;
    setLookupLoading(true);
    setLookupError('');
    setCard(null);
    setActionMsg('');
    try {
      setCard(await getInsuranceCard(id));
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
      setActionMsg(approved ? 'Insurance card approved.' : 'Insurance card rejected.');
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
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Insurance</h1>
        <p className="text-slate-500 mt-1">Manage your insurance partners and verify patient cards.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {(['providers', 'verify'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === t ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'providers' ? '🏥 My Providers' : '🔍 Verify Card'}
          </button>
        ))}
      </div>

      {/* ── PROVIDERS TAB ─────────────────────────────────────────────────── */}
      {tab === 'providers' && (
        <div className="space-y-5">
          {providerMsg && (
            <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${
              providerMsg.includes('Failed') || providerMsg.includes('error')
                ? 'bg-rose-50 border-rose-100 text-rose-700'
                : 'bg-teal-50 border-teal-100 text-teal-700'
            }`}>{providerMsg}</div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Insurance Providers</p>
                  <p className="text-xs text-slate-500">Providers your pharmacy accepts</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={availableToAdd.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 disabled:opacity-40 transition"
              >
                <Plus size={14} /> Add Provider
              </button>
            </div>

            {providersLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 className="animate-spin" size={20} /><span>Loading...</span>
              </div>
            ) : providersError ? (
              <div className="p-5 text-rose-600 text-sm flex gap-2"><AlertCircle size={16} />{providersError}</div>
            ) : myProviders.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Handshake size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium text-sm">No insurance providers added yet.</p>
                <p className="text-xs mt-1">Click &ldquo;Add Provider&rdquo; to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myProviders.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        {p.code?.slice(0, 2) ?? 'IN'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {p.coveragePercentage != null && (
                        <span className="text-sm font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">
                          {p.coveragePercentage}% coverage
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveProvider(p)}
                        disabled={removingId === p.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 disabled:opacity-50 transition"
                      >
                        {removingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Insurance Provider</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {availableToAdd.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">All available providers are already added.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {availableToAdd.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.code} · {p.coveragePercentage ?? '—'}% coverage</p>
                    </div>
                    <button
                      onClick={async () => { await handleAddProvider(p); setShowAddModal(false); }}
                      disabled={addingId === p.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition"
                    >
                      {addingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VERIFY CARD TAB ───────────────────────────────────────────────── */}
      {tab === 'verify' && (
        <div className="max-w-2xl">
          <form onSubmit={handleLookup} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="number" min={1} value={cardId} onChange={(e) => setCardId(e.target.value)}
                placeholder="Enter insurance card ID..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
            </div>
            <button type="submit" disabled={!cardId.trim() || lookupLoading}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition flex items-center gap-2">
              {lookupLoading && <Loader2 size={14} className="animate-spin" />} Look Up
            </button>
          </form>

          {lookupError && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex gap-2">
              <AlertCircle size={16} />{lookupError}
            </div>
          )}
          {actionMsg && (
            <div className="mb-4 p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 text-sm font-semibold">{actionMsg}</div>
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
              {card.status !== 'VERIFIED' && card.status !== 'REJECTED' && (
                <div className="p-6 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes (optional)</label>
                    <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add verification notes..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleVerify(true)} disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition">
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
                    </button>
                    <button onClick={() => handleVerify(false)} disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 disabled:opacity-50 transition">
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                    </button>
                  </div>
                </div>
              )}
              {(card.status === 'VERIFIED' || card.status === 'REJECTED') && (
                <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">This card has been {card.status.toLowerCase()}.</span>
                  <button onClick={handleMarkPending} disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 disabled:opacity-50 transition">
                    {actionLoading && <Loader2 size={12} className="animate-spin" />} Mark as Pending
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
      )}
    </>
  );
}
