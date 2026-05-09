"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileUp, MapPin, Minus, Pill, Plus, Search, ShieldCheck, Truck, UploadCloud, X } from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";

type MedicineItem = {
  id: string;
  medicine: string;
  quantity: number;
};

export default function OrderingForm() {
  const [requestType, setRequestType] = useState<"private" | "prescription">("prescription");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [items, setItems] = useState<MedicineItem[]>([{ id: "item-1", medicine: "Paracetamol 500mg", quantity: 1 }]);
  const [symptoms, setSymptoms] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [formError, setFormError] = useState("");
  const nextItemIdRef = useRef(2);
  const prepareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSubmit = useMemo(() => {
    const hasMedicine = items.some((item) => item.medicine.trim().length > 0);
    return requestType === "prescription" ? Boolean(prescriptionFile) : hasMedicine || symptoms.trim().length > 0;
  }, [items, prescriptionFile, requestType, symptoms]);

  const fileSize = prescriptionFile ? `${(prescriptionFile.size / 1024 / 1024).toFixed(2)} MB` : "";

  useEffect(() => {
    return () => {
      if (prepareTimerRef.current) {
        clearTimeout(prepareTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!canSubmit) {
      setFormError(
        requestType === "prescription"
          ? "Upload a prescription file before preparing this request."
          : "Enter a medicine name or describe symptoms before preparing this request."
      );
      return;
    }

    if (prepareTimerRef.current) {
      clearTimeout(prepareTimerRef.current);
    }

    setIsPreparing(true);
    prepareTimerRef.current = setTimeout(() => {
      setRequestId(`ORD-${Math.floor(2800 + Math.random() * 300)}`);
      setSubmitted(true);
      setIsPreparing(false);
      prepareTimerRef.current = null;
    }, 650);
  };

  const updateItem = (id: string, key: "medicine" | "quantity", value: string | number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  return (
    <PatientAppShell>
      <div className="grid gap-6 xl:grid-cols-[0.58fr_1.42fr]">
        <aside className="rounded-3xl bg-[linear-gradient(180deg,#11192f_0%,#0b1326_100%)] p-6 text-white shadow-[0_24px_60px_rgba(11,19,39,0.18)]">
          <span className="inline-flex min-h-8 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold text-teal-100">
            Medicine request
          </span>
          <h1 className="mt-5 text-[2.35rem] leading-none font-semibold tracking-tight">Start an order safely.</h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Choose private purchase or prescription flow. The system matches nearby pharmacies by distance, coverage, and medicine availability.
          </p>

          <div className="mt-7 grid gap-3">
            {[
              { icon: FileUp, title: "Upload", text: "Add prescription PDF or image when required." },
              { icon: Search, title: "Match", text: "Nearby pharmacies respond with stock and prices." },
              { icon: ShieldCheck, title: "Validate", text: "Insurance and prescription checks stay visible." },
              { icon: Truck, title: "Fulfill", text: "Choose delivery or pickup before payment." }
            ].map((step) => (
              <div key={step.title} className="grid grid-cols-[auto_1fr] gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-400/15 text-teal-300">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold">{step.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-white/60">{step.text}</span>
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

          {submitted ? (
            <div role="status" className="mt-5 grid gap-3 rounded-3xl border border-teal-100 bg-teal-50 px-4 py-4 text-sm text-teal-900 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-bold">Request prepared successfully</p>
                <p className="mt-1 text-teal-700">
                  Demo request <span className="font-bold">{requestId}</span> is ready to review and track.
                </p>
              </div>
              <Link href="/tracking" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-teal-600 px-4 font-bold text-white">
                Track request
              </Link>
            </div>
          ) : null}

          {formError ? (
            <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {formError}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { id: "prescription", title: "Prescription based", text: "Upload doctor prescription and let pharmacists validate." },
              { id: "private", title: "Private purchase", text: "Request medicine or describe symptoms for pharmacy review." }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRequestType(option.id as "private" | "prescription")}
                className={`rounded-3xl border p-4 text-left transition ${
                  requestType === option.id
                    ? "border-teal-300 bg-teal-50 text-teal-950 shadow-[0_14px_30px_rgba(14,165,160,0.12)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-200"
                }`}
              >
                <span className="font-bold">{option.title}</span>
                <span className="mt-2 block text-sm leading-5 text-slate-500">{option.text}</span>
              </button>
            ))}
          </div>

          {requestType === "prescription" ? (
            <div className="mt-5 grid gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Prescription file</span>
                <span className={`grid min-h-36 cursor-pointer place-items-center rounded-3xl border border-dashed px-4 text-center transition ${
                  prescriptionFile
                    ? "border-teal-300 bg-teal-50 text-teal-800"
                    : "border-teal-200 bg-white text-slate-500 hover:border-teal-300 hover:bg-teal-50/60"
                }`}>
                  {prescriptionFile ? (
                    <span className="grid justify-items-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-teal-600" aria-hidden="true" />
                      <span className="max-w-full break-all text-sm font-bold text-slate-900">{prescriptionFile.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{fileSize} - ready to upload</span>
                    </span>
                  ) : (
                    <span className="grid justify-items-center gap-2">
                      <UploadCloud className="h-9 w-9 text-teal-600" aria-hidden="true" />
                      <span className="text-sm font-bold text-slate-700">Click here to choose prescription file</span>
                      <span className="text-xs text-slate-500">PDF, JPG, or JPEG</span>
                    </span>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,image/jpeg,application/pdf"
                    className="sr-only"
                    onChange={(event) => {
                      setPrescriptionFile(event.target.files?.[0] ?? null);
                      setSubmitted(false);
                      setFormError("");
                    }}
                  />
                </span>
              </label>
              {prescriptionFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setPrescriptionFile(null);
                    setSubmitted(false);
                    setFormError("");
                  }}
                  className="inline-flex min-h-11 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove file
                </button>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">Prescription date</span>
                  <input type="date" className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                  <input type="checkbox" className="h-4 w-4 accent-teal-600" />
                  <span className="text-sm font-bold text-slate-700">Has stamp</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                  <input type="checkbox" className="h-4 w-4 accent-teal-600" />
                  <span className="text-sm font-bold text-slate-700">Has signature</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Symptoms</span>
                <textarea
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  rows={4}
                  placeholder="Describe symptoms if you do not know the medicine name"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                />
              </label>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">Medicines</h3>
              <button
                type="button"
                onClick={() =>
                  setItems((current) => [
                    ...current,
                    { id: `item-${nextItemIdRef.current++}`, medicine: "", quantity: 1 }
                  ])
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 text-sm font-bold text-teal-700"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              {items.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-3xl border border-slate-100 bg-white p-3 sm:grid-cols-[1fr_8rem_auto]">
                  <label className="grid gap-2">
                    <span className="text-xs font-bold text-slate-500">Medicine name</span>
                    <div className="relative">
                      <Pill className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600" aria-hidden="true" />
                      <input
                        value={item.medicine}
                        onChange={(event) => updateItem(item.id, "medicine", event.target.value)}
                        placeholder="Search medicine"
                        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                      />
                    </div>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold text-slate-500">Quantity</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => updateItem(item.id, "quantity", Number(event.target.value))}
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                    />
                  </label>
                  <button
                    type="button"
                    aria-label="Remove medicine"
                    onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}
                    className="grid min-h-12 place-items-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:text-rose-600 sm:self-end"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {requestType === "prescription" ? (
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">Insurance card</span>
                <select className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15">
                  <option>BlueCross - verified 80%</option>
                  <option>No insurance</option>
                  <option>Pending insurance card</option>
                </select>
              </label>
            ) : (
              <div /> /* Empty div to preserve grid layout if needed, or we can just let it span */
            )}
            <div className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">Fulfillment</span>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                {[
                  { id: "delivery", label: "Delivery", icon: Truck },
                  { id: "pickup", label: "Pickup", icon: MapPin }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFulfillment(mode.id as "delivery" | "pickup")}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                      fulfillment === mode.id ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <mode.icon className="h-4 w-4" aria-hidden="true" />
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {fulfillment === "delivery" ? (
            <label className="mt-4 grid gap-2">
              <span className="text-sm font-bold text-slate-700">Delivery address</span>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600" aria-hidden="true" />
                <input
                  placeholder="Street, city, state"
                  className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                />
              </div>
            </label>
          ) : null}

          <div className="mt-6 grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold text-slate-500">Pharmacy match</p>
              <p className="mt-1 font-bold text-slate-900">{requestType === "private" ? "Distance only" : "Distance + coverage"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">Payment split</p>
              <p className="mt-1 font-bold text-slate-900">{requestType === "private" ? "100% Patient" : "$10 patient / $40 insurance"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">Substitutions</p>
              <p className="mt-1 font-bold text-slate-900">Approval required</p>
            </div>
          </div>

          <div className="sticky bottom-0 z-20 -mx-5 mt-6 border-t border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur-xl sm:-mx-7 sm:px-7">
            <button
              type="submit"
              disabled={isPreparing}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              {isPreparing ? "Preparing request..." : "Prepare request"}
            </button>
          </div>
        </form>
      </div>
    </PatientAppShell>
  );
}
