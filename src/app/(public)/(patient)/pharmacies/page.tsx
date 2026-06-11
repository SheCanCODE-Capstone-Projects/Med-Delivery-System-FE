"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Loader2,
  Search,
  X,
  ChevronRight,
  Mail,
} from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { getActivePharmacies, type PharmacyPublicInfo } from "@/services/patientApi";

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<PharmacyPublicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PharmacyPublicInfo | null>(null);

  useEffect(() => {
    getActivePharmacies()
      .then(setPharmacies)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load pharmacies"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = pharmacies.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.address ?? "").toLowerCase().includes(q) ||
      (p.supportedInsurances ?? []).some((ins) => ins.toLowerCase().includes(q))
    );
  });

  return (
    <PatientAppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-8">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Building2 className="text-white" size={26} />
            </div>
            <div>
              <p className="text-teal-100 text-xs font-semibold tracking-widest uppercase">Browse</p>
              <h1 className="text-white text-2xl font-bold leading-tight">Available Pharmacies</h1>
              <p className="text-teal-100 text-sm mt-0.5">{pharmacies.length} active pharmacies in the network</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, address or insurance…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span className="text-sm">Loading pharmacies…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">No pharmacies found</p>
            {search && <p className="text-xs mt-1">Try adjusting your search.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pharmacy) => (
              <button
                key={pharmacy.id}
                onClick={() => setSelected(pharmacy)}
                className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition p-5 flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-teal-600" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pharmacy.status && pharmacy.status !== 'ACTIVE' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Approval
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-teal-500 transition mt-0.5 shrink-0" />
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-sm leading-tight">{pharmacy.name}</p>
                  {pharmacy.pharmacyCode && (
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{pharmacy.pharmacyCode}</p>
                  )}
                </div>

                {pharmacy.address && (
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                    <span className="line-clamp-2">{pharmacy.address}</span>
                  </div>
                )}

                {pharmacy.contactInfo && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={12} className="shrink-0 text-slate-400" />
                    <span>{pharmacy.contactInfo}</span>
                  </div>
                )}

                {(pharmacy.supportedInsurances ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-100">
                    {pharmacy.supportedInsurances!.slice(0, 3).map((ins) => (
                      <span key={ins} className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {ins}
                      </span>
                    ))}
                    {pharmacy.supportedInsurances!.length > 3 && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-500">
                        +{pharmacy.supportedInsurances!.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
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
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <Building2 size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">{selected.name}</p>
                  {selected.pharmacyCode && (
                    <p className="text-teal-100 text-xs font-mono mt-0.5">{selected.pharmacyCode}</p>
                  )}
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
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Address</p>
                    <p className="text-sm text-slate-700">{selected.address}</p>
                  </div>
                </div>
              )}

              {selected.contactInfo && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Contact</p>
                    <p className="text-sm text-slate-700">{selected.contactInfo}</p>
                  </div>
                </div>
              )}

              {selected.managerName && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <User size={14} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Manager</p>
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
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Accepted Insurance</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.supportedInsurances!.map((ins) => (
                        <span key={ins} className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                          {ins}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setSelected(null)}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientAppShell>
  );
}
