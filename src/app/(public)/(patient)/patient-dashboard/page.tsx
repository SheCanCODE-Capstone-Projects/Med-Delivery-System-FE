"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Heart,
  Loader2,
  MapPin,
  Pill,
  RefreshCw,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { getMyOrders, getMyProfile, getPendingSubstitutions } from "@/services/patientApi";
import type { OrderResponse, PatientProfileResponse, SubstitutionResponse } from "@/types/api";

const STATUS_TONE: Record<string, string> = {
  UPLOADED: "bg-amber-50 text-amber-700",
  MATCHING: "bg-sky-50 text-sky-700",
  ASSIGNED: "bg-violet-50 text-violet-700",
  IN_PROGRESS: "bg-violet-50 text-violet-700",
  STOCK_CONFIRMED: "bg-emerald-50 text-emerald-700",
  READY_FOR_PICKUP: "bg-teal-50 text-teal-700",
  OUT_FOR_DELIVERY: "bg-teal-50 text-teal-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-rose-50 text-rose-700",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function profileComplete(p: PatientProfileResponse | null) {
  if (!p) return 0;
  let filled = 0;
  const checks = [p.fullName, p.phoneNumber, p.dateOfBirth, p.gender, p.bloodType, p.allergies];
  checks.forEach((v) => { if (v) filled++; });
  return Math.round((filled / checks.length) * 100);
}

export default function PatientDashboard() {
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      getMyProfile().catch(() => null),
      getMyOrders(0, 10).catch(() => ({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 })),
      getPendingSubstitutions().catch(() => []),
    ]).then(([prof, ordersPage, subs]) => {
      setProfile(prof);
      setOrders(ordersPage.content);
      setSubstitutions(subs);
    }).catch(() => setError("Could not load dashboard data."))
    .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const active = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completed = orders.filter((o) => o.status === "COMPLETED");
  const completeness = profileComplete(profile);

  return (
    <PatientAppShell>
      {error && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={load} className="flex items-center gap-1 font-semibold hover:text-rose-900 transition">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-6 sm:px-8 text-white shadow-xl shadow-teal-500/20 mb-6">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            {loading ? (
              <div className="flex items-center gap-2 text-teal-100">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Loading…</span>
              </div>
            ) : (
              <>
                <p className="text-teal-100 text-sm font-medium">{greeting()},</p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
                  {profile?.fullName?.split(" ")[0] ?? "there"} 👋
                </h1>
                <p className="mt-1 text-teal-100 text-sm">
                  {active.length > 0
                    ? `You have ${active.length} active order${active.length > 1 ? "s" : ""} in progress.`
                    : "Your health, delivered to your door."}
                </p>
              </>
            )}
          </div>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-2xl text-sm font-bold shadow hover:shadow-md transition hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Pill size={16} />
            Order Medicine
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-4 bottom-0 h-24 w-24 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Active Orders", value: active.length, icon: Activity, color: "bg-teal-500/10 text-teal-600" },
          { label: "Completed", value: completed.length, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
          { label: "Pending", value: orders.filter(o => o.status === "PENDING").length, icon: CalendarCheck2, color: "bg-amber-500/10 text-amber-600" },
          { label: "Substitutions", value: substitutions.length, icon: RefreshCw, color: "bg-violet-500/10 text-violet-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{loading ? "—" : stat.value}</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Orders — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-teal-600" />
              Recent Orders
            </h2>
            <Link href="/tracking" className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 py-8 px-5">
                <Loader2 className="animate-spin" size={16} /> Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center">
                <ClipboardList size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No orders yet.</p>
                <Link href="/order" className="mt-2 inline-block text-sm font-bold text-teal-600 hover:text-teal-800">
                  Request your first medicine
                </Link>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Pill size={16} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {order.items?.length
                        ? order.items.map((m) => m.medicineName).join(", ")
                        : `Order #${order.id}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order.pharmacyName ?? "Awaiting pharmacy"}
                      {order.branchName && order.branchName !== order.pharmacyName && (
                        <span className="ml-1">— {order.branchName}</span>
                      )}
                      {" · "}{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${STATUS_TONE[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {({ UPLOADED:"Received", MATCHING:"Matching", ASSIGNED:"Assigned", IN_PROGRESS:"In Progress", STOCK_CONFIRMED:"Confirmed", READY_FOR_PICKUP:"Ready", OUT_FOR_DELIVERY:"Out for Delivery", COMPLETED:"Completed", CANCELLED:"Cancelled" } as Record<string,string>)[order.status] ?? order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Health profile completeness */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Heart size={16} className="text-rose-500" />
                Health Profile
              </h3>
              <Link href="/profile" className="text-xs font-bold text-teal-600 hover:text-teal-800">
                Edit
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs"><Loader2 className="animate-spin" size={12} /> Loading…</div>
            ) : (
              <>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-slate-500">Profile completeness</p>
                    <p className="text-xs font-bold text-teal-600">{completeness}%</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
                {completeness < 100 && (
                  <p className="text-xs text-slate-500">
                    Complete your profile to help pharmacists serve you better.
                  </p>
                )}
                <div className="mt-3 space-y-1.5">
                  {[
                    { label: "Name", value: profile?.fullName },
                    { label: "Phone", value: profile?.phoneNumber },
                    { label: "Blood Type", value: profile?.bloodType },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{row.label}</span>
                      <span className="text-xs font-semibold text-slate-700">{row.value ?? <span className="text-rose-400">Not set</span>}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Access</h3>
            <div className="space-y-1">
              {[
                { icon: FileText, label: "Upload Prescription", href: "/prescriptions", color: "text-violet-600 bg-violet-50" },
                { icon: ShieldCheck, label: "Insurance Cards", href: "/insurance", color: "text-teal-600 bg-teal-50" },
                { icon: MapPin, label: "Delivery Locations", href: "/locations", color: "text-amber-600 bg-amber-50" },
                { icon: Truck, label: "Track Delivery", href: "/tracking", color: "text-sky-600 bg-sky-50" },
                { icon: UserRound, label: "My Profile", href: "/profile", color: "text-rose-500 bg-rose-50" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition group"
                >
                  <span className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${link.color}`}>
                    <link.icon size={14} />
                  </span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{link.label}</span>
                  <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Substitution alert */}
      {substitutions.length > 0 && (
        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              {substitutions.length} substitution{substitutions.length > 1 ? "s" : ""} awaiting your approval
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              A pharmacist proposed alternative medicines for your order.
            </p>
          </div>
          <Link href="/tracking" className="text-sm font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap flex items-center gap-1">
            Review <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </PatientAppShell>
  );
}
