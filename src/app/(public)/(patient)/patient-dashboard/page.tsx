import Link from "next/link";
import PatientAppShell from "@/components/layout/PatientAppShell";
import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Pill,
  ShieldCheck,
  Truck,
  UserRound
} from "lucide-react";

const stats = [
  { label: "Active Orders", value: "2", hint: "+1 today", icon: ClipboardList, tone: "bg-teal-50 text-teal-700" },
  { label: "Completed", value: "24", hint: "This month", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Pending", value: "1", hint: "Awaiting pharmacy", icon: CalendarCheck2, tone: "bg-amber-50 text-amber-700" },
  { label: "Medicines", value: "8", hint: "Regular prescriptions", icon: Pill, tone: "bg-violet-50 text-violet-700" }
];

const recentOrders = [
  { medicine: "Amoxicillin 500mg", pharmacy: "HealthPlus Pharmacy", date: "Apr 14, 2026", status: "COMPLETED", id: "ORD-2847", tone: "bg-teal-50 text-teal-700" },
  { medicine: "Lisinopril 10mg", pharmacy: "CareFirst Drugs", date: "Apr 13, 2026", status: "IN PROGRESS", id: "ORD-2846", tone: "bg-sky-50 text-sky-700" },
  { medicine: "Prescription Order", pharmacy: "MedCare Central", date: "Apr 13, 2026", status: "MATCHING", id: "ORD-2845", tone: "bg-amber-50 text-amber-700" }
];

const pharmacies = [
  { name: "HealthPlus Pharmacy", distance: "0.8 km" },
  { name: "CareFirst Drugs", distance: "1.2 km" },
  { name: "QuickMed Pharmacy", distance: "2.1 km" }
];

export default function PatientDashboard() {
  return (
    <PatientAppShell>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Good morning, Sarah</h1>
          <p className="mt-2 text-base text-slate-500">Here is your health delivery overview.</p>
        </div>
        <Link href="/order" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(14,165,160,0.22)] transition hover:-translate-y-0.5">
          Request medicine
        </Link>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
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
            <span className="text-3xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600">-&gt;</span>
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
            {recentOrders.map((order) => (
              <div key={order.id} className="grid gap-3 rounded-3xl bg-slate-50 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-800">{order.medicine}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.tone}`}>{order.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{order.pharmacy} - {order.date}</p>
                </div>
                <span className="text-sm font-bold tracking-wider text-slate-400">{order.id}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-6">
          <h2 className="text-2xl font-bold text-slate-950">Nearby Pharmacies</h2>
          <div className="mt-5 grid gap-3">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy.name} className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-3xl bg-slate-50 p-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold text-slate-800">{pharmacy.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{pharmacy.distance}</p>
                  <span className="mt-2 inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-bold tracking-wide text-teal-700">INSURANCE ACCEPTED</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Insurance", text: "BlueCross card is pending verification." },
          { icon: Truck, title: "Delivery", text: "Default address is ready for matching." },
          { icon: UserRound, title: "Profile", text: "Allergies and notes are available to pharmacists." }
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
