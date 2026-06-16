"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Loader2,
  Pill,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Package,
  Clock,
  Check,
  X,
} from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import {
  getMyOrders,
  getPendingSubstitutions,
  approveSubstitution,
  rejectSubstitution,
  confirmPayment,
  getPaymentDetails,
} from "@/services/patientApi";
import { getUserId } from "@/services/authApi";
import { useOrderWebSocket } from "@/hooks/useOrderWebSocket";
import type { OrderResponse, SubstitutionResponse, PaymentResponse } from "@/types/api";

const STATUS_TONE: Record<string, string> = {
  UPLOADED:          "bg-amber-50 text-amber-700 border-amber-200",
  MATCHING:          "bg-sky-50 text-sky-700 border-sky-200",
  ASSIGNED:          "bg-violet-50 text-violet-700 border-violet-200",
  IN_PROGRESS:       "bg-violet-50 text-violet-700 border-violet-200",
  STOCK_CONFIRMED:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  READY_FOR_PICKUP:  "bg-teal-50 text-teal-700 border-teal-200",
  OUT_FOR_DELIVERY:  "bg-teal-50 text-teal-700 border-teal-200",
  COMPLETED:         "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED:         "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABEL: Record<string, string> = {
  UPLOADED:         "Prescription Received",
  MATCHING:         "Finding Pharmacy",
  ASSIGNED:         "Pharmacy Assigned",
  IN_PROGRESS:      "Being Prepared",
  STOCK_CONFIRMED:  "Stock Confirmed",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED:        "Completed",
  CANCELLED:        "Cancelled",
};

const STEP_LABELS: Record<string, string> = {
  UPLOADED:         "Received",
  ASSIGNED:         "Assigned",
  IN_PROGRESS:      "In Progress",
  STOCK_CONFIRMED:  "Confirmed",
  READY_FOR_PICKUP: "Ready",
  COMPLETED:        "Completed",
};

const ORDER_STEPS = ["UPLOADED", "ASSIGNED", "IN_PROGRESS", "STOCK_CONFIRMED", "READY_FOR_PICKUP", "COMPLETED"];

const STEP_ICONS: Record<string, React.ElementType> = {
  UPLOADED:         ClipboardList,
  ASSIGNED:         MapPin,
  IN_PROGRESS:      Package,
  STOCK_CONFIRMED:  ShieldCheck,
  READY_FOR_PICKUP: Clock,
  COMPLETED:        CheckCircle2,
};

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = ORDER_STEPS.indexOf(status);
  const isCancelled = status === "CANCELLED";

  return (
    <div className="mt-2">
      <div className="flex items-start overflow-x-auto pb-2">
        {ORDER_STEPS.map((step, idx) => {
          const done = !isCancelled && currentIdx > idx;
          const active = !isCancelled && currentIdx === idx;
          const Icon = STEP_ICONS[step] ?? CheckCircle2;
          return (
            <div key={step} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                  done
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-200"
                    : active
                    ? "bg-white border-2 border-teal-500 text-teal-600 shadow-sm shadow-teal-100"
                    : "bg-white border-2 border-slate-200 text-slate-300"
                }`}>
                  {done ? <Check size={14} strokeWidth={3} /> : <Icon size={13} />}
                </div>
                <span className={`text-[10px] font-semibold whitespace-nowrap leading-tight text-center max-w-[56px] ${
                  done || active ? "text-teal-700" : "text-slate-400"
                }`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
              {idx < ORDER_STEPS.length - 1 && (
                <div className={`h-0.5 w-10 mx-0.5 mb-5 rounded-full flex-shrink-0 transition-colors ${
                  done ? "bg-teal-500" : "bg-slate-200"
                }`} />
              )}
            </div>
          );
        })}
      </div>
      {isCancelled && (
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-rose-600">
          <X size={14} />
          Order Cancelled
        </div>
      )}
    </div>
  );
}

function OrderDetailsPanel({ order }: { order: OrderResponse }) {
  const subtotal = order.items?.reduce((sum, m) => sum + (m.unitPrice ?? 0) * m.quantity, 0) ?? 0;
  const deliveryFee = order.fulfillmentType === "DELIVERY" ? 500 : 0;
  const insuranceDiscount = order.coveragePercentage && order.totalAmount
    ? Math.round((order.coveragePercentage / 100) * order.totalAmount)
    : 0;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {/* Pharmacy info */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pharmacy</p>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-teal-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">
              {order.pharmacyName ?? "Awaiting assignment"}
            </p>
            {order.branchName && order.branchName !== order.pharmacyName && (
              <p className="text-xs text-slate-500 mt-0.5">{order.branchName}</p>
            )}
            {order.coveragePercentage && order.coveragePercentage > 0 ? (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                <ShieldCheck size={10} />
                {order.coveragePercentage}% covered
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
            order.fulfillmentType === "DELIVERY"
              ? "bg-sky-50 text-sky-700 border-sky-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            {order.fulfillmentType === "DELIVERY" ? <Truck size={11} /> : <MapPin size={11} />}
            {order.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup"}
          </span>
        </div>
      </div>

      {/* Order summary */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Summary</p>
        {order.items && order.items.length > 0 ? (
          <div className="space-y-1.5 mb-3">
            {order.items.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 flex-1 truncate">{m.medicineName} ×{m.quantity}</span>
                {m.unitPrice != null && (
                  <span className="font-semibold text-slate-700 ml-2 shrink-0">
                    RWF {(m.unitPrice * m.quantity).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : null}
        <div className="border-t border-slate-100 pt-2 space-y-1">
          {subtotal > 0 && (
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>RWF {subtotal.toLocaleString()}</span>
            </div>
          )}
          {deliveryFee > 0 && (
            <div className="flex justify-between text-xs text-slate-500">
              <span>Delivery fee</span>
              <span>RWF {deliveryFee.toLocaleString()}</span>
            </div>
          )}
          {insuranceDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600">
              <span>Insurance discount</span>
              <span>− RWF {insuranceDiscount.toLocaleString()}</span>
            </div>
          )}
          {order.totalAmount != null && (
            <div className="flex justify-between text-sm font-bold text-slate-800 pt-1 border-t border-slate-100">
              <span>Total</span>
              <span>RWF {(order.patientPayableAmount ?? order.totalAmount).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subLoading, setSubLoading] = useState<Record<number, boolean>>({});
  const [subError, setSubError] = useState<Record<number, string>>({});
  const [payLoading, setPayLoading] = useState<Record<number, boolean>>({});
  const [payError, setPayError] = useState<Record<number, string>>({});
  const [paymentDetails, setPaymentDetails] = useState<Record<number, PaymentResponse>>({});
  const [userId, setUserId] = useState<number | null>(null);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  useEffect(() => { setUserId(getUserId()); }, []);

  // Real-time order status updates via WebSocket
  useOrderWebSocket(userId, (payload) => {
    if (payload.type === "ORDER_STATUS_UPDATE") {
      const updated = payload.order as OrderResponse | undefined;
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
        );
      }
      const msg = payload.message as string | undefined;
      if (msg) {
        setLiveAlert(msg);
        setTimeout(() => setLiveAlert(null), 6000);
      }
    } else if (payload.type === "SUBSTITUTION_REQUEST") {
      // Reload substitutions when pharmacist suggests one
      load();
    }
  });

  const load = async () => {
    setLoading(true);
    try {
      const [ordPage, subs] = await Promise.all([
        getMyOrders(0, 50).catch(() => ({ content: [] as OrderResponse[], totalElements: 0, totalPages: 0, number: 0, size: 50 })),
        getPendingSubstitutions().catch((): SubstitutionResponse[] => []),
      ]);
      setOrders([...ordPage.content].sort((a, b) => b.id - a.id));
      setSubstitutions(subs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (subId: number) => {
    setSubLoading((p) => ({ ...p, [subId]: true }));
    setSubError((p) => ({ ...p, [subId]: "" }));
    try {
      await approveSubstitution(subId);
      setSubstitutions((prev) => prev.filter((s) => s.id !== subId));
    } catch (err) {
      setSubError((p) => ({ ...p, [subId]: err instanceof Error ? err.message : "Failed" }));
    } finally {
      setSubLoading((p) => ({ ...p, [subId]: false }));
    }
  };

  const handleReject = async (subId: number) => {
    setSubLoading((p) => ({ ...p, [subId]: true }));
    setSubError((p) => ({ ...p, [subId]: "" }));
    try {
      await rejectSubstitution(subId, "Patient declined substitution");
      setSubstitutions((prev) => prev.filter((s) => s.id !== subId));
    } catch (err) {
      setSubError((p) => ({ ...p, [subId]: err instanceof Error ? err.message : "Failed" }));
    } finally {
      setSubLoading((p) => ({ ...p, [subId]: false }));
    }
  };

  const handlePay = async (orderId: number) => {
    setPayLoading((p) => ({ ...p, [orderId]: true }));
    setPayError((p) => ({ ...p, [orderId]: "" }));
    try {
      const updated = await confirmPayment(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      setPayError((p) => ({ ...p, [orderId]: err instanceof Error ? err.message : "Payment failed" }));
    } finally {
      setPayLoading((p) => ({ ...p, [orderId]: false }));
    }
  };

  const handleLoadPaymentDetails = async (orderId: number) => {
    if (paymentDetails[orderId]) return;
    try {
      const details = await getPaymentDetails(orderId);
      setPaymentDetails((p) => ({ ...p, [orderId]: details }));
    } catch {
      // payment details not available yet
    }
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "ALL") list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          String(o.id).includes(q) ||
          o.items?.some((m) => m.medicineName.toLowerCase().includes(q)) ||
          o.pharmacyName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  const statuses = ["ALL", "UPLOADED", "MATCHING", "ASSIGNED", "IN_PROGRESS", "STOCK_CONFIRMED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];
  const statusDisplayLabel: Record<string, string> = {
    UPLOADED: "Received", MATCHING: "Finding Pharmacy", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress",
    STOCK_CONFIRMED: "Confirmed", READY_FOR_PICKUP: "Ready", OUT_FOR_DELIVERY: "Delivering",
    COMPLETED: "Completed", CANCELLED: "Cancelled",
  };

  return (
    <PatientAppShell>
      {liveAlert && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 shadow-sm animate-pulse">
          <RefreshCw size={15} className="shrink-0 text-teal-600" />
          <span>{liveAlert}</span>
        </div>
      )}

      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Order Tracking</h1>
          <p className="mt-2 text-base text-slate-500">Monitor your orders and manage substitutions.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </section>

      {/* ── Substitutions section (image 4 style) ── */}
      {substitutions.length > 0 && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Pill className="h-5 w-5 text-violet-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Suggested Substitutions</h2>
              <p className="text-xs text-slate-500 mt-0.5">A pharmacist reviewed these alternatives for your order.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {substitutions.map((sub) => (
              <div key={sub.id} className="p-5">
                {/* OUT OF STOCK / PHARMACIST SUGGESTS header */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Out of Stock</p>
                    <p className="font-bold text-slate-800 text-sm leading-tight">{sub.originalMedicineName}</p>
                    <p className="text-xs text-rose-400 mt-0.5">Order #{sub.orderId}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Pharmacist Suggests</p>
                    <p className="font-bold text-slate-800 text-sm leading-tight">{sub.substituteMedicineName}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Review and accept below</p>
                  </div>
                </div>

                {/* Alternative detail row */}
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{sub.substituteMedicineName}</p>
                    {sub.pharmacistReason && (
                      <p className="text-xs text-slate-500 mt-0.5 italic">&ldquo;{sub.pharmacistReason}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {subError[sub.id] && (
                      <p className="text-xs text-rose-600">{subError[sub.id]}</p>
                    )}
                    <button
                      onClick={() => handleReject(sub.id)}
                      disabled={subLoading[sub.id]}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 disabled:opacity-50 transition"
                    >
                      {subLoading[sub.id] ? <Loader2 className="animate-spin" size={11} /> : <X size={11} />}
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(sub.id)}
                      disabled={subLoading[sub.id]}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition"
                    >
                      {subLoading[sub.id] ? <Loader2 className="animate-spin" size={11} /> : <Check size={11} />}
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        {/* Status filter chips */}
        <div className="mb-4 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition border ${
                statusFilter === s
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-teal-200"
              }`}
            >
              {s === "ALL" ? `All (${orders.length})` : (statusDisplayLabel[s] ?? s)}
            </button>
          ))}
        </div>

        <div className="mb-5 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by ID, medicine, or pharmacy…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
              <Loader2 className="animate-spin" size={22} />
              <span>Loading orders…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ClipboardList size={36} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No orders found.</p>
            </div>
          ) : (
            filtered.map((order) => (
              <article
                key={order.id}
                className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] overflow-hidden"
              >
                {/* Order card header */}
                <div
                  className="flex cursor-pointer items-start gap-4 px-5 py-4 hover:bg-slate-50/60 transition"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800">
                        {order.items && order.items.length > 0
                          ? order.items.map((m) => m.medicineName).join(", ")
                          : "Order"}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_TONE[order.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {order.pharmacyName ?? "Awaiting pharmacy assignment"}
                      {order.branchName && order.branchName !== order.pharmacyName && (
                        <span className="text-xs text-slate-400 ml-1">— {order.branchName}</span>
                      )}
                      {" · "}
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Truck size={11} />
                        {order.fulfillmentType}
                      </span>
                      {order.totalAmount != null && (
                        <span>RWF {(order.patientPayableAmount ?? order.totalAmount).toLocaleString()}</span>
                      )}
                      <span className="font-semibold tracking-wide">#{order.id}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-slate-400 mt-1">
                    {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded content */}
                {expandedId === order.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                    {/* Progress tracker */}
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Progress</p>
                    <OrderTimeline status={order.status} />

                    {/* Order details panel */}
                    <OrderDetailsPanel order={order} />

                    {/* Prescription link */}
                    {order.prescriptionUrl && (
                      <a
                        href={order.prescriptionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet-50 border border-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition"
                      >
                        View Prescription
                      </a>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div className="mt-3 rounded-xl bg-white border border-slate-100 px-3 py-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Notes</p>
                        <p className="text-sm text-slate-600">{order.notes}</p>
                      </div>
                    )}

                    {/* Payment section */}
                    {order.status === "READY_FOR_PICKUP" && (() => {
                      const ps = order.paymentStatus;
                      const paid = ps === "PAID";
                      const insurancePending = ps === "INSURANCE_PENDING";
                      const needsPay = !paid && !insurancePending && order.totalAmount != null;
                      const payableAmount = order.patientPayableAmount ?? order.totalAmount ?? 0;

                      if (paid) return (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                          <p className="text-sm font-semibold text-emerald-700">Payment completed. Your order will be delivered shortly.</p>
                        </div>
                      );

                      if (insurancePending) return (
                        <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={16} className="text-sky-600 shrink-0" />
                            <p className="text-sm font-bold text-sky-800">Insurance claim in progress</p>
                          </div>
                          <p className="text-xs text-sky-700">
                            Your insurance provider is processing the claim. No payment action required right now.
                          </p>
                        </div>
                      );

                      if (needsPay) return (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                              <p className="text-sm font-bold text-emerald-900">Payment Due</p>
                              <p className="text-xl font-bold text-emerald-700 mt-0.5">
                                RWF {payableAmount.toLocaleString()}
                              </p>
                              {order.coveragePercentage != null && order.coveragePercentage > 0 && (
                                <p className="text-xs text-emerald-600 mt-0.5">
                                  Insurance covers {order.coveragePercentage}% · your share only
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handlePay(order.id)}
                              disabled={payLoading[order.id]}
                              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition shadow-sm"
                            >
                              {payLoading[order.id] ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                              {payLoading[order.id] ? "Processing…" : "Pay Now"}
                            </button>
                          </div>
                          {payError[order.id] && (
                            <p className="mt-2 text-xs text-rose-600 font-semibold">{payError[order.id]}</p>
                          )}
                        </div>
                      );

                      return null;
                    })()}

                    {(order.status === "COMPLETED" || order.status === "READY_FOR_PICKUP") && (
                      <button
                        onClick={() => handleLoadPaymentDetails(order.id)}
                        className="mt-3 text-xs font-semibold text-slate-500 hover:text-teal-600 transition underline underline-offset-2"
                      >
                        View payment details
                      </button>
                    )}

                    {paymentDetails[order.id] && (
                      <div className="mt-2 rounded-xl bg-white border border-slate-100 px-4 py-3 text-sm space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Details</p>
                        <div className="flex justify-between text-slate-600">
                          <span>Total Amount</span>
                          <span className="font-semibold text-slate-800">RWF {paymentDetails[order.id].totalAmount.toLocaleString()}</span>
                        </div>
                        {paymentDetails[order.id].insuranceAmount > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>Insurance covers</span>
                            <span className="font-semibold text-emerald-700">− RWF {paymentDetails[order.id].insuranceAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>Your share</span>
                          <span className="font-bold text-slate-800">RWF {paymentDetails[order.id].patientAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Status</span>
                          <span className={`font-bold ${
                            paymentDetails[order.id].status === "PAID" ? "text-emerald-600" :
                            paymentDetails[order.id].status === "INSURANCE_PENDING" ? "text-sky-600" :
                            "text-amber-600"
                          }`}>
                            {paymentDetails[order.id].status === "INSURANCE_PENDING" ? "Insurance processing" : paymentDetails[order.id].status}
                          </span>
                        </div>
                        {paymentDetails[order.id].insuranceProvider && (
                          <div className="flex justify-between text-slate-600">
                            <span>Insurance</span>
                            <span className="font-semibold text-slate-800">{paymentDetails[order.id].insuranceProvider}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>Date</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(paymentDetails[order.id].createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        <p className="mt-4 text-xs text-slate-400 text-center">
          {filtered.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </section>
    </PatientAppShell>
  );
}
