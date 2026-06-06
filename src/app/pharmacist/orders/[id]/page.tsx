"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2,
  FileText, ShieldCheck, Pill, User, Droplets, Heart, X, Save,
} from 'lucide-react';
import {
  getOrderDetail,
  validatePrescription,
  fillFromPrescription,
  dispenseMedicine,
  saveMedicationNotes,
} from '@/services/pharmacistApi';
import type { DispensingOrderResponse } from '@/types/api';

function AutoCheck({ label, pass }: { label: string; pass: boolean | undefined }) {
  if (pass === undefined || pass === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <AlertTriangle size={15} className="text-amber-400" />
        {label}
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${pass ? 'text-emerald-600' : 'text-rose-500'}`}>
      {pass ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
      {label}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(id);

  const [order, setOrder] = useState<DispensingOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [actioning, setActioning] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [medNotes, setMedNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [fillOpen, setFillOpen] = useState(false);
  const [fillItems, setFillItems] = useState([{ medicineName: '', quantity: '1' }]);

  useEffect(() => {
    getOrderDetail(orderId)
      .then((o) => { setOrder(o); setMedNotes(o.medicationNotes ?? ''); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const reload = async () => {
    const o = await getOrderDetail(orderId);
    setOrder(o);
    setMedNotes(o.medicationNotes ?? '');
  };

  const isWithin30Days = () => {
    if (!order?.prescriptionDate) return undefined;
    const issued = new Date(order.prescriptionDate);
    const today = new Date();
    const diff = (today.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  };

  const handleValidate = async () => {
    setActioning(true);
    setError('');
    try {
      await validatePrescription(orderId, { valid: true });
      setMsg('Prescription validated and order assigned.');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Validation failed');
    } finally { setActioning(false); }
  };

  const handleReject = async () => {
    setActioning(true);
    setError('');
    try {
      await validatePrescription(orderId, { valid: false, notes: rejectReason || 'Prescription declined' });
      setRejectOpen(false);
      setMsg('Prescription rejected.');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rejection failed');
    } finally { setActioning(false); }
  };

  const handleDispense = async () => {
    setActioning(true);
    setError('');
    try {
      await dispenseMedicine(orderId, { medicationNotes: medNotes || undefined });
      setMsg('Order dispensed successfully.');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dispense failed');
    } finally { setActioning(false); }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await saveMedicationNotes(orderId, medNotes);
      setMsg('Medication notes saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save notes');
    } finally { setSavingNotes(false); }
  };

  const handleFill = async () => {
    const validItems = fillItems.filter((i) => i.medicineName.trim() && Number(i.quantity) > 0);
    if (validItems.length === 0) return;
    setActioning(true);
    try {
      await fillFromPrescription(orderId, validItems.map((i) => ({ medicineName: i.medicineName.trim(), quantity: Number(i.quantity) })));
      setFillOpen(false);
      setMsg('Order filled from prescription.');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fill failed');
    } finally { setActioning(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading order...</span>
    </div>
  );

  if (error && !order) return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">{error}</div>
  );

  if (!order) return null;

  const isPrivate = order.orderType === 'PRIVATE_PURCHASE';
  const isPending = order.status === 'PENDING';
  const canDispense = order.stockConfirmed && order.status !== 'DISPENSED' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED';

  return (
    <>
      {/* Reject modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Reject Prescription</h2>
              <button onClick={() => setRejectOpen(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-500">The order will be cancelled and the patient will be notified.</p>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Reason for Rejection</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Prescription is expired or illegible…"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleReject} disabled={actioning}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actioning ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fill from Prescription modal */}
      {fillOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Fill from Prescription</h2>
              <button onClick={() => setFillOpen(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">Enter medicines from the prescription. Names must match your pharmacy inventory.</p>
            <div className="space-y-3">
              {fillItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={item.medicineName}
                    onChange={(e) => setFillItems((f) => f.map((it, i) => i === idx ? { ...it, medicineName: e.target.value } : it))}
                    placeholder="Medicine name"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number" min={1}
                    value={item.quantity}
                    onChange={(e) => setFillItems((f) => f.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it))}
                    placeholder="Qty"
                    className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {fillItems.length > 1 && (
                    <button onClick={() => setFillItems((f) => f.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500"><X size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setFillItems((f) => [...f, { medicineName: '', quantity: '1' }])}
              className="text-sm font-semibold text-teal-600 hover:text-teal-800">+ Add Medicine</button>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setFillOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleFill} disabled={actioning}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actioning ? <Loader2 size={14} className="animate-spin" /> : null}
                Fill Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        {/* Back + header */}
        <div className="mb-5 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Order #{order.id} — {order.patientName}</h1>
            <p className="text-sm text-slate-500">
              {order.orderType === 'PRESCRIPTION_BASED' ? 'Prescription-Based Order' : 'Private Purchase'}
              {' · '}{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
            </p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border ${
            order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            order.status === 'CONFIRMED' ? 'bg-sky-50 text-sky-700 border-sky-200' :
            order.status === 'DISPENSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            order.status === 'COMPLETED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
            order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
            'bg-slate-100 text-slate-600 border-slate-200'
          }`}>{order.status}</span>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">{error}</div>
        )}
        {msg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold">{msg}</div>
        )}

        {/* Two-panel: prescription + checks */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4 mb-4">

          {/* LEFT — Prescription Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2"><FileText size={15} /> Prescription</h2>
              {order.prescriptionUrl && (
                <a href={order.prescriptionUrl} target="_blank" rel="noreferrer"
                  className="text-xs font-semibold text-violet-600 hover:underline flex items-center gap-1">
                  Open in new tab
                </a>
              )}
            </div>
            <div className="flex-1 min-h-[340px] flex items-center justify-center bg-slate-50">
              {isPrivate ? (
                <div className="text-center text-slate-400 px-6">
                  <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">Private Purchase</p>
                  <p className="text-xs mt-1">No prescription required for this order type.</p>
                </div>
              ) : order.prescriptionUrl ? (
                order.prescriptionUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={order.prescriptionUrl}
                    className="w-full h-full min-h-[340px] border-0"
                    title="Prescription PDF"
                  />
                ) : (
                  <img
                    src={order.prescriptionUrl}
                    alt="Prescription"
                    className="max-w-full max-h-[400px] object-contain p-4"
                  />
                )
              ) : (
                <div className="text-center text-slate-400 px-6">
                  <FileText size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No prescription file uploaded.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Auto Checks + Items */}
          <div className="flex flex-col gap-4">

            {/* Auto Checks */}
            {!isPrivate && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Auto Checks</h2>
                <div className="space-y-2.5">
                  <AutoCheck label="Issued within 30 days" pass={isWithin30Days()} />
                  <AutoCheck label="Doctor stamp detected" pass={order.hasStamp} />
                  <AutoCheck label="Signature found" pass={order.hasSignature} />
                </div>
                {order.prescriptionDate && (
                  <p className="text-xs text-slate-400 mt-3">
                    Prescription date: {new Date(order.prescriptionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Items Requested */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex-1">
              <h2 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center justify-between">
                Items Requested
                {isPending && order.prescriptionUrl && !isPrivate && (
                  <button onClick={() => setFillOpen(true)}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 border border-violet-200 px-2.5 py-1 rounded-lg hover:bg-violet-50">
                    + Fill Rx
                  </button>
                )}
              </h2>
              {!order.medicines || order.medicines.length === 0 ? (
                <p className="text-sm text-slate-400">No items yet. Use "Fill Rx" to add medicines from the prescription.</p>
              ) : (
                <div className="space-y-2">
                  {order.medicines.map((med) => (
                    <div key={med.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{med.medicineName}</p>
                        <p className="text-xs text-slate-400">×{med.quantity}{med.unitPrice ? ` · $${med.unitPrice.toFixed(2)} each` : ''}</p>
                      </div>
                      {med.inStock !== undefined && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          med.inStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {med.inStock ? 'In stock' : 'Out of stock'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
          <h2 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-2">
            <User size={14} /> Patient Information
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0.5 flex items-center gap-1">
                <Droplets size={11} /> Blood Type
              </p>
              <p className="text-sm font-semibold text-slate-700">{order.patientBloodType || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0.5 flex items-center gap-1">
                <AlertTriangle size={11} /> Allergies
              </p>
              <p className="text-sm font-semibold text-slate-700">{order.patientAllergies || 'None recorded'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Order Type</p>
              <p className="text-sm font-semibold text-slate-700">{order.orderType?.replace('_', ' ') || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0.5 flex items-center gap-1">
                <Heart size={11} /> Medical Notes
              </p>
              <p className="text-sm text-slate-600">{order.patientMedicalNotes || '—'}</p>
            </div>
          </div>
        </div>

        {/* Medication Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
          <h2 className="text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center gap-2">
            <Pill size={14} /> Medication Instructions for Patient
          </h2>
          <p className="text-xs text-slate-400 mb-3">These notes will be delivered with the order to guide the patient on how to take their medicines.</p>
          <textarea
            rows={4}
            value={medNotes}
            onChange={(e) => setMedNotes(e.target.value)}
            placeholder="e.g. Take Amoxicillin 500mg twice daily after meals for 7 days. Avoid alcohol with Metronidazole…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={order.status === 'CANCELLED'}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes || order.status === 'CANCELLED'}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-200 disabled:opacity-50 transition"
            >
              {savingNotes ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Notes
            </button>
          </div>
        </div>

        {/* Action Footer */}
        {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
          <div className="flex flex-wrap gap-3 items-center justify-end">
            {isPending && (
              <>
                <button
                  onClick={() => setRejectOpen(true)}
                  disabled={actioning}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 disabled:opacity-50 transition"
                >
                  <XCircle size={15} /> Reject
                </button>
                <button
                  onClick={handleValidate}
                  disabled={actioning}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {actioning ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Validate & Assign
                </button>
              </>
            )}
            {canDispense && (
              <button
                onClick={handleDispense}
                disabled={actioning}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition"
              >
                {actioning ? <Loader2 size={15} className="animate-spin" /> : <Pill size={15} />}
                Dispense Order
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
