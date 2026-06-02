"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { registerPatient } from "@/services/authApi";
import { BASE_URL } from "@/services/apiClient";

const benefits = [
  "Order from verified pharmacies near you",
  "AI prescription validation built in",
  "Insurance coverage support",
  "Real-time delivery tracking",
];

const copyrightYear = new Date().getFullYear();

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError("Full name is required."); return; }
    if (!email.trim()) { setError("Email address is required for account verification."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await registerPatient({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        password,
      });
      const identifier = email.trim() || phoneNumber.trim();
      router.push(`/auth/verify-otp?username=${encodeURIComponent(identifier)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      const identifier = email.trim() || phoneNumber.trim();
      if (msg.toLowerCase().includes("email already registered") && identifier) {
        setError("This email is already registered but may not be verified yet. Redirecting you to verify…");
        setTimeout(() => router.push(`/auth/verify-otp?username=${encodeURIComponent(identifier)}`), 2000);
      } else if (msg.toLowerCase().includes("phone number already registered") && identifier) {
        setError("This phone number is already registered but may not be verified yet. Redirecting you to verify…");
        setTimeout(() => router.push(`/auth/verify-otp?username=${encodeURIComponent(identifier)}`), 2000);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,160,0.12),transparent_34%),linear-gradient(135deg,#edf5f8_0%,#f7f9fc_45%,#eef6f7_100%)] text-slate-950">
      <div className="grid h-full min-h-0 lg:grid-cols-[minmax(480px,0.9fr)_minmax(560px,1.1fr)]">
        {/* Left panel — dark branding */}
        <section className="relative hidden min-h-0 overflow-hidden bg-[#013B41] py-[clamp(1rem,3vh,2.5rem)] pl-[clamp(2.5rem,6vw,5rem)] pr-[clamp(1rem,3vh,2.5rem)] text-white lg:flex lg:h-full lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-16 -top-24 h-76 w-76 rounded-full bg-[rgba(14,165,160,0.22)] blur-xl" />
          <div className="pointer-events-none absolute -left-16 bottom-12 h-64 w-64 rounded-full bg-[rgba(14,165,160,0.12)] blur-xl" />

        <div className="relative z-10">
          <MedDeliveryLogo href="/" theme="dark" size="sm" />
          <div className="mt-8 max-w-xs">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] text-white/70">
              Patient Registration
            </span>
            <h1 className="mt-3 text-[2.3rem] leading-[1] font-semibold tracking-tighter">
              Start your health
              <br />
              <span className="text-teal-400">journey today.</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/60 max-w-[260px]">
              Join patients managing their medicines safely with verified pharmacies and real-time tracking.
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

        {/* Right panel — form */}
        <section className="flex h-full min-h-0 flex-col overflow-y-auto px-4 py-[clamp(0.75rem,3vh,1.25rem)] sm:px-6 lg:px-8 xl:px-10">
          <div className="my-auto w-full max-w-[42rem] mx-auto rounded-3xl border border-white/70 bg-white/85 p-[clamp(1.45rem,3.6vh,2.35rem)] shadow-[0_24px_56px_rgba(11,19,39,0.16)] backdrop-blur-xl">
          <MedDeliveryLogo href="/" theme="light" size="sm" className="mb-5 lg:hidden" />

          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">Get started</p>
            <h2 className="mt-1.5 text-[1.85rem] leading-none font-semibold tracking-tighter text-slate-900">
              Create your account
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Register as a patient to order medicines online.
            </p>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-5 grid gap-3.5" noValidate>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-600">
                Full name <span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (error) setError(""); }}
                placeholder="Jane Doe"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-60"
                disabled={loading}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-slate-600">Email <span className="text-rose-500">*</span></span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  placeholder="jane@example.com"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-60"
                  disabled={loading}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-slate-600">Phone</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => { setPhoneNumber(e.target.value); if (error) setError(""); }}
                  placeholder="+250 7XX XXX XXX"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-60"
                  disabled={loading}
                />
              </label>
            </div>
            <p className="-mt-1.5 text-xs text-slate-400">Email is required for verification. Phone is optional.</p>

            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-600">
                Password <span className="text-rose-500">*</span>
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                  placeholder="Min. 6 characters"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-60"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-600">
                Confirm password <span className="text-rose-500">*</span>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(""); }}
                placeholder="Repeat password"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-60"
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </button>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="h-px bg-slate-200" />
              <p className="text-sm font-semibold text-slate-400">or</p>
              <span className="h-px bg-slate-200" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => { window.location.href = `${BASE_URL}/oauth2/authorization/google`; }}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.34 2.97-7.26Z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.24-2.5c-.9.6-2.06.96-3.37.96-2.59 0-4.79-1.75-5.57-4.1H3.08v2.58A9.99 9.99 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.43 13.93A5.98 5.98 0 0 1 6.12 12c0-.67.11-1.31.31-1.93V7.49H3.08A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.08 4.51l3.35-2.58Z" />
                <path fill="#EA4335" d="M12 5.97c1.47 0 2.8.5 3.84 1.49l2.88-2.88C16.95 2.94 14.69 2 12 2a9.99 9.99 0 0 0-8.92 5.49l3.35 2.58c.78-2.35 2.98-4.1 5.57-4.1Z" />
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-teal-700 hover:text-teal-900">
              Sign in
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-slate-500">
            Own a pharmacy?{" "}
            <Link href="/auth/pharmacy-signup" className="font-bold text-teal-700 hover:text-teal-900">
              Register your pharmacy
            </Link>
          </p>
        </div>
        </section>
      </div>
    </main>
  );
}
