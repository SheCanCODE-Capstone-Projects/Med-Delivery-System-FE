"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, RefreshCw } from "lucide-react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { sendOtp, verifyOtp, setPassword, roleToRoute } from "@/services/authApi";

const RESEND_COOLDOWN = 60;
const copyrightYear = new Date().getFullYear();

// ─── Set Password Step ─────────────────────────────────────────────────────────

function SetPasswordStep({
  username,
  otp,
  isPharmacist,
  onDone,
}: {
  username: string;
  otp: string;
  isPharmacist?: boolean;
  onDone: () => void;
}) {
  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");
    try {
      await setPassword({
        username,
        otp,
        password
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] rounded-3xl border border-white/70 bg-white/85 p-[clamp(1.4rem,3.5vh,2.2rem)] shadow-[0_24px_56px_rgba(11,19,39,0.14)] backdrop-blur-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-5">
        <KeyRound size={26} />
      </div>

      <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">One more step</p>
      <h2 className="mt-1.5 text-[1.85rem] leading-none font-semibold tracking-tighter text-slate-900">
        Create your password
      </h2>
      <p className="mt-1.5 text-sm text-slate-500">
        {isPharmacist
          ? "Set a password to activate your pharmacist account and start using the portal."
          : "Set a password to access your pharmacy portal once the admin approves your application."
        }
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => { setPasswordValue(e.target.value); setError(""); }}
              placeholder="Min. 8 characters"
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 pr-12 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Confirm password</label>
          <input
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(""); }}
            placeholder="Repeat your password"
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Setting password…</> : "Set password & continue"}
        </button>
      </form>
    </div>
  );
}

// ─── Pharmacist Activated Screen ───────────────────────────────────────────────

function PharmacistActivatedScreen({ username, router }: { username: string; router: ReturnType<typeof useRouter> }) {
  return (
    <main className="h-[100dvh] flex items-center justify-center bg-[linear-gradient(135deg,#edf5f8_0%,#f7f9fc_50%,#eef6f7_100%)] px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl border border-white/70 shadow-[0_24px_56px_rgba(11,19,39,0.14)] p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle2 className="h-8 w-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Account activated!</h2>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Your pharmacist account is ready. Sign in with{" "}
          <strong className="text-slate-700">{username}</strong> and your new password to access the
          pharmacist portal.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-6 w-full h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] hover:-translate-y-0.5 transition"
        >
          Go to sign in
        </button>
      </div>
    </main>
  );
}

// ─── Pending Review Screen ─────────────────────────────────────────────────────

function PendingReviewScreen({ username, router }: { username: string; router: ReturnType<typeof useRouter> }) {
  return (
    <main className="h-[100dvh] flex items-center justify-center bg-[linear-gradient(135deg,#edf5f8_0%,#f7f9fc_50%,#eef6f7_100%)] px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl border border-white/70 shadow-[0_24px_56px_rgba(11,19,39,0.14)] p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle2 className="h-8 w-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">You&apos;re all set!</h2>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Your identity is verified and your password is created. Your pharmacy registration is now
          pending review by the Super Admin.
        </p>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Once approved, sign in with{" "}
          <strong className="text-slate-700">{username}</strong> and your new password to access the
          pharmacy portal.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-6 w-full h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] hover:-translate-y-0.5 transition"
        >
          Go to sign in
        </button>
      </div>
    </main>
  );
}

// ─── OTP Inner ─────────────────────────────────────────────────────────────────

function OtpPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const username = params.get("username") ?? "";
  const after = params.get("after") ?? "";
  const isPharmacy = after === "pharmacy-submitted";
  const isPharmacist = after === "pharmacist-setup";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [slowWarning, setSlowWarning] = useState(false);
  const [error, setError] = useState("");
  // step: 'otp' → 'set-password' (pharmacy only) → 'done'
  const [step, setStep] = useState<"otp" | "set-password" | "done">("otp");
  const [submittedOtp, setSubmittedOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!username || sending) return;
    setSending(true);
    setSlowWarning(false);
    setError("");
    slowTimerRef.current = setTimeout(() => setSlowWarning(true), 10000);
    try {
      await sendOtp(username);
      startCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setSending(false);
      setSlowWarning(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    }
  };

  useEffect(() => {
    if (username && isPharmacy) {
      // Pharmacy flow: OTP was sent during registration — don't send again.
      // Start a 30s cooldown so the user checks their email before resending.
      setCooldown(30);
      cooldownRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) { clearInterval(cooldownRef.current!); return 0; }
          return c - 1;
        });
      }, 1000);
    } else if (username) {
      // Patient/pharmacist flow: auto-send OTP on mount
      handleSendOtp();
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
    if (error) setError("");
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) { setError("Enter all 6 digits of your code."); return; }
    setLoading(true);
    setSlowWarning(false);
    setError("");
    slowTimerRef.current = setTimeout(() => setSlowWarning(true), 10000);
    try {
      if (isPharmacy || isPharmacist) {
        // For pharmacy/pharmacist: set-password endpoint handles OTP verification + password in one call.
        // Skip verifyOtp so the OTP isn't consumed before set-password uses it.
        setSubmittedOtp(otp);
        setStep("set-password");
      } else {
        const auth = await verifyOtp({ username, otp });
        setStep("done");
        setTimeout(() => router.push(roleToRoute(auth.role)), 1200);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid code. Please try again.";
      const isExpired = msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('not found');
      setDigits(Array(6).fill(""));
      if (isExpired) {
        setError("Your code expired. Sending you a new one…");
        handleSendOtp();
      } else {
        setError(msg);
      }
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
      setSlowWarning(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    }
  };

  if (!username) {
    return (
      <main className="h-[100dvh] flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <p className="text-rose-600 font-semibold mb-4">Missing username — please register first.</p>
          <button onClick={() => router.push("/auth/signup")} className="text-sm font-bold text-teal-700 underline">
            Go to signup
          </button>
        </div>
      </main>
    );
  }

  if (step === "done" && isPharmacist) {
    return <PharmacistActivatedScreen username={username} router={router} />;
  }

  if (step === "done" && isPharmacy) {
    return <PendingReviewScreen username={username} router={router} />;
  }

  if (step === "done") {
    return (
      <main className="h-[100dvh] flex items-center justify-center bg-[linear-gradient(135deg,#edf5f8_0%,#f7f9fc_50%,#eef6f7_100%)] px-4">
        <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-3xl border border-white/70 shadow-[0_24px_56px_rgba(11,19,39,0.14)] p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
            <CheckCircle2 className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Verified!</h2>
          <p className="mt-2 text-sm text-slate-500">Your account is confirmed. Taking you to your dashboard…</p>
          <Loader2 className="mx-auto mt-4 animate-spin text-teal-600" size={20} />
        </div>
      </main>
    );
  }

  if (step === "set-password") {
    return (
      <main className="h-[100dvh] overflow-hidden text-slate-950 flex">
        <section className="hidden lg:flex flex-col justify-between w-[400px] xl:w-[440px] shrink-0 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(14,165,160,0.28),transparent_28%),linear-gradient(180deg,#11192f_0%,#0b1326_100%)] p-[clamp(1rem,3vh,2.5rem)] text-white">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[rgba(14,165,160,0.22)] blur-xl" />
          <div className="relative z-10">
            <MedDeliveryLogo href="/" theme="dark" size="sm" />
            <div className="mt-8 max-w-xs">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] text-white/70">
                Account Setup
              </span>
              <h1 className="mt-3 text-[2.3rem] leading-[1] font-semibold tracking-tighter">
                Almost there,
                <br />
                <span className="text-teal-400">set your password.</span>
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/60 max-w-[260px]">
                {isPharmacist
                  ? "Your identity is verified. Create a password to activate your pharmacist account."
                  : "Your identity is verified. Create a password so you can sign in once the admin approves your pharmacy."
                }
              </p>
            </div>
          </div>
          <p className="relative z-10 text-xs text-white/35">
            {copyrightYear} MedDelivery. Safe delivery, verified every step.
          </p>
        </section>
        <section className="flex-1 min-w-0 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(14,165,160,0.08),transparent_30%),linear-gradient(135deg,#edf5f8_0%,#f7f9fc_50%,#eef6f7_100%)]">
          <div className="flex min-h-full items-center justify-center px-4 py-8 sm:px-6">
            <SetPasswordStep username={username} otp={submittedOtp} isPharmacist={isPharmacist} onDone={() => setStep("done")} />
          </div>
        </section>
      </main>
    );
  }

  // ── OTP entry step ─────────────────────────────────────────────────────────
  return (
    <main className="h-[100dvh] overflow-hidden text-slate-950 flex">
      <section className="hidden lg:flex flex-col justify-between w-[400px] xl:w-[440px] shrink-0 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(14,165,160,0.28),transparent_28%),linear-gradient(180deg,#11192f_0%,#0b1326_100%)] p-[clamp(1rem,3vh,2.5rem)] text-white">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[rgba(14,165,160,0.22)] blur-xl" />
        <div className="pointer-events-none absolute -left-16 bottom-12 h-64 w-64 rounded-full bg-[rgba(14,165,160,0.12)] blur-xl" />
        <div className="relative z-10">
          <MedDeliveryLogo href="/" theme="dark" size="sm" />
          <div className="mt-8 max-w-xs">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] text-white/70">
              Account Verification
            </span>
            <h1 className="mt-3 text-[2.3rem] leading-[1] font-semibold tracking-tighter">
              One step left
              <br />
              <span className="text-teal-400">to get started.</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/60 max-w-[260px]">
              We sent a 6-digit verification code to confirm your identity before you can access your account.
            </p>
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/35">
          {copyrightYear} MedDelivery. Safe delivery, verified every step.
        </p>
      </section>

      <section className="flex-1 min-w-0 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(14,165,160,0.08),transparent_30%),linear-gradient(135deg,#edf5f8_0%,#f7f9fc_50%,#eef6f7_100%)]">
        <div className="flex min-h-full items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-[420px] rounded-3xl border border-white/70 bg-white/85 p-[clamp(1.4rem,3.5vh,2.2rem)] shadow-[0_24px_56px_rgba(11,19,39,0.14)] backdrop-blur-xl">
            <MedDeliveryLogo href="/" theme="light" size="sm" className="mb-5 lg:hidden" />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-5">
              <Mail size={26} />
            </div>

            <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">Verify your account</p>
            <h2 className="mt-1.5 text-[1.85rem] leading-none font-semibold tracking-tighter text-slate-900">
              Enter the code
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {isPharmacy
                ? <>A 6-digit code was sent to <strong className="text-slate-700 break-all">{username}</strong> when you registered your pharmacy.</>
                : <>We sent a 6-digit code to <strong className="text-slate-700 break-all">{username}</strong>.</>
              }
            </p>
            {isPharmacist && (
              <p className="mt-1 text-xs text-slate-400">Check your email — your pharmacy admin added you to the portal.</p>
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={loading}
                    className="h-14 w-12 rounded-2xl border-2 border-slate-200 bg-white text-center text-xl font-bold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 disabled:opacity-60"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || digits.join("").length < 6}
                className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 font-bold text-white shadow-[0_18px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Verifying…
                  </span>
                ) : (
                  "Verify account"
                )}
              </button>

              {(slowWarning || sending) && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  {slowWarning
                    ? "⏳ The server is responding slowly — please wait, do not refresh."
                    : sending
                      ? "📨 Sending your code, this may take up to 30 seconds…"
                      : null}
                </p>
              )}
            </form>

            <div className="mt-5 text-center">
              {cooldown > 0 ? (
                <p className="text-sm text-slate-400">
                  Resend code in <span className="font-bold text-slate-600">{cooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-60 transition"
                >
                  <RefreshCw size={14} className={sending ? "animate-spin" : ""} />
                  {sending ? "Sending…" : "Resend code"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <OtpPageInner />
    </Suspense>
  );
}
