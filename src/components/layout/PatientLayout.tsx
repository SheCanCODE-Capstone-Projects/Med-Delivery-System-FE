"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  CreditCard,
  UserRound,
  BarChart2,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react';
import MedDeliveryLogo from '../brand/MedDeliveryLogo';
import NotificationBell from '@/components/notifications/NotificationBell';
import { logout, getUserName } from '@/services/authApi';

const BASE = '/patient-dashboard';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, label, exact = false, onClick }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setUserName(getUserName()); }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push('/auth/login');
  };

  const sidebarContent = (
    <>
      <div className="px-6 mb-8 flex items-center justify-between">
        <MedDeliveryLogo href={BASE} theme="dark" size="sm" showTagline={true} />
        <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/20">
          <Heart size={10} />
          Patient
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <NavItem href={BASE}                    icon={LayoutDashboard} label="Dashboard"     exact onClick={closeSidebar} />
        <NavItem href={`${BASE}/orders`}        icon={ShoppingBag}     label="My Orders"     onClick={closeSidebar} />
        <NavItem href={`${BASE}/prescriptions`} icon={FileText}        label="Prescriptions" onClick={closeSidebar} />
        <NavItem href={`${BASE}/insurance`}     icon={CreditCard}      label="Insurance"     onClick={closeSidebar} />
        <NavItem href={`${BASE}/profile`}       icon={UserRound}       label="My Profile"    onClick={closeSidebar} />
        <NavItem href={`${BASE}/reports`}       icon={BarChart2}       label="My Report"     onClick={closeSidebar} />
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="px-4 mb-3">
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {userName ?? 'Patient'}
          </p>
          <p className="text-xs text-sky-400 font-medium">patient</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f7f9fc] text-slate-800 font-sans overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={closeSidebar} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-[#0F172A] border-r border-white/5 flex flex-col pt-6 shadow-xl
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800">Patient Portal</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Your health &amp; orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-9 h-9 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shrink-0">
              <span className="text-xs font-bold text-sky-700">
                {userName ? userName.slice(0, 2).toUpperCase() : 'PT'}
              </span>
            </div>
            <div className="flex-col hidden sm:flex">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {userName?.split(' ')[0] ?? 'Patient'}
              </span>
              <span className="text-xs text-sky-600 font-medium">patient</span>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto bg-[#f7f9fc]">
          {children}
        </div>
      </main>
    </div>
  );
}
