"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  ExternalLink,
  Loader2,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
  X,
} from "lucide-react";
import {
  getAllAdminInsuranceCards,
  verifyInsuranceCard,
  rejectInsuranceCard,
} from "@/services/adminApi";
import type { InsuranceCardResponse } from "@/types/api";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING_VERIFICATION" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

function statusBadge(status: string) {
  switch (status) {
    case "VERIFIED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold">
          <ShieldCheck size={11} /> Verified
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold">
          <ShieldOff size={11} /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold">
          <ShieldQuestion size={11} /> Pending
        </span>
      );
  }
}

function VerifyModal({
  card,
  onConfirm,
  onClose,
  saving,
  error,
}: {
  card: InsuranceCardResponse;
  onConfirm: (pct: number) => void;
  onClose: () => void;
  saving: boolean;
  error: string;
}) {
  const [pct, setPct] = useState(
    card.coveragePercentage != null ? String(card.coveragePercentage) : "80"
  );
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(pct);
    if (!pct.trim() || isNaN(n) || n < 0 || n > 100) {
      setFieldError("Enter a value between 0 and 100.");
      return;
    }
    setFieldError("");
    onConfirm(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Verify Insurance Card</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition p-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-slate-600 mb-1">
            Patient: <span className="font-semibold text-slate-800">{card.patientName ?? "—"}</span>
          </p>
          <p className="text-sm text-slate-600 mb-4">
            Provider: <span className="font-semibold text-slate-800">{card.providerName}</span>
            {" "}· Member <span className="font-semibold text-slate-800">{card.memberId}</span>
          </p>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Coverage percentage <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={pct}
                  onChange={(e) => { setPct(e.target.value); setFieldError(""); }}
                  className={`h-10 w-full rounded-lg border px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${fieldError ? "border-rose-400" : "border-slate-200"}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
              </div>
              {fieldError && <p className="text-xs text-rose-600">{fieldError}</p>}
            </div>
            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <AlertCircle size={13} /> {error}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-10 rounded-lg bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Verify
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  card,
  onConfirm,
  onClose,
  saving,
  error,
}: {
  card: InsuranceCardResponse;
  onConfirm: (notes: string) => void;
  onClose: () => void;
  saving: boolean;
  error: string;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Reject Insurance Card</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition p-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 grid gap-4">
          <p className="text-sm text-slate-600">
            Rejecting card for{" "}
            <span className="font-semibold text-slate-800">{card.patientName ?? "—"}</span>
            {" "}({card.providerName} · {card.memberId}).
          </p>
          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Reason <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Card image unreadable, expired membership…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <AlertCircle size={13} /> {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(notes)}
              disabled={saving}
              className="flex-1 h-10 rounded-lg bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <ShieldOff size={15} />}
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function InsuranceCardsPage() {
  const [cards, setCards] = useState<InsuranceCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(0);

  const [verifyTarget, setVerifyTarget] = useState<InsuranceCardResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<InsuranceCardResponse | null>(null);
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = async (status: string) => {
    setLoading(true);
    setError("");
    try {
      setCards(await getAllAdminInsuranceCards(status || undefined));
    } catch {
      setError("Failed to load insurance cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeTab); setPage(0); }, [activeTab]);

  const handleVerify = async (pct: number) => {
    if (!verifyTarget) return;
    setActionSaving(true);
    setActionError("");
    try {
      const updated = await verifyInsuranceCard(verifyTarget.id, pct);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setVerifyTarget(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to verify.");
    } finally {
      setActionSaving(false);
    }
  };

  const handleReject = async (notes: string) => {
    if (!rejectTarget) return;
    setActionSaving(true);
    setActionError("");
    try {
      const updated = await rejectInsuranceCard(rejectTarget.id, notes || undefined);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setRejectTarget(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject.");
    } finally {
      setActionSaving(false);
    }
  };

  const pendingCount = cards.filter((c) => c.status === "PENDING_VERIFICATION").length;
  const paginated = cards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(cards.length / PAGE_SIZE);

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Insurance Cards</h1>
          <p className="text-slate-500 mt-1">
            Review and verify patient insurance cards before they can be used in prescription orders.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold">
            {pendingCount} pending review
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === tab.value
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading…</span>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <ShieldQuestion size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-slate-600">No insurance cards found</p>
            <p className="text-sm mt-1">
              {activeTab ? "No cards with this status." : "Patients haven't submitted insurance cards yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Provider · Member ID</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Coverage</th>
                  <th className="px-5 py-4">Images</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((card) => (
                  <tr
                    key={card.id}
                    className={`text-sm transition ${
                      card.status === "PENDING_VERIFICATION"
                        ? "bg-amber-50/30 hover:bg-amber-50/60"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{card.patientName ?? "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{card.providerName}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-slate-600 font-mono text-xs">{card.memberId}</span>
                    </td>
                    <td className="px-5 py-4">{statusBadge(card.status)}</td>
                    <td className="px-5 py-4">
                      {card.coveragePercentage != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${card.coveragePercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-teal-700">{card.coveragePercentage}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {card.frontImageUrl && (
                          <a
                            href={card.frontImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 transition"
                          >
                            Front <ExternalLink size={11} />
                          </a>
                        )}
                        {card.backImageUrl && (
                          <a
                            href={card.backImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 transition"
                          >
                            Back <ExternalLink size={11} />
                          </a>
                        )}
                        {!card.frontImageUrl && !card.backImageUrl && (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {card.status === "PENDING_VERIFICATION" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setActionError(""); setVerifyTarget(card); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            <ShieldCheck size={13} /> Verify
                          </button>
                          <button
                            onClick={() => { setActionError(""); setRejectTarget(card); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                          >
                            <ShieldOff size={13} /> Reject
                          </button>
                        </div>
                      ) : card.status === "VERIFIED" ? (
                        <button
                          onClick={() => { setActionError(""); setRejectTarget(card); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:border-rose-200 hover:text-rose-600 transition"
                        >
                          <ShieldOff size={13} /> Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => { setActionError(""); setVerifyTarget(card); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:border-emerald-200 hover:text-emerald-700 transition"
                        >
                          <ShieldCheck size={13} /> Re-verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500">
          <span>
            Showing {cards.length === 0 ? 0 : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, cards.length)} of {cards.length} card{cards.length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {verifyTarget && (
        <VerifyModal
          card={verifyTarget}
          onConfirm={handleVerify}
          onClose={() => setVerifyTarget(null)}
          saving={actionSaving}
          error={actionError}
        />
      )}

      {rejectTarget && (
        <RejectModal
          card={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
          saving={actionSaving}
          error={actionError}
        />
      )}
    </>
  );
}
