"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { setPassword } from "@/services/authApi";
import { roleToRoute } from "@/services/authApi";
import { KeyRound, Eye, EyeOff } from "lucide-react";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing activation token. Please use the link from your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const auth = await setPassword({ token, password });
      setSuccess(true);
      setTimeout(() => router.push(roleToRoute(auth.role)), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password.");
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
            <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">Account Activation</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set your password</h1>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Create a secure password to activate your account. You were invited by your pharmacy admin.
        </p>

        {error && (
          <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
            Password set! Redirecting to your dashboard...
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-600">New Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                disabled={loading || success}
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-900 outline-hidden transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
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
            {loading ? "Activating account..." : "Activate account"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  );
}
