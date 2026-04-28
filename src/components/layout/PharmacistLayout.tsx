"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Pill, PackageSearch, Truck, History, PlusSquare } from 'lucide-react';

export default function PharmacistLayout({ children }) {
  const pathname = usePathname();

  const NavItem = ({ href, exact = false, children }: any) => {
    const isActive = exact ? pathname === href : pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors relative ${
          isActive
            ? 'bg-[#125550] text-white'
            : 'text-teal-100 hover:bg-[#125550] hover:text-white'
        }`}
      >
        {typeof children === 'function' ? children({ isActive }) : children}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[#f3f6f9] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar - Dark Teal */}
      <aside className="w-64 bg-[#0a4843] text-teal-50 flex flex-col pt-6 fixed h-full z-10 font-sans">
        <div className="px-6 mb-8 flex flex-col gap-1">
          <div className="text-xl font-bold text-white flex items-center gap-2">
            MedDelivery
          </div>
          <span className="text-sm text-teal-200">Pharmacist portal</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem href="/pharmacist" exact>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                <div className={isActive ? "text-white" : "text-teal-200"}>
                  <LayoutDashboard size={18} fill={isActive ? "currentColor" : "none"} />
                </div>
                Dashboard
              </>
            )}
          </NavItem>

          <NavItem href="/pharmacist/orders">
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                <div className="text-teal-200">
                  <FileText size={18} />
                </div>
                Orders
              </>
            )}
          </NavItem>

          <NavItem href="/pharmacist/prescriptions">
             {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                <div className="text-teal-200"><Pill size={18} /></div>Prescriptions
              </>
            )}
          </NavItem>

          <NavItem href="/pharmacist/inventory">
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                <div className="text-teal-200"><PackageSearch size={18} /></div>Inventory
              </>
            )}
          </NavItem>

          <NavItem href="/pharmacist/delivery">
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                <div className="text-teal-200"><Truck size={18} /></div>Delivery
              </>
            )}
          </NavItem>

          <NavItem href="/pharmacist/history">
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                <div className="text-teal-200"><History size={18} /></div>History
              </>
            )}
          </NavItem>
        </nav>

        <div className="p-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-teal-200 text-[#0a4843] flex items-center justify-center font-bold">
               AK
             </div>
             <div className="flex flex-col">
               <span className="text-sm font-bold text-white">Alex Karim</span>
               <span className="text-xs text-teal-200">Senior Pharmacist</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col h-full bg-white relative">
        {/* Top Navbar */}
        <header className="h-20 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between px-8 absolute top-0 w-full z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#0a4843] text-white flex items-center justify-center font-bold">
              <PlusSquare size={18} />
            </div>
            <span className="text-xl font-bold text-[#0a4843]">MedDelivery</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-sm font-semibold text-slate-700 hover:text-[#0a4843] transition">
              Log in
            </button>
            <button className="px-5 py-2.5 bg-[#0a4843] text-white text-sm font-semibold rounded-lg hover:bg-[#073330] transition shadow-sm">
              Sign up
            </button>
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
