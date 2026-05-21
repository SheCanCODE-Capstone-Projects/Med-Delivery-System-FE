"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { getMyPrescriptions, uploadPrescription, deletePrescription } from "@/services/patientApi";
import type { PrescriptionResponse } from "@/types/api";

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-50 text-amber-700 border-amber-100",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
  USED:     "bg-slate-100 text-slate-600 border-slate-200",
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setPrescriptions(await getMyPrescriptions());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const closeUpload = () => {
    setShowUpload(false);
    setFile(null);
    setNotes("");
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!file) { setFormError("Please select a prescription file."); return; }
    setUploading(true);
    setFormError("");
    try {
      await uploadPrescription(file, { notes: notes.trim() || undefined });
      closeUpload();
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this prescription?")) return;
    try {
      await deletePrescription(id);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete prescription");
    }
  };

  return (
    <PatientAppShell>
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Prescriptions</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Upload and manage your doctor prescriptions. Our AI will verify stamp and signature automatically.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition shadow-sm"
          >
            <Plus size={16} /> Upload Prescription
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">Upload Prescription</h2>
                <button onClick={closeUpload} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">File</label>
                  <label
                    className={`flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed py-8 px-4 text-center transition ${
                      file
                        ? "border-teal-300 bg-teal-50"
                        : "border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-teal-50/40"
                    }`}
                  >
                    {file ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-teal-600" />
                        <span className="text-sm font-bold text-slate-800 break-all">{file.name}</span>
                        <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-teal-500" />
                        <span className="text-sm font-bold text-slate-700">Click to choose file</span>
                        <span className="text-xs text-slate-400">PDF, JPG, or JPEG</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,image/jpeg,application/pdf"
                      className="sr-only"
                      onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFormError(""); }}
                    />
                  </label>
                  {file && (
                    <button
                      type="button"
                      onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                    >
                      <X size={12} /> Remove file
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Notes <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes for the pharmacist..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                  />
                </div>

                <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  Our AI will automatically detect stamp, signature, and prescription date from the uploaded image.
                </p>

                {formError && <p className="text-sm text-rose-600">{formError}</p>}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeUpload} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={uploading} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                    {uploading ? "Uploading…" : "Upload"}
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
              <span>Loading prescriptions…</span>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText size={36} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No prescriptions uploaded yet.</p>
              <button onClick={() => setShowUpload(true)} className="mt-3 text-sm font-bold text-teal-600 hover:text-teal-800">
                Upload your first prescription
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">
                        Prescription #{rx.id}
                        {rx.fileType && <span className="ml-1 text-xs text-slate-400 font-normal uppercase">{rx.fileType}</span>}
                      </p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[rx.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {rx.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {rx.prescriptionDate && (
                        <span className="text-xs text-slate-500">Date: {new Date(rx.prescriptionDate).toLocaleDateString()}</span>
                      )}
                      {rx.hasStamp && <span className="text-xs text-emerald-600 font-semibold">• Stamp detected</span>}
                      {rx.hasSignature && <span className="text-xs text-emerald-600 font-semibold">• Signature detected</span>}
                      {rx.notes && <span className="text-xs text-slate-500 truncate max-w-xs">• {rx.notes}</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uploaded {new Date(rx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {rx.fileUrl && (
                      <a
                        href={rx.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-teal-600 transition"
                        title="View prescription"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {rx.status !== "APPROVED" && rx.status !== "USED" && (
                      <button
                        onClick={() => handleDelete(rx.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition"
                        title="Delete prescription"
                      >
                        <Trash2 size={16} />
                      </button>
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
