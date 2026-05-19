"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardPlus, Loader2, Plus, X, XCircle } from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import {
  getMyMedicineRequests,
  submitMedicineRequest,
  confirmMedicineRequest,
  cancelMedicineRequest,
} from "@/services/patientApi";
import type { MedicineRequestResponse } from "@/types/api";

const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-100",
  ACCEPTED:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-100",
  REJECTED:  "bg-slate-100 text-slate-600 border-slate-200",
};

export default function MedicineRequestsPage() {
  const [requests, setRequests] = useState<MedicineRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  // new request form
  const [showForm, setShowForm] = useState(false);
  const [medicineName, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRequests(await getMyMedicineRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load medicine requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const closeForm = () => {
    setShowForm(false);
    setMedicineName("");
    setQuantity(1);
    setNotes("");
    setFormError("");
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!medicineName.trim()) { setFormError("Medicine name is required."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await submitMedicineRequest({
        medicineName: medicineName.trim(),
        quantity,
        notes: notes.trim() || undefined,
      });
      closeForm();
      await load();
      setActionMsg("Medicine request submitted successfully.");
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (id: number) => {
    setActionLoading(id);
    setActionMsg("");
    try {
      await confirmMedicineRequest(id);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "CONFIRMED" } : r));
      setActionMsg(`Request #${id} confirmed.`);
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this medicine request?")) return;
    setActionLoading(id);
    setActionMsg("");
    try {
      await cancelMedicineRequest(id);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "CANCELLED" } : r));
      setActionMsg(`Request #${id} cancelled.`);
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PatientAppShell>
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Medicine Requests</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Request specific medicines and track pharmacy responses.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition shadow-sm"
          >
            <Plus size={16} /> New Request
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">{error}</div>
        )}
        {actionMsg && (
          <div className="mb-4 p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 text-sm font-semibold">{actionMsg}</div>
        )}

        {/* New Request Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">New Medicine Request</h2>
                <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Medicine Name</label>
                  <input
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="e.g. Amoxicillin 500mg"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Notes <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your symptoms or additional details..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                  />
                </div>
                {formError && <p className="text-sm text-rose-600">{formError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeForm} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    {submitting ? "Submitting…" : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={22} />
              <span>Loading requests…</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ClipboardPlus size={36} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No medicine requests yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-bold text-teal-600 hover:text-teal-800">
                Submit your first request
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <ClipboardPlus className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">{req.medicineName}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[req.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Qty: {req.quantity}
                      {req.notes && <span className="ml-2">• {req.notes}</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleConfirm(req.id)}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 rounded-lg hover:bg-teal-100 transition disabled:opacity-50"
                        >
                          {actionLoading === req.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancel(req.id)}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
                        >
                          {actionLoading === req.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientAppShell>
  );
}
