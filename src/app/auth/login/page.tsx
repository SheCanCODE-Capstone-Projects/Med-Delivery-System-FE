"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { login, roleToRoute } from "@/services/authApi";
import { BASE_URL } from "@/services/apiClient";

const trustPoints = [
  "Insurance verification built in",
  "Location-based pharmacy matching",
  "Prescription-safe delivery workflow",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?\d[\d\s-]{8,14}$/;
const copyrightYear = new Date().getFullYear();

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isSigningInRef = useRef(false);

  const normalizedUsername = useMemo(() => username.trim(), [username]);

  const validateCredentials = () => {
    const isEmail = emailPattern.test(normalizedUsername);
    const isPhone = phonePattern.test(normalizedUsername);
    if (!isEmail && !isPhone) {
      setError("Enter a valid phone number or email address.");
      return false;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (isSigningInRef.current) return;
    setError("");
    if (!validateCredentials()) return;

    isSigningInRef.current = true;
    setIsSigningIn(true);
    try {
      const response = await login({ username: normalizedUsername, password });
      router.push(roleToRoute(response.role));
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign in failed.");
    } finally {
      isSigningInRef.current = false;
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <main className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,160,0.12),transparent_34%),linear-gradient(135deg,#edf5f8_0%,#f7f9fc_45%,#eef6f7_100%)] text-slate-950">
      <div className="grid h-full min-h-0 lg:grid-cols-[minmax(480px,0.9fr)_minmax(560px,1.1fr)]">
        {/* Left panel */}
        <section className="relative hidden min-h-0 overflow-hidden bg-[#013B41] py-[clamp(1rem,3vh,2.5rem)] pl-[clamp(2.5rem,6vw,5rem)] pr-[clamp(1rem,3vh,2.5rem)] text-white lg:flex lg:h-full lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-16 -top-24 h-76 w-76 rounded-full bg-[rgba(14,165,160,0.22)] blur-xl" />
          <div className="pointer-events-none absolute -left-16 bottom-12 h-64 w-64 rounded-full bg-[rgba(14,165,160,0.12)] blur-xl" />

          <div className="relative z-10">
            <MedDeliveryLogo href="/" theme="dark" size="sm" />
            <div className="relative z-10 mt-6 max-w-xl lg:mt-8">
              <span className="inline-flex min-h-8 items-center rounded-full border border-white/10 bg-white/5 px-4 text-[11px] text-white/75 sm:text-xs">
                Care network for patients, pharmacies and pharmacists
              </span>
              <h1 className="mt-3 text-[2.05rem] leading-[0.98] font-semibold tracking-tighter sm:text-[2.45rem] lg:text-[2.9rem] xl:text-[3.1rem]">
                Smarter medicine access,
                <br />
                <span className="text-teal-400">designed for trust.</span>
              </h1>
              <p className="mt-2 max-w-md text-xs leading-5 text-white/70 sm:text-sm">
                Secure medicine delivery with prescription validation and nearby pharmacy support.
              </p>
            </div>
            <ul className="relative z-10 mt-5 grid gap-2">
              {trustPoints.map((item) => (
                <li key={item} className="flex items-center gap-3 text-xs text-white/85 sm:text-sm">
                  <span className="h-4 w-4 rounded-full border border-teal-300/80 shadow-[inset_0_0_0_4px_rgba(26,196,189,0.18)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 mt-4 text-xs text-white/40 sm:text-sm lg:mt-5">
            {copyrightYear} MedDelivery. Safe delivery, verified every step.
          </p>
        </section>

        {/* Right panel */}
        <section className="grid h-full min-h-0 place-items-center overflow-hidden px-4 py-[clamp(0.75rem,3vh,1.25rem)] sm:px-6 lg:px-8 xl:px-10">
          <div className="my-auto w-full max-w-[42rem] rounded-3xl border border-white/70 bg-white/85 p-[clamp(1.45rem,3.6vh,2.35rem)] shadow-[0_24px_56px_rgba(11,19,39,0.16)] backdrop-blur-xl">
            <MedDeliveryLogo href="/" theme="light" size="sm" className="mb-5 lg:hidden" />

            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">Sign in</p>
              <h2 className="mt-2 text-[2rem] leading-none font-semibold tracking-tighter text-slate-900">
                Welcome back
              </h2>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <form className="mt-4 grid gap-4" onSubmit={handleSubmit} autoComplete="on">
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-slate-600">Username</span>
                <input type="text" name="username" value={username}
                  onChange={(e) => { setUsername(e.target.value); if (error) setError(""); }}
                  autoComplete="username" spellCheck={false} disabled={isSigningIn}
                  placeholder="Phone number or email"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-60" />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-slate-600">Password</span>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                    autoComplete="current-password" spellCheck={false} disabled={isSigningIn}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-60" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-end">
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-teal-700 hover:text-teal-900">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isSigningIn}
                className="h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
                {isSigningIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Signing in…
                  </span>
                ) : "Sign in"}
              </button>
            </form>

            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="h-px bg-slate-200" />
              <p className="text-center text-sm font-semibold text-slate-500">or</p>
              <span className="h-px bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.34 2.97-7.26Z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.24-2.5c-.9.6-2.06.96-3.37.96-2.59 0-4.79-1.75-5.57-4.1H3.08v2.58A9.99 9.99 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.43 13.93A5.98 5.98 0 0 1 6.12 12c0-.67.11-1.31.31-1.93V7.49H3.08A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.08 4.51l3.35-2.58Z" />
                <path fill="#EA4335" d="M12 5.97c1.47 0 2.8.5 3.84 1.49l2.88-2.88C16.95 2.94 14.69 2 12 2a9.99 9.99 0 0 0-8.92 5.49l3.35 2.58c.78-2.35 2.98-4.1 5.57-4.1Z" />
              </svg>
              Continue with Google
            </button>

            <p className="mt-5 text-center text-sm text-slate-500">
              New patient?{" "}
              <Link href="/auth/signup" className="font-bold text-teal-700 hover:text-teal-900">
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
