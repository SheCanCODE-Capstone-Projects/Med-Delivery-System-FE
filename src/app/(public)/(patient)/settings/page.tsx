'use client';

import React, { useState } from 'react';
import PatientAppShell from '@/components/layout/PatientAppShell';
import {
  Lock,
  Bell,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Loader2,
  Smartphone,
  Mail,
  Shield,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────
interface NotificationSettings {
  orderUpdates: boolean;
  prescriptionReady: boolean;
  promotions: boolean;
  smsAlerts: boolean;
  emailAlerts: boolean;
}

interface PasswordData {
  current: string;
  newPass: string;
  confirm: string;
}

// ─── Toggle Switch ────────────────────────────────────────
function ToggleSwitch({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: () => void;
  label: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
        enabled ? 'bg-teal-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Notification Row ─────────────────────────────────────
function NotificationRow({
  icon: Icon,
  label,
  description,
  enabled,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-50 rounded-lg mt-0.5">
          <Icon size={16} className="text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} label={label} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function PatientSettingsPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'security' | 'notifications'>('security');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [passwords, setPasswords] = useState<PasswordData>({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    orderUpdates: true,
    prescriptionReady: true,
    promotions: false,
    smsAlerts: true,
    emailAlerts: false,
  });

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNotification = (key: keyof NotificationSettings): void => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs: { id: 'security' | 'notifications'; label: string; icon: React.ElementType }[] = [
    { id: 'security',      label: 'Security',      icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <PatientAppShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your account security and notification preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* ── Security Tab ── */}
        {activeTab === 'security' && (
          <>
            <SectionCard
              title="Change Password"
              subtitle="Make sure your new password is at least 8 characters long."
            >
              <div className="p-6 space-y-4">
                {/* Current password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      name="current"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      className="w-full px-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Toggle current password visibility"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* New password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        name="newPass"
                        value={passwords.newPass}
                        onChange={handlePasswordChange}
                        className="w-full px-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle new password visibility"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirm"
                        value={passwords.confirm}
                        onChange={handlePasswordChange}
                        className="w-full px-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-4">
                {showSuccess && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                    <CheckCircle2 size={16} />
                    Password updated!
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </SectionCard>

            {/* 2FA */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <Shield size={18} className="text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Add an extra layer of security using OTP on your phone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm font-bold hover:bg-teal-50 transition"
              >
                Enable 2FA
              </button>
            </div>
          </>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === 'notifications' && (
          <SectionCard
            title="Notification Preferences"
            subtitle="Choose how and when you want to be notified about your orders."
          >
            <div className="px-6">
              <NotificationRow
                icon={Bell}
                label="Order Updates"
                description="Get notified when your order status changes."
                enabled={notifications.orderUpdates}
                onChange={() => toggleNotification('orderUpdates')}
              />
              <NotificationRow
                icon={CheckCircle2}
                label="Prescription Ready"
                description="Get notified when your prescription is validated and ready."
                enabled={notifications.prescriptionReady}
                onChange={() => toggleNotification('prescriptionReady')}
              />
              <NotificationRow
                icon={Mail}
                label="Email Alerts"
                description="Receive order and delivery updates via email."
                enabled={notifications.emailAlerts}
                onChange={() => toggleNotification('emailAlerts')}
              />
              <NotificationRow
                icon={Smartphone}
                label="SMS Alerts"
                description="Receive order updates via SMS on your phone."
                enabled={notifications.smsAlerts}
                onChange={() => toggleNotification('smsAlerts')}
              />
              <NotificationRow
                icon={Bell}
                label="Promotions & Offers"
                description="Hear about discounts and special offers from pharmacies."
                enabled={notifications.promotions}
                onChange={() => toggleNotification('promotions')}
              />
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-4">
              {showSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                  <CheckCircle2 size={16} />
                  Preferences saved!
                </div>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </SectionCard>
        )}
      </div>
    </PatientAppShell>
  );
}