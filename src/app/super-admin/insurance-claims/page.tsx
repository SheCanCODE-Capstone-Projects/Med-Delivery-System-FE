"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Receipt,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import {
  getInsuranceClaims,
  processInsuranceClaim,
  getAllInsuranceProviders,
  verifyInsuranceCard,
} from "@/services/adminApi";
import type { InsuranceProvider, PaymentResponse } from "@/types/api";

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700 border-amber-100",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
  PAID:     "bg-teal-50 text-teal-700 border-teal-100",
};

const STATUSES = ["ALL", "PENDING", "APPROVED", "REJECTED", "PAID"];

export default function InsuranceClaimsPage() {
  const [claims, setClaims] = useState<PaymentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  // Insurance providers tab
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"claims" | "providers" | "verify">("claims");

  // Verify card tab
  const [cardId, setCardId] = useState("");
  const [coverage, setCoverage] = useState("80");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getInsuranceClaims(
        page, 20, statusFilter === "ALL" ? undefined : statusFilter
      );
      setClaims(res.content);
      setTotal(res.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insurance claims");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const loadProviders = async () => {
    setProvidersLoading(true);
    try {
      setProviders(await getAllInsuranceProviders());
    } catch {
      /* non-critical */
    } finally {
      setProvidersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "claims") loadClaims();
    if (activeTab === "providers") loadProviders();
  }, [activeTab, loadClaims]);

  const handleProcess = async (id: number, action: "APPROVE" | "REJECT") => {
    setActionLoading(id);
    setActionMsg("");
    try {
      await processInsuranceClaim(id, action);
      setClaims((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: action === "APPROVE" ? "APPROVED" : "REJECTED" } : c
        )
      );
      setActionMsg(`Claim #${id} ${action === "APPROVE" ? "approved" : "rejected"}.`);
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyCard = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!cardId.trim()) { setVerifyError("Insurance card ID is required."); return; }
    const pct = parseFloat(coverage);
    if (isNaN(pct) || pct < 0 || pct > 100) { setVerifyError("Coverage must be between 0 and 100."); return; }
    setVerifyLoading(true);
    setVerifyMsg("");
    setVerifyError("");
    try {
      await verifyInsuranceCard(Number(cardId), pct);
      setVerifyMsg(`Card #${cardId} verified with ${pct}% coverage.`);
      setCardId("");
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const filteredClaims = search
    ? claims.filter(
        (c) =>
          c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
          String(c.orderId).includes(search) ||
          String(c.id).includes(search)
      )
    : claims;

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Insurance</h1>
          <p className="text-slate-500 mt-1">Manage claims, providers, and card verification.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-medium">Total Claims</p>
          <p className="text-2xl font-bold text-teal-600">{total.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 mb-6 w-fit">
        {(["claims", "providers", "verify"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition capitalize ${
              activeTab === tab ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "claims" ? "Claims" : tab === "providers" ? "Providers" : "Verify Card"}
          </button>
        ))}
      </div>

      {/* ─── CLAIMS TAB ─── */}
      {activeTab === "claims" && (
        <>
          {actionMsg && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">{actionMsg}</div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient or claim ID..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-60"
              />
            </div>
            <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(0); }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${statusFilter === s ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={loadClaims} className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50 transition">
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {error && (
              <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold">{error}</div>
            )}
            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
                  <Loader2 className="animate-spin" size={24} />
                  <span>Loading claims...</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Claim ID</th>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Provider</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClaims.length > 0 ? filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/80 transition text-sm">
                        <td className="px-6 py-4 font-bold text-slate-400 text-xs">#{claim.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{claim.patientName}</td>
                        <td className="px-6 py-4 text-slate-500">#{claim.orderId}</td>
                        <td className="px-6 py-4 text-slate-500">{claim.insuranceProvider ?? "—"}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {claim.amount != null ? `RWF ${claim.amount.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[claim.status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {claim.status === "PENDING" && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleProcess(claim.id, "APPROVE")}
                                disabled={actionLoading === claim.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 rounded-lg hover:bg-teal-100 transition disabled:opacity-50"
                              >
                                {actionLoading === claim.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleProcess(claim.id, "REJECT")}
                                disabled={actionLoading === claim.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
                              >
                                <XCircle size={11} />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                          <Receipt size={32} className="mx-auto mb-2 opacity-40" />
                          No claims found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/30">
              <span>Showing {filteredClaims.length} of {total} claims</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50 bg-white hover:bg-slate-50">Previous</button>
                <button onClick={() => setPage((p) => p + 1)} disabled={claims.length < 20} className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50 bg-white hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── PROVIDERS TAB ─── */}
      {activeTab === "providers" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {providersLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={22} />
              <span>Loading providers…</span>
            </div>
          ) : providers.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Receipt size={32} className="mx-auto mb-2 opacity-40" />
              No insurance providers found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition text-sm">
                    <td className="px-6 py-4 text-slate-400 text-xs font-bold">#{p.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {p.code}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─── VERIFY CARD TAB ─── */}
      {activeTab === "verify" && (
        <div className="max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Verify Insurance Card</h2>
            <p className="text-sm text-slate-500 mb-6">
              Set a patient's insurance card as verified and assign coverage percentage.
            </p>

            {verifyMsg && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} /> {verifyMsg}
              </div>
            )}
            {verifyError && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">{verifyError}</div>
            )}

            <form onSubmit={handleVerifyCard} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Insurance Card ID</label>
                <input
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  placeholder="Enter card ID number"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Coverage Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={coverage}
                    onChange={(e) => setCoverage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
              >
                {verifyLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                {verifyLoading ? "Verifying…" : "Verify Card"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
