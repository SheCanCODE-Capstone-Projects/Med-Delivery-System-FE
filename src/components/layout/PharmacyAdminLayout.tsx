"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart2,
  GitBranch,
  Shield,
} from 'lucide-react';
import MedDeliveryLogo from '../brand/MedDeliveryLogo';
import NotificationBell from '@/components/notifications/NotificationBell';
import GlobalSearch from '@/components/search/GlobalSearch';
import { logout, getUserName } from '@/services/authApi';

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
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-150 ${
        isActive
          ? 'bg-pharmacy-500 text-white shadow-md shadow-pharmacy-500/25 font-semibold'
          : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setUserName(getUserName()); }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push('/auth/login');
  };

  const navLinks = (
    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
      <NavItem href="/Pharmacy-admin" label="Dashboard" icon={LayoutDashboard} exact onClick={closeSidebar} />
      <NavItem href="/Pharmacy-admin/employees" label="Manage Personnel" icon={Users} onClick={closeSidebar} />
      <NavItem href="/Pharmacy-admin/branches" label="Branches" icon={GitBranch} onClick={closeSidebar} />
      <NavItem href="/Pharmacy-admin/insurance" label="Insurance" icon={Shield} onClick={closeSidebar} />
      <NavItem href="/Pharmacy-admin/reports" label="Reports" icon={BarChart2} onClick={closeSidebar} />
      <NavItem href="/Pharmacy-admin/settings" label="System Settings" icon={Settings} onClick={closeSidebar} />
    </nav>
  );

  const sidebarContent = (
    <>
      <div className="px-6 mb-8 flex items-center justify-between">
        <MedDeliveryLogo href="/Pharmacy-admin" theme="dark" size="sm" showTagline={true} />
        <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pharmacy-500/10 text-pharmacy-400 text-xs font-semibold border border-pharmacy-500/20">
          Pharmacy Admin
        </span>
      </div>

      {navLinks}

      <div className="p-4 border-t border-white/10 mt-2">
        <div className="px-4 mb-3">
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {userName ?? 'Pharmacy Admin'}
          </p>
          <p className="text-xs text-pharmacy-400 font-medium">pharmacy manager</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f7f9fc] text-slate-800 font-sans overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — always visible on lg+, slide-in drawer on mobile */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800">Pharmacy Admin</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Pharmacy management portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlobalSearch role="PHARMACY_ADMIN" />
            <NotificationBell />
            <div className="w-9 h-9 rounded-full bg-pharmacy-500/10 flex items-center justify-center border border-pharmacy-500/20 shrink-0">
              <span className="text-xs font-bold text-pharmacy-600">
                {userName ? userName.slice(0, 2).toUpperCase() : 'PA'}
              </span>
            </div>
            <div className="flex-col hidden sm:flex">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {userName?.split(' ')[0] ?? 'Admin'}
              </span>
              <span className="text-xs text-pharmacy-600 font-medium">pharmacy manager</span>
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
