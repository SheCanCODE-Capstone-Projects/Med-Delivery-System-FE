"use client";
import React, { useEffect, useState } from 'react';
import { CreditCard, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface InsuranceCardResponse {
  id: number;
  patientName?: string;
  providerName?: string;
  memberId?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  status: string;
  coveragePercentage?: number;
  createdAt: string;
}

async function getPendingCards(): Promise<InsuranceCardResponse[]> {
  const r = await apiClient<{ data: InsuranceCardResponse[] }>(
    '/api/pharmacist/dispensing/insurance-cards/pending'
  );
  return r.data;
}

async function verifyCard(id: number, coverage: number): Promise<InsuranceCardResponse> {
  const r = await apiClient<{ data: InsuranceCardResponse }>(
    `/api/pharmacist/dispensing/insurance-cards/${id}/verify?coveragePercentage=${coverage}`,
    { method: 'POST' }
  );
  return r.data;
}

async function rejectCard(id: number, notes: string): Promise<InsuranceCardResponse> {
  const r = await apiClient<{ data: InsuranceCardResponse }>(
    `/api/pharmacist/dispensing/insurance-cards/${id}/reject?notes=${encodeURIComponent(notes)}`,
    { method: 'POST' }
  );
  return r.data;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-100',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
  UNVERIFIED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function InsuranceVerificationPage() {
  const [cards, setCards] = useState<InsuranceCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [actioning, setActioning] = useState<number | null>(null);
  const [coverageInputs, setCoverageInputs] = useState<Record<number, string>>({});
  const [notesInputs, setNotesInputs] = useState<Record<number, string>>({});
  const [rejectOpen, setRejectOpen] = useState<number | null>(null);

  useEffect(() => {
    getPendingCards()
      .then(setCards)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load insurance cards'))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id: number) => {
    const coverage = parseFloat(coverageInputs[id] ?? '');
    if (isNaN(coverage) || coverage < 0 || coverage > 100) {
      setMsg('Please enter a valid coverage percentage (0–100).');
      return;
    }
    setActioning(id);
    try {
      const updated = await verifyCard(id, coverage);
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setMsg(`Card #${id} verified with ${coverage}% coverage.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Verification failed');
    } finally { setActioning(null); }
  };

  const handleReject = async (id: number) => {
    const notes = notesInputs[id] ?? '';
    setActioning(id);
    try {
      const updated = await rejectCard(id, notes);
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setRejectOpen(null);
      setMsg(`Card #${id} rejected.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Rejection failed');
    } finally { setActioning(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading insurance cards...</span>
    </div>
  );

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <CreditCard size={22} className="text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Insurance Verification</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Review and verify patient insurance cards.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">{error}</div>
      )}
      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">{msg}</div>
      )}

      {cards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-20 text-center text-slate-400">
          <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No insurance cards pending verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">{card.patientName ?? 'Unknown Patient'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {card.providerName} · Member ID: {card.memberId ?? '—'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[card.status] ?? ''}`}>
                  {card.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex gap-4 mb-4">
                {card.frontImageUrl && (
                  <a href={card.frontImageUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                    <ExternalLink size={12} /> Front Image
                  </a>
                )}
                {card.backImageUrl && (
                  <a href={card.backImageUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                    <ExternalLink size={12} /> Back Image
                  </a>
                )}
              </div>

              {card.status === 'PENDING_VERIFICATION' && (
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Coverage % *</label>
                    <input
                      type="number" min="0" max="100" step="0.1"
                      value={coverageInputs[card.id] ?? ''}
                      onChange={(e) => setCoverageInputs((prev) => ({ ...prev, [card.id]: e.target.value }))}
                      placeholder="e.g. 80"
                      className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button onClick={() => handleVerify(card.id)} disabled={actioning === card.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition">
                    {actioning === card.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Verify
                  </button>

                  {rejectOpen === card.id ? (
                    <div className="flex items-end gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Rejection notes</label>
                        <input
                          value={notesInputs[card.id] ?? ''}
                          onChange={(e) => setNotesInputs((prev) => ({ ...prev, [card.id]: e.target.value }))}
                          placeholder="Reason for rejection..."
                          className="w-52 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                      <button onClick={() => handleReject(card.id)} disabled={actioning === card.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 transition">
                        {actioning === card.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Confirm Reject
                      </button>
                      <button onClick={() => setRejectOpen(null)}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setRejectOpen(card.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-100 transition">
                      <XCircle size={14} /> Reject
                    </button>
                  )}
                </div>
              )}

              {card.status === 'VERIFIED' && card.coveragePercentage != null && (
                <p className="text-sm text-emerald-600 font-semibold">
                  Verified · Coverage: {card.coveragePercentage}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
