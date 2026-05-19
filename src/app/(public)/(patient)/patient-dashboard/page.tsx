"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Pill,
  ShieldCheck,
  Truck,
  UserRound
} from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { getMyOrders } from "@/services/patientApi";
import { getMyProfile } from "@/services/patientApi";
import { getPendingSubstitutions } from "@/services/patientApi";
import type { OrderResponse, PatientProfileResponse, SubstitutionResponse } from "@/types/api";

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-sky-50 text-sky-700",
  PROCESSING: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-teal-50 text-teal-700",
  DISPENSED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

export default function PatientDashboard() {
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProfile().catch(() => null),
      getMyOrders(0, 10).catch(() => ({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 })),
      getPendingSubstitutions().catch(() => []),
    ]).then(([prof, ordersPage, subs]) => {
      setProfile(prof);
      setOrders(ordersPage.content);
      setSubstitutions(subs);
    }).finally(() => setLoading(false));
  }, []);

  const active = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completed = orders.filter((o) => o.status === "COMPLETED");
  const pending = orders.filter((o) => o.status === "PENDING");

  const stats = [
    { label: "Active Orders", value: active.length, hint: "In progress", icon: ClipboardList, tone: "bg-teal-50 text-teal-700" },
    { label: "Completed", value: completed.length, hint: "All time", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Pending", value: pending.length, hint: "Awaiting pharmacy", icon: CalendarCheck2, tone: "bg-amber-50 text-amber-700" },
    { label: "Substitutions", value: substitutions.length, hint: "Awaiting approval", icon: Pill, tone: "bg-violet-50 text-violet-700" },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PatientAppShell>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {loading ? (
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-slate-500">Loading your dashboard...</span>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {greeting()}, {profile?.fullName?.split(" ")[0] ?? "there"}
              </h1>
              <p className="mt-2 text-base text-slate-500">Here is your health delivery overview.</p>
            </>
          )}
        </div>
        <Link
          href="/order"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5"
        >
          Request medicine
        </Link>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "—" : stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-teal-600">{stat.hint}</p>
              </div>
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${stat.tone}`}>
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {[
          { icon: Pill, title: "Request Medicine", text: "Private purchase or prescription", href: "/order", tone: "bg-teal-50 text-teal-700" },
          { icon: ClipboardList, title: "Track Orders", text: "View all your active orders", href: "/tracking", tone: "bg-violet-50 text-violet-700" }
        ].map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-teal-200"
          >
            <span className={`grid h-14 w-14 place-items-center rounded-2xl ${action.tone}`}>
              <action.icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xl font-bold text-slate-950">{action.title}</span>
              <span className="mt-1 block text-sm text-slate-500">{action.text}</span>
            </span>
            <span className="text-3xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600">&#8594;</span>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.72fr]">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-950">Recent Orders</h2>
            <Link href="/tracking" className="text-sm font-bold text-teal-700 hover:text-teal-900">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 py-4">
                <Loader2 className="animate-spin" size={16} /> Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No orders yet. Request your first medicine.</p>
            ) : (
              orders.slice(0, 4).map((order) => (
                <div key={order.id} className="grid gap-3 rounded-3xl bg-slate-50 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-800">
                        {order.medicines && order.medicines.length > 0
                          ? order.medicines.map((m) => m.medicineName).join(", ")
                          : "Order"}
                      </p>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_TONE[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.pharmacyName ?? "Awaiting pharmacy"} &middot; {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <span className="text-sm font-bold tracking-wider text-slate-400">#{order.id}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6">
          <h2 className="text-2xl font-bold text-slate-950">Profile Summary</h2>
          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={16} /> Loading...</div>
            ) : profile ? (
              [
                { label: "Name", value: profile.fullName },
                { label: "Phone", value: profile.phoneNumber ?? "—" },
                { label: "Blood Type", value: profile.bloodType ?? "—" },
                { label: "Allergies", value: profile.allergies ?? "None listed" },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{row.label}</p>
                  <p className="mt-0.5 font-semibold text-slate-800 text-sm">{row.value}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Profile not available.</p>
            )}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Insurance", text: substitutions.length > 0 ? `${substitutions.length} substitution(s) awaiting your approval.` : "No pending substitutions." },
          { icon: Truck, title: "Delivery", text: "Default address is ready for matching." },
          { icon: UserRound, title: "Profile", text: profile?.allergies ? `Allergies noted: ${profile.allergies}` : "Complete your health profile for pharmacists." }
        ].map((card) => (
          <article key={card.title} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <card.icon className="h-6 w-6 text-teal-700" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-bold text-slate-950">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{card.text}</p>
          </article>
        ))}
      </section>
    </PatientAppShell>
  );
}
