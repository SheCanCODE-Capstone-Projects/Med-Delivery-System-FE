"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, AlertCircle, Search, RefreshCw, ChevronDown, ChevronUp, X, Eye, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import {
  getAssignedOrders,
  validatePrescription,
  confirmStock,
  dispenseMedicine,
  suggestSubstitution,
  fillFromPrescription,
  getActionLogs,
  completeOrder,
} from '@/services/pharmacistApi';
import type { DispensingOrderResponse, ActionLogResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-100',
  PROCESSING: 'bg-violet-50 text-violet-700 border-violet-100',
  DISPENSED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  COMPLETED: 'bg-teal-50 text-teal-700 border-teal-100',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
};

const ALL_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'DISPENSED', 'COMPLETED', 'CANCELLED'];

export default function PharmacistOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DispensingOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<number, ActionLogResponse[]>>({});
  const [subForm, setSubForm] = useState<{ orderId: number; original: string; substitute: string; reason: string; medicines: Array<{ medicineName: string }> } | null>(null);
  const [declineForm, setDeclineForm] = useState<{ orderId: number; reason: string } | null>(null);
  const [fillForm, setFillForm] = useState<{ orderId: number; prescriptionUrl?: string; items: Array<{ medicineName: string; quantity: string }> } | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await getAssignedOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'ALL') list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.patientName?.toLowerCase().includes(q) || String(o.id).includes(q));
    }
    return list;
  }, [orders, statusFilter, search]);

  const handleAction = async (order: DispensingOrderResponse, action: 'validate' | 'stock' | 'dispense' | 'complete') => {
    setActionLoading(order.id);
    setError('');
    try {
      if (action === 'validate') await validatePrescription(order.id);
      else if (action === 'stock') await confirmStock(order.id);
      else if (action === 'dispense') await dispenseMedicine(order.id);
      else await completeOrder(order.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFill = async () => {
    if (!fillForm) return;
    const validItems = fillForm.items.filter(i => i.medicineName.trim() && Number(i.quantity) > 0);
    if (validItems.length === 0) return;
    setActionLoading(fillForm.orderId);
    try {
      await fillFromPrescription(fillForm.orderId, validItems.map(i => ({ medicineName: i.medicineName.trim(), quantity: Number(i.quantity) })));
      setFillForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fill order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubstitution = async () => {
    if (!subForm) return;
    if (!subForm.original.trim() || !subForm.substitute.trim() || !subForm.reason.trim()) {
      setError('All substitution fields are required.');
      return;
    }
    setActionLoading(subForm.orderId);
    setError('');
    try {
      await suggestSubstitution(subForm.orderId, {
        originalMedicineName: subForm.original,
        suggestedMedicineName: subForm.substitute,
        reason: subForm.reason,
      });
      setSubForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Substitution failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!declineForm) return;
    setActionLoading(declineForm.orderId);
    setError('');
    try {
      await validatePrescription(declineForm.orderId, { valid: false, notes: declineForm.reason || 'Prescription declined' });
      setDeclineForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline prescription');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = async (orderId: number) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (!logs[orderId]) {
      try {
        const data = await getActionLogs(orderId);
        setLogs((prev) => ({ ...prev, [orderId]: data }));
      } catch { /* ignore */ }
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-slate-500 mt-1">Dispensing queue — validate, confirm stock, and dispense.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex gap-2 items-center">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search patient or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
          />
        </div>
        <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${statusFilter === s ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Fill from Prescription modal */}
      {fillForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Fill from Prescription</h2>
              <button onClick={() => setFillForm(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            {fillForm.prescriptionUrl && (
              <a href={fillForm.prescriptionUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800">
                <FileText size={15} /> View Prescription
              </a>
            )}
            <p className="text-xs text-slate-500">Enter the medicines from the prescription. Only medicines in your pharmacy's inventory can be added.</p>
            <div className="space-y-3">
              {fillForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={item.medicineName}
                    onChange={(e) => setFillForm(f => f && { ...f, items: f.items.map((it, i) => i === idx ? { ...it, medicineName: e.target.value } : it) })}
                    placeholder="Medicine name (must match inventory)"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setFillForm(f => f && { ...f, items: f.items.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it) })}
                    placeholder="Qty"
                    className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {fillForm.items.length > 1 && (
                    <button onClick={() => setFillForm(f => f && { ...f, items: f.items.filter((_, i) => i !== idx) })}
                      className="text-slate-400 hover:text-rose-500"><X size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setFillForm(f => f && { ...f, items: [...f.items, { medicineName: '', quantity: '1' }] })}
              className="text-sm font-semibold text-teal-600 hover:text-teal-800">+ Add Medicine</button>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setFillForm(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleFill} disabled={actionLoading !== null}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading !== null && <Loader2 size={14} className="animate-spin" />}
                Fill Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution modal */}
      {subForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Suggest Substitution</h2>
              <button onClick={() => setSubForm(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Original Medicine</label>
              {subForm.medicines.length > 1 ? (
                <select
                  value={subForm.original}
                  onChange={(e) => setSubForm((f) => f && { ...f, original: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  {subForm.medicines.map((m) => (
                    <option key={m.medicineName} value={m.medicineName}>{m.medicineName}</option>
                  ))}
                </select>
              ) : subForm.medicines.length === 1 ? (
                <input
                  value={subForm.original}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed" />
              ) : (
                <input
                  value={subForm.original}
                  onChange={(e) => setSubForm((f) => f && { ...f, original: e.target.value })}
                  placeholder="Enter the medicine name to substitute"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Substitute Medicine</label>
              <input
                value={subForm.substitute}
                onChange={(e) => setSubForm((f) => f && { ...f, substitute: e.target.value })}
                placeholder="Enter substitute medicine name exactly as in inventory"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <p className="text-xs text-slate-400 mt-1">Must match an existing medicine name in the system.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Reason</label>
              <textarea
                rows={2}
                value={subForm.reason}
                onChange={(e) => setSubForm((f) => f && { ...f, reason: e.target.value })}
                placeholder="Explain why this substitution is needed…"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSubForm(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleSubstitution} disabled={actionLoading !== null}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading !== null && <Loader2 size={14} className="animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Rx modal */}
      {declineForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Decline Prescription</h2>
              <button onClick={() => setDeclineForm(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-500">
              This will cancel the order and notify the patient. Please provide a reason.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Reason for Declining</label>
              <textarea
                rows={3}
                value={declineForm.reason}
                onChange={(e) => setDeclineForm((f) => f && { ...f, reason: e.target.value })}
                placeholder="e.g. Prescription is invalid, expired, or illegible…"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeclineForm(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={handleDecline} disabled={actionLoading !== null}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading !== null && <Loader2 size={14} className="animate-spin" />}
                Decline Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No orders found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((order) => (
              <div key={order.id}>
                <div className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">{order.patientName}</span>
                      <span className="text-xs text-slate-400">#{order.id}</span>
                      {order.prescriptionUrl && (
                        <a href={order.prescriptionUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 rounded hover:bg-violet-100">
                          View Rx
                        </a>
                      )}
                    </div>
                    {order.medicines && order.medicines.length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">{order.medicines.map((m) => `${m.medicineName} ×${m.quantity}`).join(' · ')}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {order.status}
                    </span>

                    {order.status === 'PENDING' && (
                      <>
                        {order.prescriptionUrl && (
                          <button
                            onClick={() => setFillForm({ orderId: order.id, prescriptionUrl: order.prescriptionUrl, items: [{ medicineName: '', quantity: '1' }] })}
                            className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 flex items-center gap-1">
                            <FileText size={11} /> Fill Rx
                          </button>
                        )}
                        <button onClick={() => handleAction(order, 'validate')} disabled={actionLoading === order.id}
                          className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-1">
                          {actionLoading === order.id ? <Loader2 size={11} className="animate-spin" /> : null}
                          Validate Rx
                        </button>
                        <button
                          onClick={() => setDeclineForm({ orderId: order.id, reason: '' })}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 disabled:opacity-50">
                          Decline Rx
                        </button>
                      </>
                    )}
                    {order.status === 'CONFIRMED' && !order.stockConfirmed && (
                      <>
                        <button onClick={() => handleAction(order, 'stock')} disabled={actionLoading === order.id}
                          className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1">
                          {actionLoading === order.id ? <Loader2 size={11} className="animate-spin" /> : null}
                          Confirm Stock
                        </button>
                        <button onClick={() => { setError(''); setSubForm({ orderId: order.id, original: order.medicines?.[0]?.medicineName ?? '', substitute: '', reason: '', medicines: order.medicines ?? [] }); }}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg hover:bg-amber-100">
                          Substitute
                        </button>
                      </>
                    )}
                    {order.stockConfirmed && order.status !== 'DISPENSED' && order.status !== 'COMPLETED' && (
                      <button onClick={() => handleAction(order, 'dispense')} disabled={actionLoading === order.id}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1">
                        {actionLoading === order.id ? <Loader2 size={11} className="animate-spin" /> : null}
                        Dispense
                      </button>
                    )}
                    {order.status === 'DISPENSED' && (
                      <button onClick={() => handleAction(order, 'complete')} disabled={actionLoading === order.id}
                        className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1">
                        {actionLoading === order.id ? <Loader2 size={11} className="animate-spin" /> : null}
                        Mark Delivered
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/pharmacist/orders/${order.id}`)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 transition"
                      title="View full details"
                    >
                      <Eye size={16} />
                    </button>
                    <button onClick={() => toggleExpand(order.id)} className="p-1.5 text-slate-400 hover:text-slate-600 transition">
                      {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {expandedId === order.id && order.status === 'PENDING' && (
                  <div className="border-t border-slate-100 bg-slate-50/30">
                    {/* Prescription validation view (image 7 style) */}
                    <div className="grid lg:grid-cols-5 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                      {/* Left: Prescription preview (60%) */}
                      <div className="lg:col-span-3 p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Prescription</p>
                        {order.prescriptionUrl ? (
                          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-600">Prescription Document</span>
                              <a
                                href={order.prescriptionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition"
                              >
                                <Eye size={12} /> Open full size
                              </a>
                            </div>
                            <div className="relative bg-slate-50 flex items-center justify-center" style={{ minHeight: 240 }}>
                              {order.prescriptionUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={order.prescriptionUrl}
                                  alt="Prescription"
                                  className="max-w-full max-h-64 object-contain rounded"
                                />
                              ) : (
                                <iframe
                                  src={order.prescriptionUrl}
                                  className="w-full"
                                  style={{ height: 240, border: 'none' }}
                                  title="Prescription"
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center py-10 text-slate-400">
                            <FileText size={32} className="mb-2 opacity-40" />
                            <p className="text-sm font-medium">No prescription attached</p>
                            <p className="text-xs mt-0.5">Patient did not upload a prescription</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Auto-checks + items (40%) */}
                      <div className="lg:col-span-2 p-5 flex flex-col gap-4">
                        {/* Auto-checks */}
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Auto Checks</p>
                          <div className="space-y-2">
                            {[
                              {
                                label: "Issued within 30 days",
                                ok: order.prescriptionDate
                                  ? (Date.now() - new Date(order.prescriptionDate).getTime()) < 30 * 24 * 60 * 60 * 1000
                                  : false,
                              },
                              { label: "Doctor stamp detected", ok: order.hasStamp ?? false },
                              { label: "Signature found", ok: order.hasSignature ?? false },
                            ].map((check) => (
                              <div key={check.label} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${check.ok ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                                {check.ok
                                  ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                  : <Clock size={14} className="text-amber-500 shrink-0" />}
                                <span className={`text-xs font-semibold ${check.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {check.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Items requested */}
                        {order.medicines && order.medicines.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Items Requested</p>
                            <div className="space-y-1.5">
                              {order.medicines.map((m, i) => (
                                <div key={i} className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-3 py-2">
                                  <span className="text-xs font-semibold text-slate-700">{m.medicineName}</span>
                                  <span className="text-xs text-slate-500">×{m.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action bar */}
                        <div className="mt-auto flex gap-2 pt-2">
                          <button
                            onClick={() => setDeclineForm({ orderId: order.id, reason: '' })}
                            disabled={actionLoading === order.id}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 disabled:opacity-50 transition"
                          >
                            <X size={13} /> Reject
                          </button>
                          <button
                            onClick={() => handleAction(order, 'validate')}
                            disabled={actionLoading === order.id}
                            className="flex-[2] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition"
                          >
                            {actionLoading === order.id
                              ? <Loader2 size={13} className="animate-spin" />
                              : <ShieldCheck size={13} />}
                            Validate &amp; Assign
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {expandedId === order.id && order.status !== 'PENDING' && (
                  <div className="px-6 pb-4 bg-slate-50/50 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-2">Action Log</p>
                    {(logs[order.id] ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400">No logs yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {logs[order.id].map((log) => (
                          <div key={log.id} className="flex items-start gap-3 text-xs">
                            <span className="text-slate-400 shrink-0">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</span>
                            <span className="font-semibold text-slate-700">{log.action}</span>
                            <span className="text-slate-500">{log.performedBy}</span>
                            {log.notes && <span className="text-slate-400 italic">"{log.notes}"</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          Showing {filtered.length} of {orders.length} orders
        </div>
      </div>
    </div>
  );
}
