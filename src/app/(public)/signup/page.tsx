"use client";

import { useState } from "react";
import { MapPin, Navigation, Calendar, Check } from "lucide-react";

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
    <div className="min-h-screen bg-white flex items-start justify-center px-4 py-10 font-sans text-gray-900">
      <div className="w-full max-w-xl">
        
        {/* Header with MedDelivery Logo */}
        <div className="flex items-center gap-2 mb-8 text-emerald-700 font-bold text-2xl">
          <div className="bg-emerald-700 text-white p-1 rounded-lg text-xl flex items-center justify-center w-8 h-8">+</div>
          MedDelivery
        </div>

        {/* Multi-step Progress Indicator */}
        <Stepper current={step} />

        <div className="mt-12">
          {/* STEP 1: PERSONAL INFORMATION */}
          {step === "personal" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-4xl font-bold tracking-tight">Personal information</h2>
              <p className="text-gray-500 text-lg">Tell us a bit about yourself to set up your patient profile.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="First name" required value={formData.firstName} onChange={(v: string) => updateData({ firstName: v })} />
                <InputField label="Last name" required value={formData.lastName} onChange={(v: string) => updateData({ lastName: v })} />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold">Date of birth *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-gray-400 size-5" />
                  <input 
                    type="date" 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    value={formData.dob} 
                    onChange={(e) => updateData({ dob: e.target.value })} 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Emergency Contact</p>
                <InputField label="Contact name" required className="mb-4" value={formData.emergencyName} onChange={(v: string) => updateData({ emergencyName: v })} />
                <InputField label="Contact phone" required value={formData.emergencyPhone} onChange={(v: string) => updateData({ emergencyPhone: v })} />
              </div>

              <button 
                onClick={() => setStep("location")} 
                className="w-full bg-emerald-700 text-white font-bold py-4 rounded-2xl hover:bg-emerald-800 transition-colors shadow-md shadow-emerald-100"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: LOCATION SETUP */}
          {step === "location" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-4xl font-bold tracking-tight">Your location</h2>
              <p className="text-gray-500 text-lg">We need your location to deliver medication accurately.</p>

              <div className="flex gap-4">
                <ModeButton active={formData.locationMode === 'MANUAL'} icon={<MapPin/>} label="Manual entry" onClick={() => updateData({locationMode: 'MANUAL'})} />
                <ModeButton active={formData.locationMode === 'GPS'} icon={<Navigation/>} label="Use GPS" onClick={() => updateData({locationMode: 'GPS'})} />
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
                <button onClick={() => setStep("personal")} className="flex-1 border border-gray-200 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
                <button onClick={() => setStep("security")} className="flex-1 bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-md shadow-emerald-100">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 3: SECURITY / PHONE VERIFICATION */}
          {step === "security" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-4xl font-bold tracking-tight">Security setup</h2>
              <p className="text-gray-500 text-lg">Enter your phone number. We will send a one-time code to verify it.</p>

              <div className="space-y-2">
                <label className="block font-semibold">Phone number *</label>
                <input 
                  type="tel" 
                  placeholder="+250 7XX XXX XXX" 
                  className="w-full p-4 border-2 border-emerald-700 rounded-2xl focus:ring-0 outline-none font-medium text-lg bg-emerald-50/10"
                  value={formData.phone}
                  onChange={(e) => updateData({ phone: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setStep("location")} className="flex-1 border border-gray-200 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
                <button className="flex-1 bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-md shadow-emerald-100">Send code</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Specialized UI Components ---

function Stepper({ current }: { current: Step }) {
  const steps: Step[] = ["personal", "location", "security"];
  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-center justify-between px-2">
      {steps.map((s, i) => {
        const isCompleted = currentIdx > i;
        const isActive = current === s;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isActive ? "bg-emerald-700 border-emerald-700 text-white shadow-lg shadow-emerald-100" : 
                isCompleted ? "border-emerald-700 text-emerald-700 bg-white" : "border-gray-100 bg-white text-gray-300"
              }`}>
                {isCompleted ? <Check size={20} strokeWidth={3} /> : <span className="font-bold text-sm">{i + 1}</span>}
              </div>
              <span className={`text-[11px] mt-3 font-bold absolute -bottom-6 uppercase tracking-wider ${isActive ? "text-emerald-700" : "text-gray-400"}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-4 transition-colors duration-500 ${currentIdx > i ? "bg-emerald-700" : "bg-gray-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InputField({ label, required, value, onChange, className = "" }: any) {
  return (
    <div className={className}>
      <label className="block font-semibold mb-2 text-sm text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all" 
      />
    </div>
  );
}

function ModeButton({ active, icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-7 rounded-3xl border-2 transition-all duration-200 ${
      active ? 'border-emerald-700 bg-white text-emerald-700 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50/30'
    }`}>
      <span className="mb-2 scale-150">{icon}</span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );
}