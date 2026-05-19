"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Search, UserRound, Users } from "lucide-react";
import PharmacyAdminLayout from "@/components/layout/PharmacyAdminLayout";
import { getPharmacyPatients } from "@/services/pharmacyApi";
import { getPharmacyId } from "@/services/authApi";
import type { PatientProfileResponse } from "@/types/api";

export default function PharmacyPatientsPage() {
  const [patients, setPatients] = useState<PatientProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const id = getPharmacyId();
    if (!id) { setError("Pharmacy ID not found. Please log in again."); setLoading(false); return; }
    getPharmacyPatients(id)
      .then(setPatients)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? patients.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          p.email?.toLowerCase().includes(search.toLowerCase()) ||
          p.phoneNumber?.includes(search)
      )
    : patients;

  return (
    <PharmacyAdminLayout>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Our Patients</h1>
          <p className="text-slate-500 mt-1">Patients who have placed orders at this pharmacy.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-medium">Total Patients</p>
          <p className="text-2xl font-bold text-teal-600">{patients.length.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="pl-9 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading patients…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">{search ? "No patients match your search." : "No patients found."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Date of Birth</th>
                  <th className="px-6 py-4">Blood Type</th>
                  <th className="px-6 py-4">Allergies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                          <UserRound className="h-4 w-4 text-teal-600" />
                        </div>
                        <span className="font-semibold text-slate-800">{patient.fullName ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{patient.email ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-500">{patient.phoneNumber ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {patient.bloodType ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          {patient.bloodType}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">
                      {patient.allergies || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PharmacyAdminLayout>
  );
}
