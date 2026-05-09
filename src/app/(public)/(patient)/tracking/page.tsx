import { AlertCircle, CheckCircle2, Clock3, CreditCard, MessageSquare, PackageCheck, Pill, Truck } from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";

const timeline = [
  { label: "Uploaded", detail: "Prescription and order request received.", complete: true },
  { label: "Matching", detail: "Checking nearby pharmacies for availability.", complete: true },
  { label: "Assigned", detail: "Central Pharmacy accepted the order.", complete: true },
  { label: "In progress", detail: "Pharmacist is validating stock and prescription.", complete: false },
  { label: "Ready", detail: "Pickup or delivery handoff will appear here.", complete: false }
];

/**
 * TrackingPage provides a detailed view of a patient's active order status.
 * It displays a visual timeline of the order's progress, fulfillment details,
 * payment split, and a substitution approval/rejection interface.
 * 
 * @returns The order tracking page component.
 */
export default function TrackingPage() {
  return (
    <PatientAppShell>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">Order tracking</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Track your order</h1>
          <p className="mt-2 text-base text-slate-500">Follow pharmacy assignment, payment split, and substitution decisions.</p>
        </div>
        <span className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-teal-50 px-4 text-sm font-bold text-teal-700">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          In progress
        </span>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">Current order</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">#MD-2048</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Prescription request assigned to Central Pharmacy.</p>
            </div>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-teal-50 px-4 text-sm font-bold text-teal-700">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              In progress
            </span>
          </div>

          <div className="mt-7 grid gap-4">
            {timeline.map((step, index) => (
              <div key={step.label} className="grid grid-cols-[auto_1fr] gap-4">
                <div className="grid justify-items-center gap-2">
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${step.complete ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {step.complete ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <Clock3 className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  {index < timeline.length - 1 ? <span className="h-10 w-px bg-slate-200" aria-hidden="true" /> : null}
                </div>
                <article className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                  <h2 className="font-bold text-slate-900">{step.label}</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{step.detail}</p>
                </article>
              </div>
            ))}
          </div>
        </section>

        <aside className="grid gap-5">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#11192f_0%,#0b1326_100%)] p-6 text-white shadow-[0_24px_60px_rgba(11,19,39,0.22)]">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-400/15 text-teal-300">
                <Truck className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-white/60">Fulfillment</p>
                <h2 className="text-xl font-bold">Delivery</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/70">123 Main St, City, State 12345</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold text-white/50">Patient pays</p>
                <p className="mt-1 text-2xl font-bold text-teal-300">$10.00</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold text-white/50">Insurance pays</p>
                <p className="mt-1 text-2xl font-bold text-teal-300">$40.00</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(11,19,39,0.1)]">
            <h2 className="text-xl font-bold text-slate-900">Order summary</h2>
            <div className="mt-4 grid gap-3">
              {[
                { icon: Pill, label: "Paracetamol 500mg", value: "2 units" },
                { icon: PackageCheck, label: "Item status", value: "Available" },
                { icon: CreditCard, label: "Payment", value: "Insurance pending" }
              ].map((item) => (
                <div key={item.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <item.icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  <span className="text-sm text-slate-500">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" aria-hidden="true" />
              <div>
                <h2 className="font-bold text-amber-900">Substitution approval</h2>
                <p className="mt-1 text-sm leading-5 text-amber-800">If the pharmacy suggests an alternative, approve or reject it before the order continues.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button className="min-h-11 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white">Approve</button>
              <button className="min-h-11 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-bold text-amber-800">Reject</button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(11,19,39,0.1)]">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h2 className="font-bold text-slate-900">Care chat</h2>
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-500">Ask about order progress, medication usage, or platform steps.</p>
            <div className="mt-4 flex gap-2">
              <input placeholder="Ask a question" className="min-h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15" />
              <button className="min-h-11 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white">Send</button>
            </div>
          </section>
        </aside>
      </div>
    </PatientAppShell>
  );
}
