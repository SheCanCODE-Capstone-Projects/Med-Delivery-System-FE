"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Phone, Users, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { searchUsers, updateUserStatus } from '@/services/adminApi';
import type { AdminUserResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200',
  SUSPENDED: 'bg-rose-50 text-rose-600 border-rose-100',
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<AdminUserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await searchUsers({ query: searchTerm || undefined, role: 'PATIENT', page, size: 15 });
      setPatients(res.content);
      setTotal(res.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (patient: AdminUserResponse) => {
    setToggling(patient.id);
    try {
      const newStatus = patient.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateUserStatus(patient.id, { status: newStatus });
      setPatients((prev) => prev.map((p) => p.id === patient.id ? { ...p, status: newStatus } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    } finally {
      setToggling(null);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients & Customers</h1>
          <p className="text-slate-500 mt-1">Directory of all registered patients on the MedDelivery platform.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-medium">Total Patients</p>
          <p className="text-2xl font-bold text-teal-600">{total.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        {error && <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold">{error}</div>}

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={24} />
              <span>Loading patients...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.length > 0 ? patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-sm border border-violet-100">
                          {p.fullName?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{p.fullName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={11} /> {p.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {p.phoneNumber ? (
                        <span className="flex items-center gap-1"><Phone size={11} /> {p.phoneNumber}</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[p.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(p)}
                        disabled={toggling === p.id}
                        title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        className="text-slate-400 hover:text-teal-600 transition disabled:opacity-50"
                      >
                        {toggling === p.id
                          ? <Loader2 size={18} className="animate-spin" />
                          : p.status === 'ACTIVE'
                            ? <ToggleRight size={22} className="text-teal-600" />
                            : <ToggleLeft size={22} />}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <Users size={32} className="mx-auto mb-2 opacity-40" />
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/30">
          <span>Showing {patients.length} of {total} patients</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50 bg-white hover:bg-slate-50">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={patients.length < 15} className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50 bg-white hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </>
  );
}
