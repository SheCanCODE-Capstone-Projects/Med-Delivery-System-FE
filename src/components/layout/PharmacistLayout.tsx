"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Pill, PackageSearch, Truck, History, LogOut } from 'lucide-react';
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
      className={`flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium transition-colors mx-4 mb-1 ${
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

export default function PharmacistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const userName = typeof window !== 'undefined' ? getUserName() : null;

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-[#f3f6f9] text-slate-800 font-sans overflow-hidden">
      <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex flex-col pt-6 fixed h-full z-10">
        <div className="px-6 mb-8">
          <MedDeliveryLogo href="/pharmacist" theme="dark" size="sm" showTagline={false} />
          <span className="text-sm text-slate-400 mt-2 block">Pharmacist portal</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem href="/pharmacist" icon={LayoutDashboard} label="Dashboard" exact />
          <NavItem href="/pharmacist/orders" icon={FileText} label="Orders" />
          <NavItem href="/pharmacist/prescriptions" icon={Pill} label="Prescriptions" />
          <NavItem href="/pharmacist/inventory" icon={PackageSearch} label="Inventory" />
          <NavItem href="/pharmacist/delivery" icon={Truck} label="Delivery" />
          <NavItem href="/pharmacist/history" icon={History} label="History" />
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="px-2 mb-3">
            <p className="text-sm font-semibold text-white leading-tight">{userName ?? 'Pharmacist'}</p>
            <p className="text-xs text-teal-400 font-medium">Pharmacist</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 flex flex-col h-full overflow-y-auto bg-[#f8fafb]">
        <div className="max-w-[1200px] mx-auto p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
