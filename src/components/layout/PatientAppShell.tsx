"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Pill,
  Search,
  Settings,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/patient-dashboard" },
  { icon: Pill, label: "Request", href: "/order" },
  { icon: ClipboardList, label: "Tracking", href: "/tracking" },
  { icon: ShieldCheck, label: "Insurance", href: "/patient-dashboard#insurance" },
  { icon: Settings, label: "Settings", href: "/patient-dashboard#settings" }
];

type TrailItem = {
  key: string;
  label: string;
  href: string;
};

const patientTrailStorageKey = "meddelivery.patient.navigationTrail";

function getPathFromHref(href: string) {
  return href.split("#")[0];
}

function toTrailItem(item: (typeof navItems)[number]): TrailItem {
  return {
    key: item.href,
    label: item.label,
    href: item.href
  };
}

function getTrailFromStorage() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(sessionStorage.getItem(patientTrailStorageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is TrailItem =>
      typeof item?.key === "string" &&
      typeof item?.label === "string" &&
      typeof item?.href === "string" &&
      navItems.some((navItem) => navItem.href === item.href)
    );
  } catch {
    return [];
  }
}

function saveTrailToStorage(items: TrailItem[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(patientTrailStorageKey, JSON.stringify(items));
}

function findCurrentNavItem(pathname: string | null, hash: string) {
  if (!pathname) return navItems[0];

  const exactHashItem = hash
    ? navItems.find((item) => item.href === `${pathname}${hash}`)
    : undefined;

  return (
    exactHashItem ??
    navItems.find((item) => item.href === pathname) ??
    navItems.find((item) => {
      const itemPath = getPathFromHref(item.href);
      return itemPath !== "/patient-dashboard" && pathname.startsWith(itemPath);
    }) ??
    navItems[0]
  );
}

/**
 * PatientAppShell provides the global layout wrapper for all patient-facing pages.
 * It includes the top navigation bar, search functionality, user profile menu,
 * and the main sidebar navigation with active state tracking.
 * 
 * @param children - The page content to be rendered within the shell.
 * @returns The layout component wrapping the patient application.
 */
export default function PatientAppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeHash, setActiveHash] = useState("");
  const [pageTrail, setPageTrail] = useState<TrailItem[]>([]);

  const currentNavItem = useMemo(
    () => findCurrentNavItem(pathname, activeHash),
    [activeHash, pathname]
  );

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  useEffect(() => {
    const currentItem = toTrailItem(currentNavItem);
    const frameId = window.requestAnimationFrame(() => {
      setPageTrail((currentTrail) => {
        const existingTrail = currentTrail.length > 0 ? currentTrail : getTrailFromStorage();
        const currentIndex = existingTrail.findIndex((item) => item.key === currentItem.key);
        const nextTrail = currentIndex >= 0
          ? existingTrail.slice(0, currentIndex + 1)
          : [...existingTrail, currentItem];

        saveTrailToStorage(nextTrail);
        return nextTrail;
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentNavItem]);

  const handleTrailClick = (item: TrailItem, index: number) => {
    const nextTrail = pageTrail.slice(0, index + 1);
    saveTrailToStorage(nextTrail);
    setPageTrail(nextTrail);
    router.push(item.href);
  };

  const handleTrailBack = () => {
    if (pageTrail.length > 1) {
      const nextTrail = pageTrail.slice(0, -1);
      const previousItem = nextTrail[nextTrail.length - 1];

      saveTrailToStorage(nextTrail);
      setPageTrail(nextTrail);
      router.push(previousItem.href);
      return;
    }

    router.back();
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,160,0.11),transparent_28%),linear-gradient(135deg,#f6fbfc_0%,#f8fafc_48%,#eef7f8_100%)] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-4 px-5 sm:px-8">
          <MedDeliveryLogo href="/" theme="light" size="sm" label="Patient portal" />

          <label className="mx-auto hidden w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-sm lg:flex">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              placeholder="Search medicines, orders, pharmacies"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-hidden placeholder:text-slate-400"
              suppressHydrationWarning
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

      <div className="grid lg:grid-cols-[14rem_1fr]">
        <aside className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-[1.6rem] border border-slate-200 bg-white/95 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:sticky lg:top-16 lg:left-0 lg:bottom-auto lg:h-[calc(100vh-4rem)] lg:w-full lg:translate-x-0 lg:flex-col lg:justify-start lg:rounded-none lg:border-0 lg:bg-transparent lg:p-6 lg:shadow-none">
          <nav className="flex items-center gap-2 lg:w-full lg:flex-col lg:gap-3">
            {navItems.map((item) => {
              const active = currentNavItem.href === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition lg:w-full lg:justify-start lg:gap-3 lg:px-4 ${
                    active
                      ? "bg-linear-to-br from-teal-500 to-blue-600 text-white shadow-[0_14px_28px_rgba(14,165,160,0.28)]"
                      : "text-slate-500 hover:bg-white hover:text-teal-700 hover:shadow-sm"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="hidden font-bold lg:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <span className="hidden h-px w-full bg-slate-200 lg:block lg:my-2" />
          <button
            title="Logout"
            aria-label="Logout"
            type="button"
            onClick={handleLogout}
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-white hover:text-rose-600 hover:shadow-sm lg:w-full lg:justify-start lg:gap-3 lg:px-4"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="hidden font-bold lg:block">Logout</span>
          </button>
        </aside>

        <main className="mx-auto w-full max-w-[92rem] px-5 pb-28 pt-7 sm:px-8 lg:pb-10">
          <div className="mb-6 flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-white/60 p-2 pr-4 shadow-sm backdrop-blur-md">
            <button 
              onClick={handleTrailBack}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:text-teal-700 hover:shadow-md"
              title="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {pageTrail.map((item, index) => {
                const isCurrent = index === pageTrail.length - 1;

                return (
                  <span key={item.key} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTrailClick(item, index)}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`min-h-9 rounded-2xl px-4 text-sm font-bold transition ${
                        isCurrent
                          ? "bg-teal-50 text-teal-700 shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-50 hover:text-teal-700"
                      }`}
                    >
                      {item.label}
                    </button>
                    {index < pageTrail.length - 1 ? (
                      <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden="true" />
                    ) : null}
                  </span>
                );
              })}
            </div>
          </div>
          <label className="mb-5 flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-sm lg:hidden">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              placeholder="Search medicines, orders, pharmacies"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-hidden placeholder:text-slate-400"
              suppressHydrationWarning
            />
          </label>
          {children}
        </main>
      </div>
    </div>
  );
}
