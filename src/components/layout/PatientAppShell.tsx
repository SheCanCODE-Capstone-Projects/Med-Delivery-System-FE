"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { logout, getUserName } from "@/services/authApi";
import {
  Bell,
  ClipboardList,
  ClipboardPlus,
  FileText,
  LayoutGrid,
  LogOut,
  MapPin,
  Pill,
  Settings,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/patient-dashboard" },
  { icon: Pill, label: "Request Medicine", href: "/order" },
  { icon: ClipboardList, label: "Track Orders", href: "/tracking" },
  { icon: FileText, label: "Prescriptions", href: "/prescriptions" },
  { icon: ClipboardPlus, label: "Medicine Requests", href: "/medicine-requests" },
  { icon: MapPin, label: "Locations", href: "/locations" },
  { icon: ShieldCheck, label: "Insurance", href: "/insurance" },
  { icon: MessageSquare, label: "Chatbot", href: "/chatbot" },
  { icon: Settings, label: "Settings", href: "/profile" },
];

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/patient-dashboard" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

export default function PatientAppShell({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  useEffect(() => { setUserName(getUserName()); }, []);

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen bg-[#f7f9fc] text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex flex-col pt-6 fixed h-full z-10 shadow-xl">
        <div className="px-6 mb-8">
          <MedDeliveryLogo href="/patient-dashboard" theme="dark" size="sm" showTagline={false} />
        </div>

        <div className="px-6 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20">
            <ShieldCheck size={12} />
            Patient
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="px-4 mb-3">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {userName ?? "Patient"}
            </p>
            <p className="text-xs text-teal-400 font-medium">patient</p>
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

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-base font-bold text-slate-800">Patient Portal</h1>
            <p className="text-xs text-slate-500">Manage your medicines and deliveries</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <span className="text-xs font-bold text-teal-600">
                  {userName ? userName.slice(0, 2).toUpperCase() : "PA"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {userName?.split(" ")[0] ?? "Patient"}
                </span>
                <span className="text-xs text-teal-600 font-medium">patient</span>
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
