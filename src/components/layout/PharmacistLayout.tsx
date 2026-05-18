"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Pill, PackageSearch, Truck, History, Search, Bell, LogOut } from 'lucide-react';
import MedDeliveryLogo from '../brand/MedDeliveryLogo';

export default function PharmacistLayout({ children }) {
  const pathname = usePathname();

  const NavItem = ({ href, exact = false, children }: any) => {
    const isActive = exact ? pathname === href : pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium transition-colors relative mx-4 mb-1 ${
          isActive
            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {typeof children === 'function' ? children({ isActive }) : children}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[#f3f6f9] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar - Dark Navy */}
      <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex flex-col pt-6 fixed h-full z-10 font-sans">
        <div className="px-6 mb-8 flex flex-col gap-1">
          <MedDeliveryLogo href="/pharmacist" theme="dark" size="sm" showTagline={false} />
          <span className="text-sm text-slate-400 mt-2">Pharmacist portal</span>
        </div>

        <nav className="flex-1 space-y-1">
          
          <NavItem href="/pharmacist" exact>
            <LayoutDashboard size={18} /> Dashboard
          </NavItem>
          <NavItem href="/pharmacist/orders">
            <FileText size={18} /> Orders
          </NavItem>
          <NavItem href="/pharmacist/prescriptions">
            <Pill size={18} /> Prescriptions
          </NavItem>
          <NavItem href="/pharmacist/inventory">
            <PackageSearch size={18} /> Inventory
          </NavItem>
          <NavItem href="/pharmacist/delivery">
            <Truck size={18} /> Delivery
          </NavItem>
          <NavItem href="/pharmacist/history">
            <History size={18} /> History
          </NavItem>
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col h-full bg-white relative">
        {/* Top Navbar */}
        <header className="h-20 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between px-8 absolute top-0 w-full z-20">
          <div className="flex items-center gap-2">
            <MedDeliveryLogo href="/pharmacist" theme="light" size="sm" showTagline={false} />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search prescriptions, orders..."
                className="w-72 pl-10 pr-4 py-2 bg-[#f0f4f4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4843] border border-transparent"
              />
            </div>
            <button className="relative p-2 text-slate-500 border border-slate-200 rounded hover:bg-slate-50 transition">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">8</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0a4843]/10 flex items-center justify-center overflow-hidden border border-[#0a4843]/20">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=Pharmacist&backgroundColor=0a4843`} alt="profile" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">Alex Karim</span>
                <span className="text-xs text-[#0a4843] font-medium">Pharmacist</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content area */}
        <div className="mt-20 flex-1 overflow-auto bg-[#f8fafb] relative h-[calc(100vh-80px)]">
           <div className="max-w-[1200px] mx-auto p-8">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
}
