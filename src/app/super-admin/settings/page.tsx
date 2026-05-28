"use client";
import React, { useState, useRef, useEffect } from 'react';

import {
  Settings,
  User,
  Lock,
  Bell,
  Database,
  Mail,
  Upload,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getAdminProfile, updateAdminProfile } from '@/services/adminApi';

// ─── Settings Page ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=SuperAdmin&backgroundColor=14b8a6`
  });

  useEffect(() => {
    getAdminProfile().then((data) => {
      const parts = (data.fullName ?? '').split(' ');
      setProfile((p) => ({
        ...p,
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' '),
        email: data.email ?? '',
        phone: data.phoneNumber ?? '',
      }));
    }).catch(() => {});
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System Configuration', icon: Database },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatar: url }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
      const updated = await updateAdminProfile({ fullName, phoneNumber: profile.phone });
      const parts = (updated.fullName ?? '').split(' ');
      setProfile((p) => ({
        ...p,
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' '),
        email: updated.email ?? p.email,
        phone: updated.phoneNumber ?? p.phone,
      }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your platform profile and global system configurations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  activeTab === tab.id 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider mb-2">
              <AlertCircle size={14} />
              Danger Zone
            </div>
            <p className="text-xs text-orange-600 mb-4 leading-relaxed">
              Actions here can affect entire system data. Handle with care.
            </p>
            <button className="w-full py-2 bg-white text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-50 transition">
              Maintenance Mode
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                <p className="text-sm text-slate-500">Update your profile details and avatar.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-teal-50 flex items-center justify-center border-2 border-teal-100 overflow-hidden">
                       <img src={profile.avatar} alt="profile" className="w-full h-full object-cover" />
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition text-teal-600"
                    >
                      <Upload size={14} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Super Admin Profile</h4>
                    <p className="text-sm text-slate-500">JPG, GIF or PNG. Max size of 800K</p>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-teal-600 hover:underline"
                      >
                        Change
                      </button>
                      <button 
                        onClick={() => setProfile(prev => ({ ...prev, avatar: `https://api.dicebear.com/7.x/initials/svg?seed=SuperAdmin&backgroundColor=14b8a6` }))}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={profile.firstName} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={profile.lastName} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email" 
                        name="email"
                        value={profile.email} 
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={profile.phone} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-4">
                {saveError && (
                  <div className="flex items-center gap-1.5 text-rose-600 text-sm font-semibold">
                    <AlertCircle size={16} />
                    {saveError}
                  </div>
                )}
                {showSuccess && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold animate-in fade-in slide-in-from-right-4">
                    <CheckCircle2 size={16} />
                    Changes saved successfully!
                  </div>
                )}
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">Password</h3>
                  <p className="text-sm text-slate-500">Change your password to keep your account secure.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                    <input type="password" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                      <input type="password" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Confirm New Password</label>
                      <input type="password" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition shadow-sm">
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                </div>
                <button className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm font-bold hover:bg-teal-50 transition">
                  Enable
                </button>
              </div>
            </div>
          )}

          {/* Other tabs follow similar patterns */}
          {(activeTab === 'notifications' || activeTab === 'system') && (
            <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Settings size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Advanced Settings</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                These configurations are currently locked for stability. Contact platform engineering for deep system changes.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
