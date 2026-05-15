'use client';

import React, { useState, useRef } from 'react';
import PatientAppShell from '@/components/layout/PatientAppShell';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Upload,
  Save,
  CheckCircle2,
  Loader2,
  Camera,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────
interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface InsuranceData {
  providerName: string;
  memberId: string;
  status: 'UNVERIFIED' | 'PENDING_VERIFICATION' | 'VERIFIED';
}

interface LocationData {
  address: string;
  region: string;
}

// ─── Mock Data ────────────────────────────────────────────
const INITIAL_PROFILE: ProfileData = {
  firstName: 'Jean Claude',
  lastName: 'Uwimana',
  phone: '+250 788 000 111',
  email: 'j.uwimana@email.com',
};

const INITIAL_INSURANCE: InsuranceData = {
  providerName: 'RSSB Health Insurance',
  memberId: 'RSSB-2024-00123',
  status: 'PENDING_VERIFICATION',
};

const INITIAL_LOCATION: LocationData = {
  address: 'KG 11 Ave, Kigali',
  region: 'Kigali',
};

// ─── Status Badge ─────────────────────────────────────────
function InsuranceStatusBadge({
  status,
}: {
  status: InsuranceData['status'];
}): React.JSX.Element {
  const styles: Record<InsuranceData['status'], string> = {
    UNVERIFIED: 'bg-slate-100 text-slate-500 border-slate-200',
    PENDING_VERIFICATION: 'bg-orange-50 text-orange-600 border-orange-200',
    VERIFIED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };

  const labels: Record<InsuranceData['status'], string> = {
    UNVERIFIED: 'Unverified',
    PENDING_VERIFICATION: 'Pending Verification',
    VERIFIED: 'Verified',
  };

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ─── Section Card ─────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────
function InputField({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none transition ${
            disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white'
          }`}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function PatientProfilePage(): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insuranceFrontRef = useRef<HTMLInputElement>(null);
  const insuranceBackRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [insurance, setInsurance] = useState<InsuranceData>(INITIAL_INSURANCE);
  const [location, setLocation] = useState<LocationData>(INITIAL_LOCATION);
  const [avatar, setAvatar] = useState<string>(
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Patient'
  );
  const [insuranceFront, setInsuranceFront] = useState<string | null>(null);
  const [insuranceBack, setInsuranceBack] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setInsurance((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const handleInsuranceFront = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) setInsuranceFront(URL.createObjectURL(file));
  };

  const handleInsuranceBack = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) setInsuranceBack(URL.createObjectURL(file));
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <PatientAppShell>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 mt-1">
          Manage your personal information, insurance details and location.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Avatar + Personal Info ── */}
        <SectionCard
          title="Personal Information"
          subtitle="Update your name, phone number and profile photo."
        >
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-teal-100 bg-teal-50">
                  <img
                    src={avatar}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition text-teal-600"
                  aria-label="Upload profile photo"
                >
                  <Camera size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  aria-label="Profile photo upload"
                />
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-sm text-slate-500">Patient ID: PAT-8291</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-teal-600 hover:underline mt-2"
                >
                  Change photo
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="First Name"
                value={profile.firstName}
                onChange={handleProfileChange}
              />
              <InputField
                label="Last Name"
                value={profile.lastName}
                onChange={handleProfileChange}
              />
              <InputField
                label="Phone Number"
                value={profile.phone}
                onChange={handleProfileChange}
                icon={Phone}
                type="tel"
              />
              <InputField
                label="Email Address (optional)"
                value={profile.email}
                onChange={handleProfileChange}
                icon={Mail}
                type="email"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Insurance ── */}
        <SectionCard
          title="Insurance Information"
          subtitle="Your insurance details are verified by the pharmacy on first use."
        >
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Insurance Status
              </p>
              <InsuranceStatusBadge status={insurance.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Insurance Provider"
                value={insurance.providerName}
                onChange={handleInsuranceChange}
                icon={Shield}
              />
              <InputField
                label="Member ID / Insurance Number"
                value={insurance.memberId}
                onChange={handleInsuranceChange}
              />
            </div>

            {/* Card Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Front */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Insurance Card — Front
                </label>
                <div
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition min-h-[120px]"
                  onClick={() => insuranceFrontRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') insuranceFrontRef.current?.click();
                  }}
                  aria-label="Upload insurance card front"
                >
                  {insuranceFront ? (
                    <img
                      src={insuranceFront}
                      alt="Insurance card front"
                      className="h-20 object-contain rounded"
                    />
                  ) : (
                    <>
                      <Upload size={20} className="text-slate-400" />
                      <p className="text-xs text-slate-500 text-center">
                        Click to upload front
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={insuranceFrontRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleInsuranceFront}
                  aria-label="Insurance card front upload"
                />
              </div>

              {/* Back */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Insurance Card — Back
                </label>
                <div
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition min-h-[120px]"
                  onClick={() => insuranceBackRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') insuranceBackRef.current?.click();
                  }}
                  aria-label="Upload insurance card back"
                >
                  {insuranceBack ? (
                    <img
                      src={insuranceBack}
                      alt="Insurance card back"
                      className="h-20 object-contain rounded"
                    />
                  ) : (
                    <>
                      <Upload size={20} className="text-slate-400" />
                      <p className="text-xs text-slate-500 text-center">
                        Click to upload back
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={insuranceBackRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleInsuranceBack}
                  aria-label="Insurance card back upload"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Location ── */}
        <SectionCard
          title="Location"
          subtitle="Your location is used to match you with nearby pharmacies."
        >
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Street Address"
                value={location.address}
                onChange={handleLocationChange}
                icon={MapPin}
              />
              <InputField
                label="Region / District"
                value={location.region}
                onChange={handleLocationChange}
              />
            </div>

            <button
              type="button"
              className="mt-4 flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm font-bold hover:bg-teal-50 transition"
            >
              <MapPin size={16} />
              Use my current GPS location
            </button>
          </div>
        </SectionCard>

        {/* ── Save Button ── */}
        <div className="flex justify-end items-center gap-4 pb-8">
          {showSuccess && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
              <CheckCircle2 size={16} />
              Profile saved successfully!
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </PatientAppShell>
  );
}