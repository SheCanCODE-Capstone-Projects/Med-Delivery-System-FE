"use client";
import React, { useEffect, useState } from 'react';
import { Users, Loader2, AlertCircle, RefreshCw, Search, Mail, Phone } from 'lucide-react';
import { getPharmacyPatients } from '@/services/pharmacyApi';
import { getPharmacyId } from '@/services/authApi';
import type { PatientProfileResponse } from '@/types/api';

export default function OrderOversightPage() {
  const [patients, setPatients] = useState<PatientProfileResponse[]>([]);
  const [filtered, setFiltered] = useState<PatientProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const pharmacyId = getPharmacyId();

  const load = async () => {
    if (!pharmacyId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const data = await getPharmacyPatients(pharmacyId);
      setPatients(data);
      setFiltered(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(patients); return; }
    const q = search.toLowerCase();
    setFiltered(patients.filter((p) =>
      p.fullName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phoneNumber?.includes(q)
    ));
  }, [search, patients]);

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order Oversight</h1>
          <p className="text-slate-500 mt-1">Patients who have orders at your pharmacy.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold flex gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading patient activity...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Users size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No patients found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Blood Type</th>
                <th className="px-6 py-4">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition text-sm">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 overflow-hidden flex items-center justify-center">
                        {p.profileImageUrl ? (
                          <img src={p.profileImageUrl} alt={p.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-teal-600 font-bold text-sm">{p.fullName?.charAt(0) ?? '?'}</span>
                        )}
                      </div>
                      <span className="font-semibold text-slate-800">{p.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex flex-col gap-0.5">
                      {p.email && <span className="flex items-center gap-1.5 text-xs"><Mail size={11} />{p.email}</span>}
                      {p.phoneNumber && <span className="flex items-center gap-1.5 text-xs"><Phone size={11} />{p.phoneNumber}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs capitalize">{p.gender ?? '—'}</td>
                  <td className="px-6 py-4">
                    {p.bloodType ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">{p.bloodType}</span>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          Showing {filtered.length} of {patients.length} patients
        </div>
      </div>
    </div>
  );
}
