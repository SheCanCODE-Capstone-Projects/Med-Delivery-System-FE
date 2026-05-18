"use client";
import React, { useState } from 'react';
import { 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Lock, 
  Save,
  LogOut,
  Plus
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Sub-components ---

const SettingsSection = ({ title, description, children }: any) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="p-8 border-b border-slate-50">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 font-medium">{description}</p>
    </div>
    <div className="p-8 space-y-6">
      {children}
    </div>
  </div>
);

const SettingRow = ({ label, description, children, icon: Icon }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 first:pt-0 border-b border-slate-50 last:border-0 last:pb-0">
    <div className="flex gap-4">
      {Icon && (
        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 shrink-0 h-fit">
          <Icon size={18} />
        </div>
      )}
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-3 self-end md:self-center">
      {children}
    </div>
  </div>
);

const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={cn(
      "w-11 h-6 rounded-full transition-all duration-200 relative",
      enabled ? "bg-[#0ABFBC]" : "bg-slate-200"
    )}
  >
    <div className={cn(
      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200",
      enabled ? "translate-x-5" : "translate-x-0"
    )} />
  </button>
);

export default function SystemSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [apiLogs, setApiLogs] = useState(true);

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#004d4d] tracking-tight">System Settings</h1>
          <p className="text-slate-500 font-medium">Global platform configuration and security management.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#0ABFBC] text-[#040F1A] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#5EDEDD] transition-all shadow-lg shadow-teal-900/10 active:scale-95">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Settings */}
        <SettingsSection 
          title="Administrative Profile" 
          description="Manage your platform identity and contact information."
        >
          <div className="flex items-center gap-6 pb-4 border-b border-slate-50">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-lg shadow-md border border-slate-100 text-slate-500 hover:text-[#0ABFBC] transition-all">
                <Plus size={14} />
              </button>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 tracking-tight">System Administrator</p>
              <p className="text-sm text-slate-400 font-medium">Head of Operations</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-[rgba(10,191,188,0.1)] text-[10px] font-bold text-[#089A97] uppercase tracking-widest border border-[rgba(10,191,188,0.2)]">Superuser</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">Verified</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Display Name</label>
              <input type="text" defaultValue="System Admin" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ABFBC]/20 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
              <input type="email" defaultValue="admin@meddelivery.rw" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ABFBC]/20 transition-all" />
            </div>
          </div>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection 
          title="Security & Access" 
          description="Maintain the integrity of the admin portal with multi-layer security."
        >
          <SettingRow 
            icon={Lock}
            label="Two-Factor Authentication" 
            description="Add an extra layer of security by requiring a code from your phone."
          >
            <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
          </SettingRow>

          <SettingRow 
            icon={Shield}
            label="IP Whitelisting" 
            description="Restrict portal access to specific administrative offices only."
          >
            <button className="text-xs font-bold text-[#089A97] hover:bg-[rgba(10,191,188,0.05)] px-3 py-1.5 rounded-lg transition-all">Configure IPs</button>
          </SettingRow>

          <SettingRow 
            icon={LogOut}
            label="Session Management" 
            description="Force terminate all active sessions across all devices."
          >
            <button className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">Invalidate All</button>
          </SettingRow>
        </SettingsSection>

        {/* System Config */}
        <SettingsSection 
          title="Platform Configuration" 
          description="Adjust notification triggers and system-level logging."
        >
          <SettingRow 
            icon={Bell}
            label="Global Push Notifications" 
            description="Broadcast alerts to all active pharmacy stations in real-time."
          >
            <Toggle enabled={notifications} onChange={() => setNotifications(!notifications)} />
          </SettingRow>

          <SettingRow 
            icon={Database}
            label="Detailed API Logging" 
            description="Capture full request/response bodies for debugging integration issues."
          >
            <Toggle enabled={apiLogs} onChange={() => setApiLogs(!apiLogs)} />
          </SettingRow>

          <SettingRow 
            icon={Globe}
            label="Maintenance Mode" 
            description="Temporarily disable public access while ensuring admin availability."
          >
            <button className="flex items-center gap-2 text-xs font-bold bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-all">
              Activate Mode
            </button>
          </SettingRow>
        </SettingsSection>

        {/* Footer info */}
        <div className="text-center pt-8 border-t border-slate-100">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">MedDelivery Admin Engine v4.2.4-STABLE</p>
           <p className="text-[10px] text-slate-300 font-medium mt-1">Last configuration sync: Today at 09:42 AM</p>
        </div>
      </div>
    </div>
  );
}
