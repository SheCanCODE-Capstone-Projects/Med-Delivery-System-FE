"use client";

import { useId, useState } from "react";
import { MapPin, Navigation, Calendar, Check } from "lucide-react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";

type Step = "personal" | "location" | "security";

export default function Signup() {
  const [step, setStep] = useState<Step>("personal");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    emergencyName: "",
    emergencyPhone: "",
    locationMode: "MANUAL",
    address: "",
    street: "",
    city: "",
    district: "",
    phone: "",
  });

  const updateData = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  return (
    <div className="min-h-screen bg-[#F6FAFA] flex items-center justify-center px-4 py-12 font-sans text-gray-900">
      <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_40px_rgba(10,191,188,0.08)] border border-[rgba(10,191,188,0.15)]">

        <div className="mb-10 flex justify-center sm:justify-start">
          <MedDeliveryLogo href="/" theme="light" size="md" />
        </div>

        <Stepper current={step} />

        <div className="mt-12">

          {step === "personal" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-4xl font-bold tracking-tight">Personal information</h2>
              <p className="text-gray-500 text-lg">Tell us a bit about yourself to set up your patient profile.</p>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="First name" required value={formData.firstName} onChange={(v: string) => updateData({ firstName: v })} />
                <InputField label="Last name" required value={formData.lastName} onChange={(v: string) => updateData({ lastName: v })} />
              </div>

              <DobField value={formData.dob} onChange={(v) => updateData({ dob: v })} />

              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Emergency Contact</p>
                <InputField label="Contact name" required className="mb-4" value={formData.emergencyName} onChange={(v: string) => updateData({ emergencyName: v })} />
                <InputField label="Contact phone" required value={formData.emergencyPhone} onChange={(v: string) => updateData({ emergencyPhone: v })} />
              </div>

              <button type="button" onClick={() => setStep("location")} className="w-full bg-[#0ABFBC] text-[#040F1A] font-bold py-4 rounded-2xl hover:bg-[#089A97] transition-colors shadow-[0_8px_20px_rgba(10,191,188,0.2)]">
                Continue
              </button>
            </div>
          )}

          {step === "location" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-4xl font-bold tracking-tight">Your location</h2>
              <p className="text-gray-500 text-lg">We need your location to deliver medication accurately.</p>

              <div role="group" aria-label="Location input method">
                <div className="flex gap-4">
                  <ModeButton active={formData.locationMode === "MANUAL"} icon={<MapPin aria-hidden="true" />} label="Manual entry" onClick={() => updateData({ locationMode: "MANUAL" })} />
                  <ModeButton active={formData.locationMode === "GPS"} icon={<Navigation aria-hidden="true" />} label="Use GPS" onClick={() => updateData({ locationMode: "GPS" })} />
                </div>
              </div>

              <div className="space-y-4">
                <InputField label="Address" required value={formData.address} onChange={(v: string) => updateData({ address: v })} />
                <InputField label="Street address" required value={formData.street} onChange={(v: string) => updateData({ street: v })} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="City" required value={formData.city} onChange={(v: string) => updateData({ city: v })} />
                  <InputField label="District" required value={formData.district} onChange={(v: string) => updateData({ district: v })} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep("personal")} className="flex-1 border border-gray-200 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
                <button type="button" onClick={() => setStep("security")} className="flex-1 bg-[#0ABFBC] text-[#040F1A] py-4 rounded-2xl font-bold shadow-[0_8px_20px_rgba(10,191,188,0.2)] hover:bg-[#089A97] transition-colors">Continue</button>
              </div>
            </div>
          )}

          {step === "security" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-4xl font-bold tracking-tight">Security setup</h2>
              <p className="text-gray-500 text-lg">Enter your phone number. We will send a one-time code to verify it.</p>

              <PhoneField value={formData.phone} onChange={(v) => updateData({ phone: v })} />

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep("location")} className="flex-1 border border-gray-200 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
                <button type="button" className="flex-1 bg-[#0ABFBC] text-[#040F1A] py-4 rounded-2xl font-bold shadow-[0_8px_20px_rgba(10,191,188,0.2)] hover:bg-[#089A97] transition-colors">Send code</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const steps: Step[] = ["personal", "location", "security"];
  const currentIdx = steps.indexOf(current);

  return (
    <nav aria-label="Sign-up progress">
      <ol className="flex items-center justify-between px-2">
        {steps.map((s, i) => {
          const isCompleted = currentIdx > i;
          const isActive = current === s;
          return (
            <li key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative">
                <div
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${s}${isCompleted ? " – completed" : isActive ? " – current" : ""}`}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive ? "bg-[#0ABFBC] border-[#0ABFBC] text-white shadow-[0_8px_20px_rgba(10,191,188,0.2)]" :
                    isCompleted ? "border-[#0ABFBC] text-[#089A97] bg-white" :
                    "border-gray-100 bg-white text-gray-300"
                  }`}
                >
                  {isCompleted ? <Check size={20} strokeWidth={3} aria-hidden="true" /> : <span aria-hidden="true" className="font-bold text-sm">{i + 1}</span>}
                </div>
                <span className={`text-[11px] mt-3 font-bold absolute -bottom-6 uppercase tracking-wider ${isActive ? "text-[#089A97]" : "text-gray-400"}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div aria-hidden="true" className={`flex-1 h-[2px] mx-4 transition-colors duration-500 ${currentIdx > i ? "bg-[#0ABFBC]" : "bg-gray-100"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function InputField({ label, required, value, onChange, className = "" }: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-semibold mb-2 text-sm text-gray-700">
        {label}{" "}
        {required && (
          <>
            <span aria-hidden="true" className="text-red-500">*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>
      <input
        id={id}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:border-[#0ABFBC] focus:bg-white outline-none transition-all"
      />
    </div>
  );
}

function DobField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-semibold">
        Date of birth{" "}
        <span aria-hidden="true" className="text-red-500">*</span>
        <span className="sr-only">(required)</span>
      </label>
      <div className="relative">
        <Calendar aria-hidden="true" className="absolute left-4 top-3.5 text-gray-400 size-5" />
        <input
          id={id}
          type="date"
          required
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0ABFBC]/50 outline-none transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-semibold">
        Phone number{" "}
        <span aria-hidden="true" className="text-red-500">*</span>
        <span className="sr-only">(required)</span>
      </label>
      <input
        id={id}
        type="tel"
        required
        placeholder="+250 7XX XXX XXX"
        className="w-full p-4 border-2 border-[#0ABFBC] rounded-2xl focus:ring-0 outline-none font-medium text-lg bg-[rgba(10,191,188,0.05)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ModeButton({ active, icon, label, onClick }: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 flex flex-col items-center justify-center p-7 rounded-3xl border-2 transition-all duration-200 ${
        active ? "border-[#0ABFBC] bg-white text-[#0ABFBC] shadow-sm" : "border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50/30"
      }`}
    >
      <span aria-hidden="true" className="mb-2 scale-150">{icon}</span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );
}