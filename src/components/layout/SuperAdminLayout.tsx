"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Bell,
  Package,
  ScrollText,
  Receipt,
} from 'lucide-react';
import MedDeliveryLogo from '../brand/MedDeliveryLogo';
import { logout, getUserName } from '@/services/authApi';

const NavItem = ({
  href,
  exact = false,
  icon: Icon,
  label,
}: {
  href: string;
  exact?: boolean;
  icon: React.ElementType;
  label: string;
}) => {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  useEffect(() => { setUserName(getUserName()); }, []);

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-[#f7f9fc] text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex flex-col pt-6 fixed h-full z-10 shadow-xl">
        <div className="px-6 mb-8 flex items-center justify-start">
          <MedDeliveryLogo href="/super-admin/analytics" theme="dark" size="sm" showTagline={false} />
        </div>

        <div className="px-6 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20">
            <ShieldCheck size={12} />
            Super Admin
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem href="/super-admin/analytics" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/super-admin/pharmacies" icon={Building2} label="Pharmacies" />
          <NavItem href="/super-admin/orders" icon={Package} label="Orders" />
          <NavItem href="/super-admin/insurance-claims" icon={Receipt} label="Insurance" />
          <NavItem href="/super-admin/admins" icon={ShieldCheck} label="Users" />
          <NavItem href="/super-admin/patients" icon={Users} label="Patients" />
          <NavItem href="/super-admin/audit-logs" icon={ScrollText} label="Audit Logs" />
          <NavItem href="/super-admin/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="px-4 mb-3">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {userName ?? 'Super Admin'}
            </p>
            <p className="text-xs text-teal-400 font-medium">super admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-base font-bold text-slate-800">Super Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Platform-wide overview</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <span className="text-xs font-bold text-teal-600">
                  {userName ? userName.slice(0, 2).toUpperCase() : 'SA'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {userName?.split(' ')[0] ?? 'Admin'}
                </span>
                <span className="text-xs text-teal-600 font-medium">super admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
