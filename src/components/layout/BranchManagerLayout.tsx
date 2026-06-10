"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package2,
  BarChart2,
  UserRound,
  LogOut,
  Menu,
  X,
  GitBranch,
  ClipboardList,
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

export default function BranchManagerLayout({ children }: { children: React.ReactNode }) {
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
        <MedDeliveryLogo href="/branch-manager" theme="dark" size="sm" showTagline={true} />
        <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-600/10 text-teal-400 text-xs font-semibold border border-teal-600/20">
          <GitBranch size={12} />
          Branch Manager
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <NavItem href="/branch-manager" icon={LayoutDashboard} label="Dashboard" exact onClick={closeSidebar} />
        <NavItem href="/branch-manager/pharmacists" icon={Users} label="Pharmacists" onClick={closeSidebar} />
        <NavItem href="/branch-manager/inventory" icon={Package2} label="Inventory" onClick={closeSidebar} />
        <NavItem href="/branch-manager/orders" icon={ClipboardList} label="Orders" onClick={closeSidebar} />
        <NavItem href="/branch-manager/reports" icon={BarChart2} label="Reports" onClick={closeSidebar} />
        <NavItem href="/branch-manager/profile" icon={UserRound} label="My Profile" onClick={closeSidebar} />
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="px-4 mb-3">
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {userName ?? 'Branch Manager'}
          </p>
          <p className="text-xs text-teal-400 font-medium">branch manager</p>
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
              <h1 className="text-base font-bold text-slate-800">Branch Manager Portal</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Branch operations &amp; team management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlobalSearch role="BRANCH_MANAGER" />
            <NotificationBell />
            <div className="w-9 h-9 rounded-full bg-teal-600/10 flex items-center justify-center border border-teal-600/20 shrink-0">
              <span className="text-xs font-bold text-teal-700">
                {userName ? userName.slice(0, 2).toUpperCase() : 'BM'}
              </span>
            </div>
            <div className="flex-col hidden sm:flex">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {userName?.split(' ')[0] ?? 'Manager'}
              </span>
              <span className="text-xs text-teal-700 font-medium">branch manager</span>
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
