"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Loader2,
  Search,
  X,
  Mail,
  ArrowRight,
  Pill,
} from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { getActivePharmacies, type PharmacyPublicInfo } from "@/services/patientApi";

type Filter = "all" | "insured" | "verified";

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<PharmacyPublicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<PharmacyPublicInfo | null>(null);

  useEffect(() => {
    getActivePharmacies()
      .then(setPharmacies)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load pharmacies"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = pharmacies.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.address ?? "").toLowerCase().includes(q) ||
      (p.supportedInsurances ?? []).some((ins) => ins.toLowerCase().includes(q));
    const matchFilter =
      filter === "all" ||
      (filter === "insured" && (p.supportedInsurances ?? []).length > 0) ||
      filter === "verified";
    return matchSearch && matchFilter;
  });

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "insured", label: "Has Insurance" },
    { key: "verified", label: "Verified" },
  ];

  return (
    <PatientAppShell>
      <div className="space-y-5">

        {/* ── Hero header ── */}
        <div className="relative overflow-hidden rounded-2xl px-6 py-8" style={{ background: 'linear-gradient(135deg, #0E9384 0%, #0a7568 100%)' }}>
          {/* decorative dots */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          {/* decorative pill icon top-right */}
          <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-6 bottom-0 h-16 w-16 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <Building2 className="text-white" size={26} />
            </div>
            <div>
              <p className="text-teal-100 text-xs font-bold tracking-widest uppercase mb-0.5">Browse</p>
              <h1 className="text-white text-2xl font-bold leading-tight">Available Pharmacies</h1>
              <p className="text-teal-100 text-sm mt-1">
                {loading ? "Loading…" : `${pharmacies.length} active pharmacies in the network`}
                {!loading && <span className="ml-2 opacity-70">· Find one near you</span>}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, address or insurance…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── Filter chips ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition"
              style={
                filter === c.key
                  ? { background: '#0E9384', color: '#fff', borderColor: '#0E9384' }
                  : { background: '#fff', color: '#475569', borderColor: '#e2e8f0' }
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span className="text-sm">Loading pharmacies…</span>
          </div>
        ) : filtered.length === 0 ? (
          /* ── Empty state ── */
          <div className="py-16 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 shadow-inner" style={{ background: '#f0fbf9' }}>
              <Building2 size={36} style={{ color: '#0E9384' }} />
            </div>
            <p className="font-bold text-slate-800 text-base mb-1">
              {search ? "No matching pharmacies" : "No pharmacies available yet"}
            </p>
            <p className="text-sm text-slate-400 max-w-xs">
              {search
                ? "Try adjusting your search or clearing the filters."
                : "We're growing our network. Check back soon or contact support."}
            </p>
            {!search && (
              <Link
                href="/patient-dashboard"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition"
                style={{ background: '#0E9384' }}
              >
                Go to Dashboard <ArrowRight size={15} />
              </Link>
            )}
          </div>
        ) : (
          /* ── Cards grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pharmacy) => (
              <button
                key={pharmacy.id}
                onClick={() => setSelected(pharmacy)}
                className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group flex flex-col"
                style={{ borderLeft: '4px solid #0E9384' }}
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 flex items-start gap-3">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 ring-2 ring-offset-2"
                    style={{ background: '#e6f7f5', ringColor: '#b2e4dc' }}
                  >
                    <Building2 size={20} style={{ color: '#0E9384' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm leading-tight truncate">{pharmacy.name}</p>
                        {pharmacy.pharmacyCode && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">#{pharmacy.pharmacyCode}</p>
                        )}
                      </div>
                      {pharmacy.status && pharmacy.status !== 'ACTIVE' ? (
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      ) : (
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-5 border-t border-slate-100" />

                {/* Details */}
                <div className="px-5 py-3 space-y-2 flex-1">
                  {pharmacy.address && (
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="shrink-0 mt-0.5" style={{ color: '#0E9384' }} />
                      <span className="line-clamp-2">{pharmacy.address}</span>
                    </div>
                  )}
                  {pharmacy.contactInfo && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={12} className="shrink-0" style={{ color: '#0E9384' }} />
                      <span>{pharmacy.contactInfo}</span>
                    </div>
                  )}
                </div>

                {/* Insurance footer */}
                {(pharmacy.supportedInsurances ?? []).length > 0 && (
                  <div className="px-5 pb-3 flex flex-wrap gap-1 border-t border-slate-50 pt-3">
                    <ShieldCheck size={11} className="shrink-0 mt-0.5" style={{ color: '#0E9384' }} />
                    {pharmacy.supportedInsurances!.slice(0, 2).map((ins) => (
                      <span key={ins} className="px-2 py-0.5 text-[10px] font-semibold rounded-full" style={{ background: '#e6f7f5', color: '#0E9384' }}>
                        {ins}
                      </span>
                    ))}
                    {pharmacy.supportedInsurances!.length > 2 && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-500">
                        +{pharmacy.supportedInsurances!.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* View details CTA */}
                <div className="px-5 pb-4 pt-2">
                  <span className="text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#0E9384' }}>
                    View Details <ArrowRight size={12} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-6 py-5 flex items-start justify-between gap-3" style={{ background: 'linear-gradient(135deg, #0E9384 0%, #0a7568 100%)' }}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <Building2 size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">{selected.name}</p>
                  {selected.pharmacyCode && (
                    <p className="text-teal-100 text-xs font-mono mt-0.5">#{selected.pharmacyCode}</p>
                  )}
                  <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white border border-white/30">
                    {selected.status === 'ACTIVE' ? 'Active' : 'Pending Approval'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              {selected.address && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0fbf9' }}>
                    <MapPin size={14} style={{ color: '#0E9384' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Address</p>
                    <p className="text-sm text-slate-700">{selected.address}</p>
                  </div>
                </div>
              )}

              {selected.contactInfo && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0fbf9' }}>
                    <Phone size={14} style={{ color: '#0E9384' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Contact</p>
                    <p className="text-sm text-slate-700">{selected.contactInfo}</p>
                  </div>
                </div>
              )}

              {selected.managerName && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0fbf9' }}>
                    <User size={14} style={{ color: '#0E9384' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Manager</p>
                    <p className="text-sm text-slate-700">{selected.managerName}</p>
                    {selected.managerEmail && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail size={11} className="text-slate-400" />
                        <p className="text-xs text-slate-500">{selected.managerEmail}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selected.supportedInsurances ?? []).length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0fbf9' }}>
                    <ShieldCheck size={14} style={{ color: '#0E9384' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Accepted Insurance</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.supportedInsurances!.map((ins) => (
                        <span key={ins} className="px-2.5 py-1 text-xs font-semibold rounded-full border" style={{ background: '#e6f7f5', color: '#0E9384', borderColor: '#b2e4dc' }}>
                          {ins}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer — two buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Close
              </button>
              <Link
                href="/order"
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white text-center flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: '#0E9384' }}
                onClick={() => setSelected(null)}
              >
                <Pill size={14} /> Order Medicine
              </Link>
            </div>
          </div>
        </div>
      )}
    </PatientAppShell>
  );
}
