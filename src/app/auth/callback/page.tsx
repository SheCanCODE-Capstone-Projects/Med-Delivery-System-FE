"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { setTokens } from "@/services/apiClient";
import { roleToRoute } from "@/services/authApi";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const role = searchParams.get("role");
    const name = searchParams.get("name");
    const pharmacyId = searchParams.get("pharmacyId");

    if (!token || !role) {
      setError(
        "Google sign-in did not return valid credentials. " +
        "This usually means the backend OAuth2 configuration needs to be " +
        "pointed at this page. Please try signing in with email/password or " +
        "contact support."
      );
      return;
    }

    setTokens(token, refreshToken ?? undefined);
    localStorage.setItem("user_role", role);
    if (name) localStorage.setItem("user_name", decodeURIComponent(name));
    if (pharmacyId) localStorage.setItem("pharmacy_id", pharmacyId);

    router.replace(roleToRoute(role));
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Sign-in failed</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">{error}</p>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <MedDeliveryLogo href="/" theme="light" size="sm" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-3" />
        <p className="text-slate-600 font-semibold">Completing Google sign-in…</p>
        <p className="text-slate-400 text-sm mt-1">You will be redirected shortly.</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
