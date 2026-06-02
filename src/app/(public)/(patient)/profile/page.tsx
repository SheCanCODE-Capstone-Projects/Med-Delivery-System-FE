"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Phone, Save, UserRound } from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { getMyProfile, updateProfile, uploadProfileImage } from "@/services/patientApi";
import type { PatientProfileResponse } from "@/types/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState("");
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setFullName(p.fullName ?? "");
        setPhoneNumber(p.phoneNumber ?? "");
        setDateOfBirth(p.dateOfBirth ?? "");
        setGender(p.gender ?? "");
        setBloodType(p.bloodType ?? "");
        setAllergies(p.allergies ?? "");
        setMedicalNotes(p.medicalNotes ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const updated = await updateProfile({
        fullName: fullName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        bloodType: bloodType || undefined,
        allergies: allergies.trim() || undefined,
        medicalNotes: medicalNotes.trim() || undefined,
      });
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    setImgError("");
    try {
      const updated = await uploadProfileImage(file);
      setProfile(updated);
    } catch (err) {
      setImgError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  };

  return (
    <PatientAppShell>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Keep your health information up to date. Phone number is required for delivery and OTP verification.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading profile…</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {/* Avatar + upload */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center overflow-hidden">
                  {profile?.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-9 w-9 text-teal-600" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  disabled={imgUploading}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center hover:bg-teal-700 transition disabled:opacity-60 shadow"
                  title="Change photo"
                >
                  {imgUploading
                    ? <Loader2 size={12} className="animate-spin text-white" />
                    : <Camera size={12} className="text-white" />}
                </button>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{profile?.fullName ?? "—"}</p>
                <p className="text-sm text-slate-500">{profile?.email ?? "—"}</p>
                {profile?.phoneNumber && (
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone size={12} /> {profile.phoneNumber}
                  </p>
                )}
                {imgError && <p className="text-xs text-rose-600 mt-1">{imgError}</p>}
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  disabled={imgUploading}
                  className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-800 transition"
                >
                  {imgUploading ? "Uploading…" : "Change photo"}
                </button>
              </div>
            </div>

            {error && (
              <p className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
            {success && (
              <p className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 font-semibold">
                Profile updated successfully.
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+250 700 000 000"
                    type="tel"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <p className="text-xs text-slate-400 mt-1">Required for delivery and OTP verification.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select blood type</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Known Allergies</label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="List any known allergies (medications, foods, etc.)"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Medical Notes</label>
                <textarea
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Chronic conditions, ongoing treatments, or notes for the pharmacist…"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 disabled:opacity-60 transition shadow-sm"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </PatientAppShell>
  );
}
