"use client";

import { useEffect, useRef, useState } from "react";
import { Image, Loader2, Pencil, Plus, ShieldCheck, Trash2, UploadCloud, X } from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import {
  getMyInsuranceCards,
  addInsuranceCard,
  deleteInsuranceCard,
  updateInsuranceCard,
  uploadInsuranceCard,
} from "@/services/patientApi";
import type { InsuranceCardResponse } from "@/types/api";

export default function InsurancePage() {
  const [cards, setCards] = useState<InsuranceCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // text fields
  const [providerName, setProviderName] = useState("");
  const [memberId, setMemberId] = useState("");

  // image fields (only for new cards)
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setCards(await getMyInsuranceCards());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insurance cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setProviderName("");
    setMemberId("");
    setFrontImage(null);
    setBackImage(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (card: InsuranceCardResponse) => {
    setEditingId(card.id);
    setProviderName(card.providerName);
    setMemberId(card.memberId);
    setFrontImage(null);
    setBackImage(null);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setProviderName("");
    setMemberId("");
    setFrontImage(null);
    setBackImage(null);
    setFormError("");
    if (frontRef.current) frontRef.current.value = "";
    if (backRef.current) backRef.current.value = "";
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!providerName.trim() || !memberId.trim()) {
      setFormError("Provider name and member ID are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      if (editingId !== null) {
        await updateInsuranceCard(editingId, {
          providerName: providerName.trim(),
          memberId: memberId.trim(),
        });
      } else if (frontImage && backImage) {
        await uploadInsuranceCard(frontImage, backImage, providerName.trim(), memberId.trim());
      } else {
        await addInsuranceCard({ providerName: providerName.trim(), memberId: memberId.trim() });
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : editingId ? "Failed to update card" : "Failed to add card");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this insurance card?")) return;
    try {
      await deleteInsuranceCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove card");
    }
  };

  return (
    <PatientAppShell>
      <div className="max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Insurance Cards</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage your insurance cards for covered medicine orders.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition shadow-sm"
          >
            <Plus size={16} /> Add Card
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId !== null ? "Edit Insurance Card" : "Add Insurance Card"}
                </h2>
                <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Provider Name</label>
                  <input
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="e.g. RSSB, MMI, RADIANT"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Member ID</label>
                  <input
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="Your insurance member number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {editingId === null && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Card Images <span className="font-normal normal-case text-slate-400">(optional — upload both for faster verification)</span></p>
                    {[
                      { label: "Front of Card", file: frontImage, setFile: setFrontImage, ref: frontRef },
                      { label: "Back of Card",  file: backImage,  setFile: setBackImage,  ref: backRef  },
                    ].map(({ label, file, setFile, ref }) => (
                      <div key={label}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                        <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed px-4 py-3 transition ${file ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-slate-50 hover:border-teal-300"}`}>
                          {file ? (
                            <>
                              <Image size={18} className="text-teal-600 shrink-0" />
                              <span className="text-xs font-semibold text-slate-700 truncate flex-1">{file.name}</span>
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setFile(null); if (ref.current) ref.current.value = ""; }}
                                className="text-slate-400 hover:text-rose-500"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <UploadCloud size={18} className="text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-500">Click to upload image</span>
                            </>
                          )}
                          <input
                            ref={ref}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {formError && <p className="text-sm text-rose-600">{formError}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60 transition"
                  >
                    {submitting
                      ? <Loader2 className="inline animate-spin" size={16} />
                      : editingId !== null ? "Save Changes" : "Add Card"}
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
              <span>Loading insurance cards…</span>
            </div>
          ) : cards.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShieldCheck size={36} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No insurance cards added yet.</p>
              <button
                onClick={openAdd}
                className="mt-3 text-sm font-bold text-teal-600 hover:text-teal-800"
              >
                Add your first card
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cards.map((card) => (
                <div key={card.id} className="flex items-start gap-4 px-6 py-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{card.providerName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Member ID: {card.memberId}</p>
                    {card.coveragePercentage != null && (
                      <p className="text-xs text-teal-600 font-semibold mt-0.5">
                        Coverage: {card.coveragePercentage}%
                      </p>
                    )}
                    {(card.frontImageUrl || card.backImageUrl) && (
                      <div className="flex gap-3 mt-2">
                        {card.frontImageUrl && (
                          <a href={card.frontImageUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline font-semibold flex items-center gap-1">
                            <Image size={12} /> Front
                          </a>
                        )}
                        {card.backImageUrl && (
                          <a href={card.backImageUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline font-semibold flex items-center gap-1">
                            <Image size={12} /> Back
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      card.status === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : card.status === "REJECTED"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {card.status === "VERIFIED" ? "Verified" : card.status === "REJECTED" ? "Rejected" : "Pending"}
                    </span>
                    {card.status !== "VERIFIED" && (
                      <button
                        onClick={() => openEdit(card)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 transition"
                        aria-label="Edit card"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      aria-label="Remove card"
                    >
                      <Trash2 size={14} />
                    </button>
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
