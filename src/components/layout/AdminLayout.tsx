"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, Users, Store, LogOut, Search, Bell, PlusSquare } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const NavItem = ({ href, exact = false, children }: any) => {
    const isActive = exact ? pathname === href : pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-slate-50 text-teal-700'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[#f7f9fc] text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col pt-6 fixed h-full z-10">
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-teal-800 text-white flex items-center justify-center font-bold">
            <PlusSquare size={18} />
          </div>
          <span className="text-xl font-bold text-teal-800">MedDelivery</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem href="/admin" exact>
            <LayoutDashboard size={18} />
            Dashboard
          </NavItem>
          <NavItem href="/admin/orders">
            <ClipboardList size={18} />
            Order Management
          </NavItem>
          <NavItem href="/admin/patients">
            <Users size={18} />
            Patients
          </NavItem>
          <NavItem href="/admin/pharmacy">
            <Store size={18} />
            Pharmacy
          </NavItem>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, Cynthy admin</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search orders, patients..."
                className="w-80 pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 border border-transparent"
              />
            </div>
            <button className="relative p-2 text-slate-500 border border-slate-200 rounded hover:bg-slate-50 transition">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border border-slate-200">
                 <img src={`https://api.dicebear.com/7.x/initials/svg?seed=Cynthy&backgroundColor=f97316`} alt="profile" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">cynthy</span>
                <span className="text-xs text-slate-500">admin</span>
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
