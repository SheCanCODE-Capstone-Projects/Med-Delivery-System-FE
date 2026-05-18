"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Handshake, 
  ClipboardCheck, 
  Settings, 
  LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils";
import MedDeliveryLogo from '../brand/MedDeliveryLogo';

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
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300",
        isActive
          ? "bg-[#0ABFBC] text-white shadow-[0_8px_20px_rgba(10,191,188,0.25)]"
          : "text-[#7AABB0] hover:text-white hover:bg-[rgba(10,191,188,0.08)]"
      )}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span>{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
    </Link>
  );
};

export default function PharmacyAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F6FAFA] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#040F1A] flex flex-col h-full shrink-0 shadow-2xl relative z-20">
        <div className="p-8 pb-6">
          <MedDeliveryLogo href="/Pharmacy-admin" theme="dark" size="sm" showTagline={false} />
        </div>

        <div className="px-8 mb-4 text-[10px] font-bold text-[#0ABFBC] uppercase tracking-[0.25em] opacity-80">
          Admin Portal
        </div>


        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <NavItem 
            href="/Pharmacy-admin" 
            label="Dashboard" 
            icon={LayoutDashboard} 
            exact 
          />
          <NavItem 
            href="/Pharmacy-admin/employees" 
            label="Manage Personnel" 
            icon={Users} 
          />
          <NavItem 
            href="/Pharmacy-admin/partners" 
            label="Pharmacy Partners" 
            icon={Handshake} 
          />
          <NavItem 
            href="/Pharmacy-admin/orders" 
            label="Order Oversight" 
            icon={ClipboardCheck} 
          />
          <NavItem 
            href="/Pharmacy-admin/settings" 
            label="System Settings" 
            icon={Settings} 
          />
        </nav>

        <div className="p-6 border-t border-[rgba(10,191,188,0.10)]">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-[#7AABB0] hover:text-[#FF5F6D] hover:bg-red-500/5 transition-all duration-200 group">
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Placeholder - can be customized per page if needed */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 leading-none">System Admin</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Platform Level Access</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-teal-500/20 p-0.5">
               <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b6e3f4" 
                    alt="profile" 
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#f0f4f4] custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
