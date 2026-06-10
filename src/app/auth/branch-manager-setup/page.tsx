"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, GitBranch, CheckCircle2, MapPin } from 'lucide-react';
import { validateInvitationToken, setupBranchManager, type BranchManagerSetupRequest } from '@/services/invitationService';
import MedDeliveryLogo from '@/components/brand/MedDeliveryLogo';

function BranchManagerSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillBranchName, setPrefillBranchName] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState<BranchManagerSetupRequest>({
    token,
    fullName: '',
    password: '',
    branchName: '',
    address: '',
    contactInfo: '',
  });

  useEffect(() => {
    if (!token) { setTokenError('No invitation token found.'); setValidating(false); return; }
    validateInvitationToken(token)
      .then((data) => {
        if (data.type !== 'BRANCH_MANAGER') {
          setTokenError('This link is not for branch manager setup.');
          return;
        }
        setPrefillEmail(data.email);
        try {
          const payload = JSON.parse(data.payload);
          if (payload.branchName) {
            setPrefillBranchName(payload.branchName);
            setForm((f) => ({ ...f, token, branchName: payload.branchName }));
          }
        } catch { /* ignore parse error */ }
      })
      .catch((e) => setTokenError(e instanceof Error ? e.message : 'Invalid or expired invitation link.'))
      .finally(() => setValidating(false));
  }, [token]);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setForm((f) => ({ ...f, address: data.display_name ?? `${latitude}, ${longitude}` }));
        } catch {
          // silently ignore reverse-geocode errors
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true); setSubmitError('');
    try {
      await setupBranchManager(form);
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
        <h1 className="text-xl font-bold text-slate-800 mb-2">Branch Created!</h1>
        <p className="text-slate-500 text-sm mb-6">
          Your branch has been created and your account is active. You can now log in to access your branch manager portal.
        </p>
        <button onClick={() => router.push('/auth/login')}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700">
          Go to Login
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
        <div className="flex items-center gap-2 mb-6">
          <GitBranch size={20} className="text-teal-600" />
          <h1 className="text-xl font-bold text-slate-800">Branch Manager Setup</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          You have been invited to manage a branch on MedDelivery. Complete the form below to activate your account.
        </p>
        {submitError && (
          <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm">{submitError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Your Account</h2>
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
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Password *</label>
            <input required type="password" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Choose a strong password" />
          </div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Branch Details</h2>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Branch Name *</label>
            <input required value={form.branchName}
              readOnly={!!prefillBranchName}
              onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${prefillBranchName ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
            {prefillBranchName && <p className="text-xs text-teal-600 font-semibold mt-1">Pre-filled from your invitation</p>}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
              <button type="button" onClick={handleGPS} disabled={locating}
                className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:text-teal-700 disabled:opacity-50 transition">
                {locating ? <Loader2 size={11} className="animate-spin" /> : <MapPin size={11} />}
                {locating ? 'Locating…' : 'Use GPS'}
              </button>
            </div>
            <input value={form.address ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Branch street address"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Phone Number (optional)</label>
            <input type="tel" autoComplete="tel" value={form.contactInfo ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, contactInfo: e.target.value }))}
              placeholder="+250 7XX XXX XXX"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <p className="text-xs text-slate-400 mt-1">Your mobile or office number</p>
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

export default function BranchManagerSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    }>
      <BranchManagerSetupContent />
    </Suspense>
  );
}
