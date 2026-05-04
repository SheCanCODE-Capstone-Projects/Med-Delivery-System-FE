"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { login } from "@/services/authApi";

const trustPoints = [
  "Insurance verification built in",
  "Location-based pharmacy matching",
  "Prescription-safe delivery workflow"
];

const accessCards = [
  { title: "Patients", detail: "Track medicine requests, insurance, and delivery." },
  { title: "Pharmacists", detail: "Validate prescriptions and confirm dispensing." },
  { title: "Pharmacies", detail: "Coordinate stock, approvals, and fulfillment." },
  { title: "Super Admin", detail: "Review pharmacy onboarding and activate the network." }
];

const socialProviders = [
  {
    name: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.34 2.97-7.26Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.24-2.5c-.9.6-2.06.96-3.37.96-2.59 0-4.79-1.75-5.57-4.1H3.08v2.58A9.99 9.99 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M6.43 13.93A5.98 5.98 0 0 1 6.12 12c0-.67.11-1.31.31-1.93V7.49H3.08A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.08 4.51l3.35-2.58Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.97c1.47 0 2.8.5 3.84 1.49l2.88-2.88C16.95 2.94 14.69 2 12 2a9.99 9.99 0 0 0-8.92 5.49l3.35 2.58c.78-2.35 2.98-4.1 5.57-4.1Z"
        />
      </svg>
    )
  },
  {
    name: "Microsoft",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
        <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
        <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
        <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
      </svg>
    )
  },
  {
    name: "Yahoo",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#6001D2"
          d="M16.8 3h3.42l-4.12 9.17L17.95 21h-3.3l-1.24-6.14L9.87 21H6.52l5.03-8.95L8.1 3h3.37l2.04 5.64L16.8 3Zm.27 18h2.75l.57-3.22h-2.75L17.07 21Z"
        />
      </svg>
    )
  }
];

const roleRoutes: Record<string, string> = {
  patient: "/patient-dashboard",
  pharmacist: "/pharmacist",
  pharmacy: "/Pharmacy-admin",
  "super-admin": "/super-admin"
};

const phonePattern = /^\+?\d[\d\s-]{8,14}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeIdentifier(value: string) {
  return value.trim();
}

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const normalizedUsername = useMemo(() => normalizeIdentifier(username), [username]);

  const validateCredentials = () => {
    const isEmail = emailPattern.test(normalizedUsername);
    const isPhone = phonePattern.test(normalizedUsername);

    if (!isEmail && !isPhone) {
      setError("Enter a valid phone number or email address.");
      return false;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSigningIn) {
      return;
    }

    setError("");

    if (!validateCredentials()) {
      return;
    }

    setIsSigningIn(true);

    try {
      const response = await login({
        username: normalizedUsername,
        password
      });

      const nextRoute = roleRoutes[response.user?.roleKey ?? "patient"] ?? roleRoutes.patient;
      router.push(nextRoute);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign in failed.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,160,0.12),transparent_34%),linear-gradient(135deg,#edf5f8_0%,#f7f9fc_45%,#eef6f7_100%)] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(14,165,160,0.28),transparent_28%),linear-gradient(180deg,#11192f_0%,#0b1326_100%)] px-5 py-5 text-white sm:px-7 lg:min-h-screen lg:flex-col lg:justify-between lg:px-8 xl:px-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-76 w-76 rounded-full bg-[rgba(14,165,160,0.22)] blur-xl" />
          <div className="pointer-events-none absolute -left-16 bottom-12 h-64 w-64 rounded-full bg-[rgba(14,165,160,0.12)] blur-xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-[1.35rem] border border-white/10 bg-[#121a2f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:h-18 sm:w-18">
                <svg viewBox="0 0 48 48" className="h-10 w-10 sm:h-11 sm:w-11" aria-hidden="true">
                  <rect x="6" y="17" width="21" height="11" rx="3.5" fill="white" opacity="0.96" />
                  <path
                    d="M27 20h7.2c1.4 0 2.74.63 3.66 1.72L41 25.6V31h-4.2"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.5 12h5v3.4h3.5v5h-3.5v3.4h-5v-3.4H9v-5h3.5V12Z"
                    fill="#0f766e"
                  />
                  <path
                    d="M10 22.5h13"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M31 20v7.2h9.2"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 31h2.7M38.8 31H41"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="31.5" r="4.2" fill="#0f172a" />
                  <circle cx="34" cy="31.5" r="4.2" fill="#0f172a" />
                  <circle cx="14" cy="31.5" r="1.7" fill="white" opacity="0.9" />
                  <circle cx="34" cy="31.5" r="1.7" fill="white" opacity="0.9" />
                  <path
                    d="M4.8 18.5c2-.2 3.55-1.08 4.64-2.64M4.2 22.6c2.6-.13 4.55-1.12 5.86-2.98"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.82"
                  />
                </svg>
              </div>

              <div>
                <p className="text-[1.7rem] leading-none font-semibold tracking-tight sm:text-[2rem]">
                  <span className="text-white">Med</span>
                  <span className="text-teal-400">Delivery</span>
                </p>
                <p className="mt-1 text-[11px] text-white/65 sm:text-sm">
                  Your Pharmacy, Delivered to Your Door
                </p>
              </div>
            </div>

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

            <div className="relative z-10 mt-5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {accessCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                >
                  <p className="text-sm font-bold">{card.title}</p>
                  <span className="mt-1.5 block text-xs leading-5 text-white/70">{card.detail}</span>
                </article>
              ))}
            </div>
          </div>

          <p className="relative z-10 mt-4 text-xs text-white/40 sm:text-sm lg:mt-5">
            {new Date().getFullYear()} MedDelivery. Safe delivery, verified every step.
          </p>
        </section>

        <section className="grid place-items-center px-5 py-5 sm:px-8">
          <div className="w-full max-w-2xl rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_24px_56px_rgba(11,19,39,0.16)] backdrop-blur-xl sm:p-8">
            <div className="grid grid-cols-3 gap-2" aria-hidden="true">
              <span className="h-1 rounded-full bg-linear-to-r from-teal-400 to-teal-600" />
              <span className="h-1 rounded-full bg-slate-200" />
              <span className="h-1 rounded-full bg-slate-200" />
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">
                User sign in
              </p>
              <h2 className="mt-2 text-[2.05rem] leading-none font-semibold tracking-tighter text-slate-900 sm:text-[2.25rem]">
                Welcome back to MedDelivery
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                Sign in with your phone number and password.
              </p>
            </div>

            {error ? (
              <p
                role="alert"
                aria-live="polite"
                className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {error}
              </p>
            ) : null}

            <form className="mt-5 grid gap-3.5" onSubmit={handleSubmit} autoComplete="off">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-600">Username</span>
                <input
                  type="text"
                  name="username_login"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isSigningIn}
                  placeholder="Phone number or email"
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-600">Password</span>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="secure_login_passcode"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) {
                        setError("");
                      }
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={isSigningIn}
                    placeholder="........"
                    className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isSigningIn}
                    className="grid min-h-14 place-items-center rounded-2xl border border-slate-200 px-5 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path
                          d="M3 3l18 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.88 5.09A9.77 9.77 0 0 1 12 4c5 0 9 8 9 8a15.1 15.1 0 0 1-2.16 2.94M6.71 6.7C4.03 8.18 3 12 3 12s4 8 9 8a9.8 9.8 0 0 0 5.29-1.53"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path
                          d="M2 12s3.64-7 10-7 10 7 10 7-3.64 7-10 7-10-7-10-7Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSigningIn}
                className="min-h-14 rounded-2xl bg-linear-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSigningIn ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="h-px bg-slate-200" aria-hidden="true" />
              <p className="text-center text-sm font-semibold text-slate-500">
                Continue with
              </p>
              <span className="h-px bg-slate-200" aria-hidden="true" />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {socialProviders.map((provider) => (
                <button
                  key={provider.name}
                  type="button"
                  disabled
                  aria-disabled="true"
                  title={`${provider.name} sign-in coming soon`}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {provider.icon}
                  <span>{provider.name}</span>
                </button>
              ))}
            </div>

            <p className="mt-5 text-center text-sm text-slate-500">
              If you don&apos;t have an account,{" "}
              <Link href="/signup" className="font-bold text-teal-700 transition hover:text-teal-900">
                sign up
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}