"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { forgotPassword } from "@/services/authApi";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ username: trimmed });
      setSent(true);
      setTimeout(() => router.push(`/auth/reset-password?email=${encodeURIComponent(trimmed)}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
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
            <Mail size={22} />
          </span>
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">Password Recovery</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot password?</h1>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Enter your email address and we will send you a one-time code to reset your password.
        </p>

        {error && (
          <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {sent && (
          <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
            OTP sent to {email}. Redirecting to reset page...
          </p>
        )}

        {!sent && (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-600">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                disabled={loading}
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-hidden transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="min-h-12 rounded-2xl bg-teal-600 font-bold text-white shadow-[0_16px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send reset code"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered it?{" "}
          <Link href="/auth/login" className="font-bold text-teal-700 hover:text-teal-900">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
