"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Handshake,
  ClipboardCheck,
  Settings,
  LogOut,
  Package2,
  UserRound,
} from 'lucide-react';
import MedDeliveryLogo from '../brand/MedDeliveryLogo';
import { logout, getUserName } from '@/services/authApi';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
}

const NavItem = ({ href, icon: Icon, label, exact = false }: NavItemProps) => {
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
      <span>{label}</span>
    </Link>
  );
};

export default function PharmacyAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  useEffect(() => { setUserName(getUserName()); }, []);

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-[#f7f9fc] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex flex-col pt-6 h-full shrink-0 shadow-xl relative z-20">
        <div className="px-6 mb-8">
          <MedDeliveryLogo href="/Pharmacy-admin" theme="dark" size="sm" showTagline={false} />
        </div>

        <div className="px-6 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20">
            Pharmacy Admin
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavItem 
            href="/Pharmacy-admin" 
            label="Dashboard" 
            icon={LayoutDashboard} 
            exact 
          />
          <NavItem href="/Pharmacy-admin/employees" label="Manage Personnel" icon={Users} />
          <NavItem href="/Pharmacy-admin/patients" label="Patients" icon={UserRound} />
          <NavItem href="/Pharmacy-admin/orders" label="Order Oversight" icon={ClipboardCheck} />
          <NavItem href="/Pharmacy-admin/inventory" label="Inventory" icon={Package2} />
          <NavItem href="/Pharmacy-admin/partners" label="Insurance" icon={Handshake} />
          <NavItem href="/Pharmacy-admin/settings" label="System Settings" icon={Settings} />
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="px-4 mb-3">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {userName ?? 'Pharmacy Admin'}
            </p>
            <p className="text-xs text-teal-400 font-medium">pharmacy manager</p>
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
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-base font-bold text-slate-800">Pharmacy Admin</h1>
            <p className="text-xs text-slate-500">Pharmacy management portal</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <span className="text-xs font-bold text-teal-600">
                {userName ? userName.slice(0, 2).toUpperCase() : 'PA'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {userName?.split(' ')[0] ?? 'Admin'}
              </span>
              <span className="text-xs text-teal-600 font-medium">pharmacy manager</span>
            </div>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto bg-[#f7f9fc]">
          {children}
        </div>
      </main>
    </div>
  );
}
