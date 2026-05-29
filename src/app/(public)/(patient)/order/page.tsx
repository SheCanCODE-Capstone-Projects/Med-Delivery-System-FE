"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  FileUp,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  UploadCloud,
  X
} from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { createOrder, uploadPrescription, getMyInsuranceCards, getAllLocations, confirmPayment } from "@/services/patientApi";
import type { InsuranceCardResponse, PatientLocationResponse } from "@/types/api";

type MedicineItem = { id: string; medicine: string; quantity: number };

export default function OrderingForm() {
  const [requestType, setRequestType] = useState<"private" | "prescription">("prescription");
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [items, setItems] = useState<MedicineItem[]>([{ id: "item-1", medicine: "", quantity: 1 }]);
  const [notes, setNotes] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);

  const [insuranceCards, setInsuranceCards] = useState<InsuranceCardResponse[]>([]);
  const [locations, setLocations] = useState<PatientLocationResponse[]>([]);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | "">("");
  const [selectedLocationId, setSelectedLocationId] = useState<number | "">("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const prescriptionInputRef = useRef<HTMLInputElement | null>(null);
  const nextIdRef = useRef(2);

  useEffect(() => {
    getMyInsuranceCards().catch(() => []).then(setInsuranceCards);
    getAllLocations().catch((): PatientLocationResponse[] => []).then((locs) => {
      setLocations(locs);
      const def = locs.find((l) => l.isDefault);
      if (def) setSelectedLocationId(def.id);
    });
  }, []);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setFormError("");

    const medicines = items.filter((i) => i.medicine.trim()).map((i) => ({
      medicineName: i.medicine.trim(),
      quantity: i.quantity as number,
    }));

    if (requestType === "prescription" && !prescriptionFile) {
      setFormError("Upload a prescription file before submitting.");
      return;
    }
    if (requestType === "private" && medicines.length === 0 && !notes.trim()) {
      setFormError("Enter at least one medicine name or add notes.");
      return;
    }

    setSubmitting(true);
    try {
      let prescriptionId: number | undefined;
      if (prescriptionFile) {
        const rx = await uploadPrescription(prescriptionFile);
        prescriptionId = rx.id;
      }

      const selectedLoc = typeof selectedLocationId === "number"
        ? locations.find((l) => l.id === selectedLocationId)
        : undefined;

      const order = await createOrder({
        orderType: requestType === "prescription" ? "PRESCRIPTION_BASED" : "PRIVATE_PURCHASE",
        fulfillmentType: fulfillment,
        prescriptionId,
        insuranceCardId: typeof selectedInsuranceId === "number" ? selectedInsuranceId : undefined,
        items: requestType === "private"
          ? medicines.map((m) => ({ medicineName: m.medicineName, quantity: m.quantity }))
          : [],
        deliveryAddress: fulfillment === "DELIVERY"
          ? (selectedLoc?.manualAddress ?? locations.find((l) => l.isDefault)?.manualAddress)
          : undefined,
        notes: notes || undefined,
      });

      setOrderId(order.id);
      setSubmitted(true);
      setShowPayment(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    return digits.length >= 3 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
  };

  const handlePayNow = async () => {
    if (!orderId) return;
    if (!cardNumber.replace(/\s/g, "") || cardNumber.replace(/\s/g, "").length < 16) {
      setPaymentError("Enter a valid 16-digit card number.");
      return;
    }
    if (!cardName.trim()) { setPaymentError("Enter the name on card."); return; }
    if (!cardExpiry || cardExpiry.length < 5) { setPaymentError("Enter a valid expiry date."); return; }
    if (!cardCvv || cardCvv.length < 3) { setPaymentError("Enter a valid CVV."); return; }

    setPaying(true);
    setPaymentError("");
    try {
      await confirmPayment(orderId);
      setPaymentDone(true);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const updateItem = (id: string, key: "medicine" | "quantity", value: string | number) =>
    setItems((cur) => cur.map((item) => (item.id === id ? { ...item, [key]: value } : item)));

  const fileSize = prescriptionFile ? `${(prescriptionFile.size / 1024 / 1024).toFixed(2)} MB` : "";

  return (
    <PatientAppShell>
      <div className="grid gap-6 xl:grid-cols-[0.58fr_1.42fr]">
        <aside className="rounded-3xl border border-teal-100 bg-teal-50 p-6 text-teal-950 shadow-[0_24px_60px_rgba(15,118,110,0.12)]">
          <span className="inline-flex min-h-8 items-center rounded-full border border-teal-200 bg-white/70 px-4 text-xs font-semibold text-teal-700">
            Medicine request
          </span>
          <h1 className="mt-5 text-[2.35rem] leading-none font-semibold tracking-tight">Start an order safely.</h1>
          <p className="mt-4 text-sm leading-6 text-teal-800">
            Choose private purchase or prescription flow. The system matches nearby pharmacies by distance, coverage, and medicine availability.
          </p>
          <div className="mt-7 grid gap-3">
            {[
              { icon: FileUp, title: "Upload", text: "Add prescription PDF or image when required." },
              { icon: Search, title: "Match", text: "Nearby pharmacies respond with stock and prices." },
              { icon: ShieldCheck, title: "Validate", text: "Insurance and prescription checks stay visible." },
              { icon: Truck, title: "Fulfill", text: "Choose delivery or pickup before payment." }
            ].map((step) => (
              <div key={step.title} className="grid grid-cols-[auto_1fr] gap-3 rounded-3xl border border-teal-100 bg-white/70 p-4 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-100 text-teal-700">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold">{step.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-teal-700">{step.text}</span>
                </span>
              </div>
            ))}
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-7">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">Order details</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">What do you need today?</h2>
          </div>

          {submitted && orderId && (
            <div role="status" className="mt-5 grid gap-3 rounded-3xl border border-teal-100 bg-teal-50 px-4 py-4 text-sm text-teal-900 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-bold">Order #{orderId} submitted!</p>
                <p className="mt-1 text-teal-700">{paymentDone ? "Payment confirmed. Your order is being processed." : "Complete payment to confirm your order."}</p>
              </div>
              {paymentDone ? (
                <Link href="/tracking" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-teal-600 px-4 font-bold text-white">
                  Track order
                </Link>
              ) : (
                <button type="button" onClick={() => setShowPayment(true)}
                  className="inline-flex min-h-11 items-center gap-2 justify-center rounded-2xl bg-teal-600 px-4 font-bold text-white">
                  <CreditCard className="h-4 w-4" /> Pay now
                </button>
              )}
            </div>
          )}

          {formError && (
            <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {formError}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { id: "prescription", title: "Prescription based", text: "Upload doctor prescription and let pharmacists validate." },
              { id: "private", title: "Private purchase", text: "Request medicine or describe symptoms for pharmacy review." }
            ].map((option) => (
              <button key={option.id} type="button"
                onClick={() => setRequestType(option.id as "private" | "prescription")}
                className={`rounded-3xl border p-4 text-left transition ${requestType === option.id ? "border-teal-300 bg-teal-50 text-teal-950 shadow-[0_14px_30px_rgba(14,165,160,0.12)]" : "border-slate-200 bg-white text-slate-700 hover:border-teal-200"}`}>
                <span className="font-bold">{option.title}</span>
                <span className="mt-2 block text-sm leading-5 text-slate-500">{option.text}</span>
              </button>
            ))}
          </div>

          {requestType === "prescription" ? (
            <div className="mt-5 grid gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Prescription file</span>
                <span className={`grid min-h-36 cursor-pointer place-items-center rounded-3xl border border-dashed px-4 text-center transition ${prescriptionFile ? "border-teal-300 bg-teal-50 text-teal-800" : "border-teal-200 bg-white text-slate-500 hover:border-teal-300 hover:bg-teal-50/60"}`}>
                  {prescriptionFile ? (
                    <span className="grid justify-items-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-teal-600" />
                      <span className="max-w-full break-all text-sm font-bold text-slate-900">{prescriptionFile.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{fileSize} - ready to upload</span>
                    </span>
                  ) : (
                    <span className="grid justify-items-center gap-2">
                      <UploadCloud className="h-9 w-9 text-teal-600" />
                      <span className="text-sm font-bold text-slate-700">Click here to choose prescription file</span>
                      <span className="text-xs text-slate-500">PDF, JPG, or JPEG</span>
                    </span>
                  )}
                  <input ref={prescriptionInputRef} type="file" accept=".pdf,.jpg,.jpeg,image/jpeg,application/pdf"
                    className="sr-only"
                    onChange={(e) => { setPrescriptionFile(e.target.files?.[0] ?? null); setSubmitted(false); setFormError(""); }} />
                </span>
              </label>
              {prescriptionFile && (
                <button type="button" onClick={() => { setPrescriptionFile(null); if (prescriptionInputRef.current) prescriptionInputRef.current.value = ""; }}
                  className="inline-flex min-h-11 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-rose-200 hover:text-rose-600">
                  <X className="h-4 w-4" /> Remove file
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Notes / Symptoms</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                  placeholder="Describe symptoms if you do not know the medicine name"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
              </label>
            </div>
          )}

          {requestType === "private" && (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">Medicines</h3>
                <button type="button"
                  onClick={() => setItems((cur) => [...cur, { id: `item-${nextIdRef.current++}`, medicine: "", quantity: 1 }])}
                  className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 text-sm font-bold text-teal-700">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="mt-3 grid gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-3xl border border-slate-100 bg-white p-3">
                    <label className="flex-1 grid gap-2 min-w-0">
                      <span className="text-xs font-bold text-slate-500">Medicine name</span>
                      <div className="relative">
                        <Pill className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600" />
                        <input value={item.medicine} onChange={(e) => updateItem(item.id, "medicine", e.target.value)}
                          placeholder="e.g. Amoxicillin 500mg"
                          className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
                      </div>
                    </label>
                    <label className="w-24 shrink-0 grid gap-2">
                      <span className="text-xs font-bold text-slate-500">Qty</span>
                      <input type="number" min={1} value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
                    </label>
                    <div className="shrink-0 grid gap-2">
                      <span className="text-xs font-bold text-transparent select-none">x</span>
                      <button type="button" aria-label="Remove medicine"
                        onClick={() => setItems((cur) => cur.filter((i) => i.id !== item.id))}
                        className="min-h-12 w-12 grid place-items-center rounded-2xl border border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-600">
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {requestType === "prescription" && insuranceCards.some((c) => c.status === "VERIFIED") && (
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Insurance card</span>
                <select value={selectedInsuranceId} onChange={(e) => setSelectedInsuranceId(e.target.value ? Number(e.target.value) : "")}
                  className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15">
                  <option value="">No insurance</option>
                  {insuranceCards.filter((c) => c.status === "VERIFIED").map((c) => (
                    <option key={c.id} value={c.id}>{c.providerName} — {c.memberId} ✓ ({c.coveragePercentage}% covered)</option>
                  ))}
                </select>
              </label>
            )}
            <div className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Fulfillment</span>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                {[{ id: "DELIVERY", label: "Delivery", icon: Truck }, { id: "PICKUP", label: "Pickup", icon: MapPin }].map((mode) => (
                  <button key={mode.id} type="button" onClick={() => setFulfillment(mode.id as "DELIVERY" | "PICKUP")}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${fulfillment === mode.id ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>
                    <mode.icon className="h-4 w-4" /> {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {fulfillment === "DELIVERY" && (
            <div className="mt-4 grid gap-2">
              <span className="text-sm font-bold text-slate-700">Delivery location</span>
              {locations.length > 0 ? (
                <select value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : "")}
                  className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15">
                  <option value="">Select a location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label ? `${l.label} — ${l.manualAddress || ""}` : (l.manualAddress || "—")}{l.isDefault ? " (default)" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                  No delivery locations saved.{" "}
                  <a href="/locations" className="font-bold underline">Add one now</a> before placing a delivery order.
                </p>
              )}
            </div>
          )}

          <div className="mt-8">
            <button type="submit" disabled={submitting || submitted}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              {submitting ? "Submitting..." : submitted ? "Order Submitted" : "Submit Order"}
            </button>
          </div>
        </form>
      </div>
      {/* Payment Modal */}
      {showPayment && !paymentDone && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-600">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">Secure payment</p>
                  <p className="text-xs text-slate-500">Order #{orderId}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowPayment(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {/* Card number */}
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-slate-600">Card number</span>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 font-mono outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
                </div>
              </label>

              {/* Name on card */}
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-slate-600">Name on card</span>
                <input type="text" placeholder="JOHN DOE"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-mono uppercase outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
              </label>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-600">Expiry</span>
                  <input type="text" inputMode="numeric" placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-mono outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-600">CVV</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="password" inputMode="numeric" placeholder="•••" maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 font-mono outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
                  </div>
                </label>
              </div>

              {paymentError && (
                <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700">
                  {paymentError}
                </p>
              )}

              <button type="button" onClick={handlePayNow} disabled={paying}
                className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_14px_28px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {paying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                {paying ? "Processing…" : "Pay now"}
              </button>

              <p className="text-center text-xs text-slate-400">
                <Lock className="inline h-3 w-3" /> SSL encrypted · Demo only · No real charge
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment success overlay */}
      {paymentDone && showPayment && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl border border-teal-100 bg-white p-8 text-center shadow-2xl">
            <span className="inline-grid h-16 w-16 place-items-center rounded-full bg-teal-50">
              <CheckCircle2 className="h-9 w-9 text-teal-600" />
            </span>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Payment confirmed!</h3>
            <p className="mt-2 text-sm text-slate-500">Order #{orderId} is now being prepared by your matched pharmacy.</p>
            <div className="mt-6 grid gap-3">
              <Link href="/tracking"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 font-bold text-white">
                Track your order
              </Link>
              <button type="button" onClick={() => setShowPayment(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 font-bold text-slate-600">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientAppShell>
  );
}
