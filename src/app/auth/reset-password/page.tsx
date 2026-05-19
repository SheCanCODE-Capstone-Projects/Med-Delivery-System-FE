"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { resetPassword } from "@/services/authApi";
import { roleToRoute } from "@/services/authApi";
import { KeyRound, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) { setError("Enter the OTP sent to your email."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const auth = await resetPassword({ email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => router.push(roleToRoute(auth.role)), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-[0_24px_56px_rgba(11,19,39,0.10)] p-8">
        <MedDeliveryLogo href="/" theme="light" size="sm" className="mb-6" />

        <div className="flex items-center gap-3 mb-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600">
            <KeyRound size={22} />
          </span>
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">Reset Password</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create new password</h1>
          </div>
        </div>

        {email && (
          <p className="text-sm text-slate-500 mb-6">
            Enter the OTP sent to <span className="font-bold text-slate-700">{email}</span> and choose a new password.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        )}
        {success && (
          <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
            Password reset successful! Redirecting...
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-600">OTP Code</span>
            <input
              type="text"
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(""); }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              disabled={loading || success}
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 tracking-widest text-center text-lg font-bold outline-hidden transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-600">New Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || success}
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-900 outline-hidden transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-600">Confirm Password</span>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              disabled={loading || success}
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-hidden transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
            />
          </label>

          <button
            type="submit"
            disabled={loading || success}
            className="min-h-12 rounded-2xl bg-teal-600 font-bold text-white shadow-[0_16px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting password..." : "Reset password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
