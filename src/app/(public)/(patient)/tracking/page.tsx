"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
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
  UPLOADED: "Received", MATCHING: "Matching", ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress", STOCK_CONFIRMED: "Confirmed",
  READY_FOR_PICKUP: "Ready", OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed", CANCELLED: "Cancelled",
};

const ORDER_STEPS = ["UPLOADED", "ASSIGNED", "IN_PROGRESS", "STOCK_CONFIRMED", "READY_FOR_PICKUP", "COMPLETED"];

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = ORDER_STEPS.indexOf(status);
  const isCancelled = status === "CANCELLED";

  return (
    <div className="mt-4 flex items-start gap-1 overflow-x-auto pb-1">
      {ORDER_STEPS.map((step, idx) => {
        const done = !isCancelled && currentIdx >= idx;
        const active = !isCancelled && currentIdx === idx;
        return (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "bg-white border-slate-200 text-slate-400"
                } ${active ? "ring-2 ring-teal-300 ring-offset-1" : ""}`}
              >
                {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              </div>
              <span className={`text-[10px] font-semibold capitalize whitespace-nowrap ${done ? "text-teal-700" : "text-slate-400"}`}>
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            </div>
            {idx < ORDER_STEPS.length - 1 && (
              <div className={`h-0.5 w-8 mb-4 rounded-full ${done && currentIdx > idx ? "bg-teal-600" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
      {isCancelled && (
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 self-start mt-1">
          Cancelled
        </span>
      )}
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

  const load = async () => {
    setLoading(true);
    try {
      const [ordPage, subs] = await Promise.all([
        getMyOrders(0, 50).catch(() => ({ content: [] as OrderResponse[], totalElements: 0, totalPages: 0, number: 0, size: 50 })),
        getPendingSubstitutions().catch((): SubstitutionResponse[] => []),
      ]);
      setOrders(ordPage.content);
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

  return (
    <PatientAppShell>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Order Tracking</h1>
          <p className="mt-2 text-base text-slate-500">Monitor all your orders and manage substitutions.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </section>

      {substitutions.length > 0 && (
        <section className="mt-6 rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-bold text-violet-900">
              Pending Substitutions ({substitutions.length})
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {substitutions.map((sub) => (
              <div key={sub.id} className="rounded-2xl bg-white border border-violet-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Order #{sub.orderId}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="line-through text-rose-500">{sub.originalMedicineName}</span>
                      {" → "}
                      <span className="text-emerald-700 font-semibold">{sub.substituteMedicineName}</span>
                    </p>
                    {sub.pharmacistReason && (
                      <p className="text-xs text-slate-400 mt-1 italic">&ldquo;{sub.pharmacistReason}&rdquo;</p>
                    )}
                  </div>
                  <Pill className="h-5 w-5 text-violet-400 shrink-0" />
                </div>
                {subError[sub.id] && (
                  <p className="text-xs text-rose-600 mb-2">{subError[sub.id]}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(sub.id)}
                    disabled={subLoading[sub.id]}
                    className="flex-1 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50 transition"
                  >
                    {subLoading[sub.id] ? <Loader2 className="inline animate-spin" size={12} /> : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(sub.id)}
                    disabled={subLoading[sub.id]}
                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
                  >
                    {subLoading[sub.id] ? <Loader2 className="inline animate-spin" size={12} /> : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
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
              {s === "ALL" ? `All (${orders.length})` : s}
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
                      {" · "}
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Truck size={11} />
                        {order.fulfillmentType}
                      </span>
                      {order.totalAmount != null && (
                        <span>RWF {order.totalAmount.toLocaleString()}</span>
                      )}
                      <span className="font-semibold tracking-wide">#{order.id}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-slate-400 mt-1">
                    {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Progress</p>
                    <OrderTimeline status={order.status} />

                    {order.items && order.items.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medicines</p>
                        <div className="space-y-1">
                          {order.items.map((m, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-3 py-2 text-sm">
                              <span className="font-semibold text-slate-800">{m.medicineName}</span>
                              <div className="flex items-center gap-3 text-slate-500">
                                <span>x{m.quantity}</span>
                                {m.unitPrice != null && <span className="font-semibold text-slate-700">RWF {m.unitPrice.toLocaleString()}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.notes && (
                      <div className="mt-3 rounded-xl bg-white border border-slate-100 px-3 py-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Notes</p>
                        <p className="text-sm text-slate-600">{order.notes}</p>
                      </div>
                    )}

                    {order.prescriptionUrl && (
                      <a
                        href={order.prescriptionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-teal-50 border border-teal-100 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition"
                      >
                        View Prescription
                      </a>
                    )}

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
                            Your insurance provider is processing the claim for this order. No payment action is required from you right now.
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
                              <p className="text-xs text-emerald-600 mt-0.5">Your medicines are ready — confirm payment to complete your order.</p>
                            </div>
                            <button
                              onClick={() => handlePay(order.id)}
                              disabled={payLoading[order.id]}
                              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition shadow-sm"
                            >
                              {payLoading[order.id]
                                ? <Loader2 className="animate-spin" size={16} />
                                : <CreditCard size={16} />}
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
