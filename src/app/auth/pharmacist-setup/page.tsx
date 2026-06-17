"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Pill, CheckCircle2 } from 'lucide-react';
import { validateInvitationToken, setupPharmacist, type PharmacistSetupRequest } from '@/services/invitationService';
import MedDeliveryLogo from '@/components/brand/MedDeliveryLogo';

function PharmacistSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [prefillEmail, setPrefillEmail] = useState('');
  const [locationName, setLocationName] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState<PharmacistSetupRequest>({
    token,
    fullName: '',
    password: '',
    phoneNumber: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) { setTokenError('No invitation token found.'); setValidating(false); return; }
    validateInvitationToken(token)
      .then((data) => {
        if (data.type !== 'PHARMACIST') {
          setTokenError('This link is not for pharmacist setup.');
          return;
        }
        setPrefillEmail(data.email);
        setForm((f) => ({ ...f, token }));
        try {
          const payload = JSON.parse(data.payload);
          if (payload.locationName) setLocationName(payload.locationName);
        } catch { /* ignore parse error */ }
      })
      .catch((e) => setTokenError(e instanceof Error ? e.message : 'Invalid or expired invitation link.'))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }
    setSubmitting(true); setSubmitError('');
    try {
      await setupPharmacist({
        ...form,
        phoneNumber: form.phoneNumber?.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Setup failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (validating) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-600" size={32} />
    </div>
  );

  if (tokenError) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-rose-500 text-4xl mb-4">⚠</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Invalid Invitation</h1>
        <p className="text-slate-500 text-sm mb-6">{tokenError}</p>
        <button onClick={() => router.push('/auth/login')}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700">
          Back to Login
        </button>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-800 mb-2">Account Activated!</h1>
        <p className="text-slate-500 text-sm mb-6">
          Your pharmacist account is ready. Sign in with <strong>{prefillEmail}</strong> and your new password to access your dashboard.
        </p>
        <button onClick={() => router.push('/auth/login')}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700">
          Go to Sign In
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <div className="flex justify-center mb-6">
          <MedDeliveryLogo theme="light" size="md" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Pill size={20} className="text-teal-600" />
          <h1 className="text-xl font-bold text-slate-800">Pharmacist Account Setup</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          You have been invited to join{locationName ? <> <strong className="text-slate-700">{locationName}</strong></> : ' MedDelivery'} as a pharmacist. Set your name and password to activate your account.
        </p>
        {submitError && (
          <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm">{submitError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {prefillEmail && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email Address</label>
              <input
                type="email"
                value={prefillEmail}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
              />
              <p className="text-xs text-teal-600 font-semibold mt-1">Pre-filled from your invitation — cannot be changed</p>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name *</label>
            <input required value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Phone Number (optional)</label>
            <input type="tel" autoComplete="tel" value={form.phoneNumber ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              placeholder="+250 7XX XXX XXX"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Password *</label>
            <input required type="password" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Choose a strong password (min. 6 characters)" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Confirm Password *</label>
            <input required type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Re-enter your password" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Activate My Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PharmacistSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    }>
      <PharmacistSetupContent />
    </Suspense>
  );
}
