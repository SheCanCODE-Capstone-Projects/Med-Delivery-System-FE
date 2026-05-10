"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Search,
  Bell,
  PlusSquare,
  BarChart3,
} from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear potentially used auth tokens/session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login page
    router.push('/login');
  };

  const NavItem = ({ href, exact = false, icon: Icon, label }: { href: string; exact?: boolean; icon: React.ElementType; label: string }) => {
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

  return (
    <div className="flex h-screen bg-[#f7f9fc] text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex flex-col pt-6 fixed h-full z-10 shadow-xl">
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-teal-500 text-white flex items-center justify-center font-bold">
            <PlusSquare size={18} />
          </div>
          <span className="text-xl font-bold text-white">MedDelivery</span>
        </div>

        {/* Role badge */}
        <div className="px-6 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20">
            <ShieldCheck size={12} />
            Super Admin
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem href="/super-admin" exact icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/super-admin/pharmacies" icon={Building2} label="Pharmacies" />
          <NavItem href="/super-admin/admins" icon={ShieldCheck} label="Admins" />
          <NavItem href="/super-admin/patients" icon={Users} label="Patients" />
          <NavItem href="/super-admin/analytics" icon={BarChart3} label="Analytics" />
          <NavItem href="/super-admin/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-700/50">
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
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-0 sticky top-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Super Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Platform-wide overview — all regions & pharmacies</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search pharmacies, admins..."
                className="w-72 pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 border border-transparent"
              />
            </div>
            <button className="relative p-2 text-slate-500 border border-slate-200 rounded hover:bg-slate-50 transition">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center overflow-hidden border border-teal-500/20">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=SuperAdmin&backgroundColor=14b8a6`} alt="profile" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">Cynthy</span>
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
