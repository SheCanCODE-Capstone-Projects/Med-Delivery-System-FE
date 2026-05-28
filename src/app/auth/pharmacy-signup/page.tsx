"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { registerPharmacy, getInsuranceProviders } from "@/services/pharmacyApi";
import type { InsuranceProvider } from "@/types/api";

const benefits = [
  "Reach verified patients near your pharmacy",
  "AI-powered prescription validation",
  "Insurance claim automation built in",
  "Real-time inventory & order management",
];

const copyrightYear = new Date().getFullYear();

type Step = "pharmacy" | "manager" | "review";
const STEP_ORDER: Step[] = ["pharmacy", "manager", "review"];

interface PharmacyForm {
  name: string;
  pharmacyCode: string;
  licenseNumber: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  selectedProviderIds: number[];
  latitude?: number;
  longitude?: number;
}

interface ManagerForm {
  managerName: string;
  managerEmail: string;
}

interface FormErrors {
  name?: string;
  pharmacyCode?: string;
  licenseNumber?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  insuranceProviders?: string;
  managerName?: string;
  managerEmail?: string;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\+?[0-9]{7,15}$/;

function StepDots({ current }: { current: Step }) {
  const labels = ["Pharmacy", "Manager", "Review"];
  const idx = STEP_ORDER.indexOf(current);
  return (
    <div className="flex items-center gap-0 mb-7">
      {STEP_ORDER.map((_, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${done
                    ? "border-teal-500 bg-teal-50 text-teal-600"
                    : active
                    ? "border-teal-500 bg-teal-500 text-white"
                    : "border-slate-200 text-slate-400"}`}
              >
                {done ? <CheckCircle2 size={14} /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${active ? "text-teal-600" : "text-slate-400"}`}>
                {labels[i]}
              </span>
            </div>
            {i < 2 && (
              <div className={`h-px w-10 mb-4 mx-1 ${done ? "bg-teal-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label, id, type = "text", placeholder, value, onChange, error, hint, required,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  error?: string; hint?: string; required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-bold text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded-2xl border px-4 text-slate-900 placeholder:text-slate-400 outline-none transition
          bg-white focus:ring-4 disabled:opacity-60
          ${error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-slate-200 focus:border-teal-500 focus:ring-teal-500/15"}`}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-slate-700 font-medium break-all">{value}</span>
    </div>
  );
}

export default function PharmacySignup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pharmacy");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState(false);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const [pharmacy, setPharmacy] = useState<PharmacyForm>({
    name: "", pharmacyCode: "", licenseNumber: "",
    address: "", contactPhone: "", contactEmail: "",
    selectedProviderIds: [],
  });

  const [manager, setManager] = useState<ManagerForm>({
    managerName: "", managerEmail: "",
  });

  useEffect(() => {
    setProvidersLoading(true);
    setProvidersError(false);
    getInsuranceProviders()
      .then(setInsuranceProviders)
      .catch(() => setProvidersError(true))
      .finally(() => setProvidersLoading(false));
  }, []);

  const setP = (field: keyof PharmacyForm, value: string) => {
    setPharmacy((p) => ({ ...p, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setM = (field: keyof ManagerForm, value: string) => {
    setManager((m) => ({ ...m, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleInsurance = (id: number) => {
    setPharmacy((p) => ({
      ...p,
      selectedProviderIds: p.selectedProviderIds.includes(id)
        ? p.selectedProviderIds.filter((x) => x !== id)
        : [...p.selectedProviderIds, id],
    }));
    if (errors.insuranceProviders) setErrors((e) => ({ ...e, insuranceProviders: undefined }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setGpsError("Geolocation is not supported by your browser."); return; }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPharmacy((p) => ({ ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setGpsLoading(false);
      },
      () => {
        setGpsError("Could not detect location. Please allow location access and try again.");
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const validatePharmacy = (): boolean => {
    const e: FormErrors = {};
    if (!pharmacy.name.trim()) e.name = "Pharmacy name is required.";
    if (!pharmacy.pharmacyCode.trim()) e.pharmacyCode = "Pharmacy code is required.";
    else if (!/^[A-Z0-9]{4,15}$/.test(pharmacy.pharmacyCode.toUpperCase()))
      e.pharmacyCode = "4–15 uppercase letters/numbers (e.g. KIPHARMA).";
    if (!pharmacy.licenseNumber.trim()) e.licenseNumber = "License number is required.";
    if (!pharmacy.address.trim()) e.address = "Address is required.";
    if (!pharmacy.contactPhone.trim()) e.contactPhone = "Phone is required.";
    else if (!phoneRe.test(pharmacy.contactPhone.replace(/\s/g, "")))
      e.contactPhone = "Enter a valid phone number.";
    if (!pharmacy.contactEmail.trim()) e.contactEmail = "Email is required.";
    else if (!emailRe.test(pharmacy.contactEmail)) e.contactEmail = "Enter a valid email.";
    // Insurance providers are optional — they can be assigned after approval
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateManager = (): boolean => {
    const e: FormErrors = {};
    if (manager.managerName.trim().length < 2) e.managerName = "Full name is required.";
    if (!manager.managerEmail.trim()) e.managerEmail = "Email is required.";
    else if (!emailRe.test(manager.managerEmail)) e.managerEmail = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      await registerPharmacy({
        name: pharmacy.name,
        pharmacyCode: pharmacy.pharmacyCode.toUpperCase(),
        licenseNumber: pharmacy.licenseNumber,
        address: pharmacy.address,
        phoneNumber: pharmacy.contactPhone,
        contactInfo: pharmacy.contactEmail,
        managerName: manager.managerName,
        managerEmail: manager.managerEmail,
        insuranceProviderIds: pharmacy.selectedProviderIds,
        ...(pharmacy.latitude != null && { latitude: pharmacy.latitude }),
        ...(pharmacy.longitude != null && { longitude: pharmacy.longitude }),
      });
      router.push(
        `/auth/verify-otp?username=${encodeURIComponent(manager.managerEmail)}&after=pharmacy-submitted`
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <main className="h-[100dvh] overflow-hidden text-slate-950 flex">
      {/* Left panel */}
      <section className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[460px] shrink-0 relative overflow-hidden bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,160,0.30),transparent_32%),linear-gradient(160deg,#0a1628_0%,#0d1f3c_55%,#091422_100%)] p-[clamp(1rem,3vh,2.5rem)] text-white">
        <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[rgba(14,165,160,0.18)] blur-2xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-56 w-56 rounded-full bg-[rgba(14,165,160,0.08)] blur-xl" />

        <div className="relative z-10">
          <MedDeliveryLogo href="/" theme="dark" size="sm" />
          <div className="mt-8 max-w-xs">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] text-white/70">
              Pharmacy Registration
            </span>
            <h1 className="mt-3 text-[2.3rem] leading-[1] font-semibold tracking-tighter">
              Bring your pharmacy
              <br />
              <span className="text-teal-400">online today.</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/60 max-w-[260px]">
              Partner with MedDelivery to reach patients, automate prescriptions, and grow your business.
            </p>
          </div>
          <ul className="mt-8 grid gap-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/80">
                <CheckCircle2 size={15} className="text-teal-400 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/35">
          {copyrightYear} MedDelivery. Safe delivery, verified every step.
        </p>
      </section>

      {/* Right panel — scrollable */}
      <section className="flex-1 min-w-0 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(14,165,160,0.08),transparent_30%),linear-gradient(135deg,#edf5f8_0%,#f7f9fc_50%,#eef6f7_100%)]">
        <div className="flex min-h-full items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[520px] rounded-3xl border border-white/70 bg-white/85 p-[clamp(1.4rem,3.5vh,2.2rem)] shadow-[0_24px_56px_rgba(11,19,39,0.14)] backdrop-blur-xl">
            <MedDeliveryLogo href="/" theme="light" size="sm" className="mb-5 lg:hidden" />

            <div className="mb-5">
              <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">Partner with us</p>
              <h2 className="mt-1.5 text-[1.75rem] leading-none font-semibold tracking-tighter text-slate-900">
                Register Your Pharmacy
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Complete the 3-step form — your account will be activated after admin review.
              </p>
            </div>

            <StepDots current={step} />

            {/* ── Step 1: Pharmacy ── */}
            {step === "pharmacy" && (
              <form
                onSubmit={(e) => { e.preventDefault(); if (validatePharmacy()) setStep("manager"); }}
                noValidate
                className="grid gap-3.5"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                  Pharmacy Information
                </p>

                <Field id="name" label="Pharmacy name" placeholder="e.g. Kigali Pharmacy" value={pharmacy.name} onChange={(v) => setP("name", v)} error={errors.name} required />
                <Field id="pharmacyCode" label="Pharmacy code" placeholder="e.g. KIPHARMA" value={pharmacy.pharmacyCode} onChange={(v) => setP("pharmacyCode", v.toUpperCase())} error={errors.pharmacyCode} hint="Unique code for pharmacist IDs (e.g. KIPHARMA-00001)" required />
                <Field id="licenseNumber" label="License number" placeholder="e.g. LIC-123456" value={pharmacy.licenseNumber} onChange={(v) => setP("licenseNumber", v)} error={errors.licenseNumber} required />
                <Field id="address" label="Address" placeholder="e.g. KG 123 St, Kigali" value={pharmacy.address} onChange={(v) => setP("address", v)} error={errors.address} required />

                <div className="grid grid-cols-2 gap-3">
                  <Field id="contactPhone" label="Phone" type="tel" placeholder="+250 7XX XXX XXX" value={pharmacy.contactPhone} onChange={(v) => setP("contactPhone", v)} error={errors.contactPhone} required />
                  <Field id="contactEmail" label="Email" type="email" placeholder="pharmacy@example.com" value={pharmacy.contactEmail} onChange={(v) => setP("contactEmail", v)} error={errors.contactEmail} required />
                </div>

                {/* GPS Location */}
                <div className="grid gap-1.5">
                  <span className="text-sm font-bold text-slate-600">GPS Location <span className="text-slate-400 font-normal">(optional)</span></span>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={gpsLoading}
                      className="flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:border-teal-400 hover:text-teal-700 transition disabled:opacity-60"
                    >
                      {gpsLoading
                        ? <Loader2 size={15} className="animate-spin" />
                        : <MapPin size={15} />}
                      {gpsLoading ? "Detecting…" : pharmacy.latitude ? "Update location" : "Use my location"}
                    </button>
                    {pharmacy.latitude != null && pharmacy.longitude != null && (
                      <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl">
                        {pharmacy.latitude.toFixed(5)}, {pharmacy.longitude.toFixed(5)}
                      </span>
                    )}
                  </div>
                  {gpsError && <p className="text-xs text-rose-600">{gpsError}</p>}
                  <p className="text-xs text-slate-400">Helps patients find your pharmacy on the map accurately.</p>
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Insurance providers <span className="text-slate-400 font-normal">(optional)</span></span>
                    {pharmacy.selectedProviderIds.length > 0 && (
                      <span className="text-xs text-teal-600 font-semibold">{pharmacy.selectedProviderIds.length} selected</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {providersLoading && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin" /> Loading providers…
                      </p>
                    )}
                    {!providersLoading && providersError && (
                      <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <p className="text-xs text-amber-700 font-semibold">Insurance providers could not be loaded.</p>
                        <p className="text-xs text-amber-600 mt-0.5">You can still register — providers can be assigned after approval.</p>
                      </div>
                    )}
                    {!providersLoading && !providersError && insuranceProviders.map((prov) => {
                      const isSelected = pharmacy.selectedProviderIds.includes(prov.id);
                      return (
                        <button
                          key={prov.id}
                          type="button"
                          onClick={() => toggleInsurance(prov.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition ${
                            isSelected
                              ? "border-teal-500 bg-teal-50 text-teal-700"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${isSelected ? "border-teal-500 bg-teal-500" : "border-slate-300"}`}>
                            {isSelected && <CheckCircle2 size={10} className="text-white" />}
                          </div>
                          {prov.name}
                          {prov.coveragePercentage > 0 && (
                            <span className={`text-xs font-bold ${isSelected ? "text-teal-500" : "text-slate-400"}`}>{prov.coveragePercentage}%</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.insuranceProviders && (
                    <p className="text-xs text-rose-600">{errors.insuranceProviders}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-1 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5"
                >
                  Next — Manager details
                </button>
              </form>
            )}

            {/* ── Step 2: Manager ── */}
            {step === "manager" && (
              <form
                onSubmit={(e) => { e.preventDefault(); if (validateManager()) setStep("review"); }}
                noValidate
                className="grid gap-3.5"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                  Manager Information
                </p>
                <p className="text-sm text-slate-500 leading-relaxed -mt-1">
                  The manager receives an activation email once the pharmacy is approved.
                </p>

                <Field id="managerName" label="Manager full name" placeholder="e.g. Alice Uwimana" value={manager.managerName} onChange={(v) => setM("managerName", v)} error={errors.managerName} required />
                <Field id="managerEmail" label="Manager email" type="email" placeholder="manager@pharmacy.com" value={manager.managerEmail} onChange={(v) => setM("managerEmail", v)} error={errors.managerEmail} hint="Used to activate the pharmacy account" required />

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button" onClick={() => setStep("pharmacy")}
                    className="h-12 rounded-2xl border-2 border-slate-200 font-semibold text-slate-600 hover:border-slate-300 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5"
                  >
                    Next — Review
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 3: Review ── */}
            {step === "review" && (
              <div className="grid gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                  Review & Submit
                </p>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 grid gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-600">Pharmacy details</span>
                    <button onClick={() => setStep("pharmacy")} className="text-xs text-teal-600 font-semibold hover:underline">Edit</button>
                  </div>
                  <ReviewRow label="Name" value={pharmacy.name} />
                  <ReviewRow label="Code" value={pharmacy.pharmacyCode} />
                  <ReviewRow label="License" value={pharmacy.licenseNumber} />
                  <ReviewRow label="Address" value={pharmacy.address} />
                  <ReviewRow label="Phone" value={pharmacy.contactPhone} />
                  <ReviewRow label="Email" value={pharmacy.contactEmail} />
                  {pharmacy.latitude != null && pharmacy.longitude != null && (
                    <ReviewRow label="GPS" value={`${pharmacy.latitude.toFixed(5)}, ${pharmacy.longitude.toFixed(5)}`} />
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">Insurance</span>
                    <div className="flex flex-wrap gap-1">
                      {pharmacy.selectedProviderIds.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None selected — can be added after approval</span>
                      ) : insuranceProviders
                          .filter((p) => pharmacy.selectedProviderIds.includes(p.id))
                          .map((p) => (
                            <span key={p.id} className="text-xs bg-teal-50 text-teal-700 font-medium px-2 py-0.5 rounded-lg">
                              {p.name}{p.coveragePercentage > 0 ? ` — ${p.coveragePercentage}%` : ""}
                            </span>
                          ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 grid gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-600">Manager details</span>
                    <button onClick={() => setStep("manager")} className="text-xs text-teal-600 font-semibold hover:underline">Edit</button>
                  </div>
                  <ReviewRow label="Name" value={manager.managerName} />
                  <ReviewRow label="Email" value={manager.managerEmail} />
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs text-amber-700 font-medium">
                    Your application will be reviewed by the Super Admin before activation.
                  </p>
                </div>

                {submitError && (
                  <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {submitError}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button" onClick={() => setStep("manager")}
                    className="h-12 rounded-2xl border-2 border-slate-200 font-semibold text-slate-600 hover:border-slate-300 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit} disabled={loading}
                    className="h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="animate-spin" size={16} /> Submitting…</> : "Submit registration"}
                  </button>
                </div>
              </div>
            )}

            <p className="mt-5 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link href="/auth/login" className="font-bold text-teal-700 hover:text-teal-900">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
