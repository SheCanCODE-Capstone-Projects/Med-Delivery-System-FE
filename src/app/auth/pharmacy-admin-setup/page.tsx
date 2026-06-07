"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Building2, CheckCircle2 } from 'lucide-react';
import { validateInvitationToken, setupPharmacyAdmin, type PharmacyAdminSetupRequest } from '@/services/invitationService';
import MedDeliveryLogo from '@/components/brand/MedDeliveryLogo';

function PharmacyAdminSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [prefillEmail, setPrefillEmail] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState<PharmacyAdminSetupRequest>({
    token,
    fullName: '',
    password: '',
    pharmacyName: '',
    pharmacyCode: '',
    licenseNumber: '',
    address: '',
    contactInfo: '',
    insuranceProviderIds: [],
  });

  useEffect(() => {
    if (!token) { setTokenError('No invitation token found.'); setValidating(false); return; }
    validateInvitationToken(token)
      .then((data) => {
        if (data.type !== 'PHARMACY_ADMIN') {
          setTokenError('This link is not for pharmacy admin setup.');
          return;
        }
        setPrefillEmail(data.email);
        setForm((f) => ({ ...f, token }));
      })
      .catch((e) => setTokenError(e instanceof Error ? e.message : 'Invalid or expired invitation link.'))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true); setSubmitError('');
    try {
      await setupPharmacyAdmin(form);
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
        <h1 className="text-xl font-bold text-slate-800 mb-2">Pharmacy Submitted!</h1>
        <p className="text-slate-500 text-sm mb-6">
          Your pharmacy registration is pending Super Admin approval. You will receive an email once approved and can then log in.
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
          <Building2 size={20} className="text-teal-600" />
          <h1 className="text-xl font-bold text-slate-800">Pharmacy Admin Setup</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          You have been invited to register a pharmacy on MedDelivery. Complete the form below to get started.
        </p>
        {prefillEmail && (
          <div className="mb-4 px-3 py-2 bg-teal-50 border border-teal-100 rounded-lg text-teal-700 text-xs font-semibold">
            Invited email: {prefillEmail}
          </div>
        )}
        {submitError && (
          <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm">{submitError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Your Account</h2>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name *</label>
            <input required value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Password *</label>
            <input required type="password" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Choose a strong password" />
          </div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Pharmacy Details</h2>
          {[
            { field: 'pharmacyName', label: 'Pharmacy Name *', required: true },
            { field: 'pharmacyCode', label: 'Pharmacy Code *', required: true },
            { field: 'licenseNumber', label: 'License Number *', required: true },
            { field: 'address', label: 'Address *', required: true },
            { field: 'contactInfo', label: 'Contact Info', required: false },
          ].map(({ field, label, required }) => (
            <div key={field}>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{label}</label>
              <input
                required={required}
                value={(form as unknown as Record<string, string>)[field] ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          ))}
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PharmacyAdminSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    }>
      <PharmacyAdminSetupContent />
    </Suspense>
  );
}
