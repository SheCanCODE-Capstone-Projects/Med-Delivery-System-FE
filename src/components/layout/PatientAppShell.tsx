"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Pill,
  Search,
  Settings,
  ShieldCheck
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/patient-dashboard" },
  { icon: Pill, label: "Request", href: "/order" },
  { icon: ClipboardList, label: "Tracking", href: "/tracking" },
  { icon: ShieldCheck, label: "Insurance", href: "/patient-dashboard#insurance" },
  { icon: Settings, label: "Settings", href: "/patient-dashboard#settings" }
];

export default function PatientAppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,160,0.11),transparent_28%),linear-gradient(135deg,#f6fbfc_0%,#f8fafc_48%,#eef7f8_100%)] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-4 px-5 sm:px-8">
          <Link href="/patient-dashboard" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-linear-to-br from-teal-500 to-blue-600 text-white shadow-[0_12px_24px_rgba(14,165,160,0.22)]">
              <Pill className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-bold leading-none text-slate-900">MedDelivery</span>
              <span className="mt-1 block text-[11px] font-bold tracking-[0.32em] text-slate-400">PATIENT</span>
            </span>
          </Link>

          <label className="mx-auto hidden w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-sm lg:flex">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              placeholder="Search medicines, orders, pharmacies"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-hidden placeholder:text-slate-400"
            />
            <span className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-400">Ctrl K</span>
          </label>

          <div className="flex items-center justify-end gap-3">
            <button className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm" aria-label="Notifications">
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
            </button>
            <button className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 pr-4 text-sm font-bold text-slate-700 shadow-sm">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-teal-500 to-blue-600 text-xs text-white">SJ</span>
              Sarah
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[7rem_1fr]">
        <aside className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-[1.6rem] border border-slate-200 bg-white/95 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:sticky lg:top-16 lg:left-0 lg:bottom-auto lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:flex-col lg:justify-center lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none">
          <nav className="flex items-center gap-2 lg:flex-col">
            {navItems.map((item) => {
              const active = item.href === pathname || (item.href === "/tracking" && pathname?.startsWith("/tracking"));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={`grid h-12 w-12 place-items-center rounded-2xl transition ${
                    active
                      ? "bg-linear-to-br from-teal-500 to-blue-600 text-white shadow-[0_14px_28px_rgba(14,165,160,0.28)]"
                      : "text-slate-500 hover:bg-white hover:text-teal-700 hover:shadow-sm"
                  }`}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
          <span className="hidden h-px w-9 bg-slate-200 lg:block" />
          <button title="Logout" aria-label="Logout" className="grid h-12 w-12 place-items-center rounded-2xl text-slate-500 transition hover:bg-white hover:text-rose-600 hover:shadow-sm">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </aside>

        <main className="mx-auto w-full max-w-[92rem] px-5 pb-28 pt-7 sm:px-8 lg:pb-10">
          <label className="mb-5 flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-sm lg:hidden">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              placeholder="Search medicines, orders, pharmacies"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-hidden placeholder:text-slate-400"
            />
          </label>
          {children}
        </main>
      </div>
    </div>
  );
}
