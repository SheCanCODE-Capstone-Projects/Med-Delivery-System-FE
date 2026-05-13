"use client";

import React, { useState, FormEvent } from "react";

type Step = "pharmacy" | "manager" | "review";

interface PharmacyForm {
  name: string;
  pharmacyCode: string;
  licenseNumber: string;
  address: string;
  latitude: string;
  longitude: string;
  contactPhone: string;
  contactInfo: string;
  insuranceProviders: string[];
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
  contactInfo?: string;
  insuranceProviders?: string;
  managerName?: string;
  managerEmail?: string;
}

const INSURANCE_OPTIONS = ["RSSB", "MMI", "RADIANT", "SORAS", "BRITAM", "UAP", "OTHER"];

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "pharmacy", label: "Pharmacy" },
    { id: "manager", label: "Manager" },
    { id: "review", label: "Review" },
  ];
  const order: Step[] = ["pharmacy", "manager", "review"];
  const currentIdx = order.indexOf(current);

  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200
                  ${done
                    ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                    : active
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-gray-200 text-gray-400"}`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium ${active ? "text-emerald-600" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 mx-2 mb-4 transition-all duration-200 ${done ? "bg-emerald-600" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="10" />
    </svg>
  );
}

function InputField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange?: (v: string) => void;
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-4 py-3 text-sm rounded-xl border-2 outline-none transition-all duration-150
          ${error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"}`}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-700 font-medium break-all">{value}</span>
    </div>
  );
}

export default function PharmacyRegistration() {
  const [step, setStep] = useState<Step>("pharmacy");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [pharmacy, setPharmacy] = useState<PharmacyForm>({
    name: "",
    pharmacyCode: "",
    licenseNumber: "",
    address: "",
    latitude: "",
    longitude: "",
    contactPhone: "",
    contactInfo: "",
    insuranceProviders: [],
  });

  const [manager, setManager] = useState<ManagerForm>({
    managerName: "",
    managerEmail: "",
  });

  const updatePharmacy = (field: keyof PharmacyForm, value: string) => {
    setPharmacy((p) => ({ ...p, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const updateManager = (field: keyof ManagerForm, value: string) => {
    setManager((m) => ({ ...m, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const toggleInsurance = (provider: string) => {
    setPharmacy((p) => ({
      ...p,
      insuranceProviders: p.insuranceProviders.includes(provider)
        ? p.insuranceProviders.filter((x) => x !== provider)
        : [...p.insuranceProviders, provider],
    }));
    if (errors.insuranceProviders) {
      setErrors((e) => ({ ...e, insuranceProviders: undefined }));
    }
  };

  const validatePharmacy = (): boolean => {
    const e: FormErrors = {};
    if (!pharmacy.name.trim()) {
      e.name = "Pharmacy name is required.";
    }
    if (!pharmacy.pharmacyCode.trim()) {
      e.pharmacyCode = "Pharmacy code is required.";
    } else if (!/^[A-Z0-9]{4,15}$/.test(pharmacy.pharmacyCode.toUpperCase())) {
      e.pharmacyCode = "Code must be 4-15 uppercase letters/numbers (e.g. KIPHARMA).";
    }
    if (!pharmacy.licenseNumber.trim()) {
      e.licenseNumber = "License number is required.";
    }
    if (!pharmacy.address.trim()) {
      e.address = "Address is required.";
    }
    if (!pharmacy.contactPhone.trim()) {
      e.contactPhone = "Contact phone is required.";
    } else if (!/^\+?[0-9]{7,15}$/.test(pharmacy.contactPhone.replace(/\s/g, ""))) {
      e.contactPhone = "Please enter a valid phone number.";
    }
    if (!pharmacy.contactInfo.trim()) {
      e.contactInfo = "Contact email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pharmacy.contactInfo)) {
      e.contactInfo = "Please enter a valid email address.";
    }
    if (pharmacy.insuranceProviders.length === 0) {
      e.insuranceProviders = "Please select at least one insurance provider.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateManager = (): boolean => {
    const e: FormErrors = {};
    if (!manager.managerName.trim() || manager.managerName.trim().length < 2) {
      e.managerName = "Manager name must be at least 2 characters.";
    }
    if (!manager.managerEmail.trim()) {
      e.managerEmail = "Manager email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manager.managerEmail)) {
      e.managerEmail = "Please enter a valid email address.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePharmacyNext = (e: FormEvent) => {
    e.preventDefault();
    if (validatePharmacy()) setStep("manager");
  };

  const handleManagerNext = (e: FormEvent) => {
    e.preventDefault();
    if (validateManager()) setStep("review");
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 16L13 23L26 9" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-emerald-800 mb-2">Registration Submitted!</h1>
          <p className="text-sm text-gray-500 mb-3 leading-relaxed">
            <span className="font-semibold text-gray-700">{pharmacy.name}</span> has been submitted for review.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-7">
            <p className="text-xs text-amber-700 font-medium">
              Your application is pending approval by the Super Admin. Once approved, the manager will receive an activation email at{" "}
              <span className="font-bold">{manager.managerEmail}</span>.
            </p>
          </div>
          <button
            onClick={() => {
              // TODO: router.push('/auth/login')
              alert("Navigate to login page");
            }}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold rounded-xl transition-all duration-150"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-emerald-800 mb-6">Register Your Pharmacy</h1>

        <StepIndicator current={step} />

        {step === "pharmacy" && (
          <form onSubmit={handlePharmacyNext} noValidate>
            <h2 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
              Pharmacy Information
            </h2>

            <InputField id="name" label="Pharmacy name" placeholder="e.g. Kigali Pharmacy" value={pharmacy.name} onChange={(v) => updatePharmacy("name", v)} error={errors.name} required />
            <InputField id="pharmacyCode" label="Pharmacy code" placeholder="e.g. KIPHARMA" value={pharmacy.pharmacyCode} onChange={(v) => updatePharmacy("pharmacyCode", v.toUpperCase())} error={errors.pharmacyCode} required hint="Unique code used to generate pharmacist IDs e.g. KIPHARMA-00001" />
            <InputField id="licenseNumber" label="License number" placeholder="e.g. LIC123456" value={pharmacy.licenseNumber} onChange={(v) => updatePharmacy("licenseNumber", v)} error={errors.licenseNumber} required />
            <InputField id="address" label="Address" placeholder="e.g. KG 123 St, Kigali" value={pharmacy.address} onChange={(v) => updatePharmacy("address", v)} error={errors.address} required hint="You can also add GPS coordinates below" />

            <div className="grid grid-cols-2 gap-3">
              <InputField id="latitude" label="Latitude (optional)" placeholder="-1.9441" value={pharmacy.latitude} onChange={(v) => updatePharmacy("latitude", v)} />
              <InputField id="longitude" label="Longitude (optional)" placeholder="30.0619" value={pharmacy.longitude} onChange={(v) => updatePharmacy("longitude", v)} />
            </div>

            <InputField id="contactPhone" label="Contact phone" type="tel" placeholder="+250 7XX XXX XXX" value={pharmacy.contactPhone} onChange={(v) => updatePharmacy("contactPhone", v)} error={errors.contactPhone} required />
            <InputField id="contactInfo" label="Contact email" type="email" placeholder="pharmacy@example.com" value={pharmacy.contactInfo} onChange={(v) => updatePharmacy("contactInfo", v)} error={errors.contactInfo} required />

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Supported insurance providers <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INSURANCE_OPTIONS.map((ins) => (
                  <button
                    key={ins}
                    type="button"
                    onClick={() => toggleInsurance(ins)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all duration-150
                      ${pharmacy.insuranceProviders.includes(ins)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                  >
                    {ins}
                  </button>
                ))}
              </div>
              {errors.insuranceProviders && (
                <p className="mt-1.5 text-xs text-red-500">{errors.insuranceProviders}</p>
              )}
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold rounded-xl transition-all duration-150">
              Next — Manager details
            </button>
          </form>
        )}

        {step === "manager" && (
          <form onSubmit={handleManagerNext} noValidate>
            <h2 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
              Manager Information
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              The manager will receive an activation email once the pharmacy is approved by the admin.
            </p>

            <InputField id="managerName" label="Manager full name" placeholder="e.g. Alice Uwimana" value={manager.managerName} onChange={(v) => updateManager("managerName", v)} error={errors.managerName} required />
            <InputField id="managerEmail" label="Manager email" type="email" placeholder="manager@pharmacy.com" value={manager.managerEmail} onChange={(v) => updateManager("managerEmail", v)} error={errors.managerEmail} required hint="This email will be used to activate the pharmacy account" />

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setStep("pharmacy")} className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold rounded-xl transition-all duration-150">
                Back
              </button>
              <button type="submit" className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold rounded-xl transition-all duration-150">
                Next — Review
              </button>
            </div>
          </form>
        )}

        {step === "review" && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">
              Review & Submit
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Please review your details carefully before submitting.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">Pharmacy details</h3>
                <button onClick={() => setStep("pharmacy")} className="text-xs text-emerald-600 font-semibold hover:underline">
                  Edit
                </button>
              </div>
              <div className="space-y-2">
                <ReviewRow label="Name" value={pharmacy.name} />
                <ReviewRow label="Code" value={pharmacy.pharmacyCode} />
                <ReviewRow label="License" value={pharmacy.licenseNumber} />
                <ReviewRow label="Address" value={pharmacy.address} />
                {pharmacy.latitude && (
                  <ReviewRow label="Coordinates" value={`${pharmacy.latitude}, ${pharmacy.longitude}`} />
                )}
                <ReviewRow label="Phone" value={pharmacy.contactPhone} />
                <ReviewRow label="Email" value={pharmacy.contactInfo} />
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 w-24 flex-shrink-0">Insurance</span>
                  <div className="flex flex-wrap gap-1">
                    {pharmacy.insuranceProviders.map((ins) => (
                      <span key={ins} className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-md">
                        {ins}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">Manager details</h3>
                <button onClick={() => setStep("manager")} className="text-xs text-emerald-600 font-semibold hover:underline">
                  Edit
                </button>
              </div>
              <div className="space-y-2">
                <ReviewRow label="Name" value={manager.managerName} />
                <ReviewRow label="Email" value={manager.managerEmail} />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
              <p className="text-xs text-amber-700 font-medium">
                After submission, your application will be reviewed by the Super Admin before activation.
              </p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("manager")} className="flex-1 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold rounded-xl transition-all duration-150">
                Back
              </button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-150">
                {loading ? <Spinner /> : "Submit registration"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}