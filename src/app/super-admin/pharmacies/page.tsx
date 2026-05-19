"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, AlertCircle, Search, Filter } from 'lucide-react';
import { getAllPharmacies } from '@/services/pharmacyApi';
import type { PharmacyResponse } from '@/types/api';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'];

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  SUSPENDED: 'bg-rose-50 text-rose-600 border-rose-100',
  REJECTED: 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function SuperAdminPharmaciesPage() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<PharmacyResponse[]>([]);
  const [filtered, setFiltered] = useState<PharmacyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    getAllPharmacies()
      .then((data) => { setPharmacies(data); setFiltered(data); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pharmacies'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = pharmacies;
    if (statusFilter !== 'ALL') list = list.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.licenseNumber?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, statusFilter, pharmacies]);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-4 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Pharmacies</h1>
          <p className="text-slate-500 mt-1">View and manage all registered pharmacies on MedDelivery.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by name, email, licence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-72"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          <Filter size={14} className="text-slate-400 ml-2" />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                statusFilter === s ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading pharmacies...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-xl border border-slate-200 shadow-sm gap-3 text-rose-600">
          <AlertCircle size={32} />
          <p className="font-semibold">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-teal-600 underline">Retry</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h2 className="font-bold text-slate-800">Pharmacy Directory</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filtered.length} / {pharmacies.length} pharmacies
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Pharmacy Name</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((pharmacy) => (
                    <tr key={pharmacy.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">#{pharmacy.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{pharmacy.name}</div>
                        <div className="text-xs text-slate-400">{pharmacy.licenseNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{pharmacy.managerName ?? '—'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{pharmacy.email}</div>
                        <div className="text-xs text-slate-400">{pharmacy.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {pharmacy.createdAt ? new Date(pharmacy.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[pharmacy.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {pharmacy.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => router.push(`/super-admin/pharmacies/${pharmacy.id}`)}
                          className="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <AlertCircle size={32} />
                        <p className="font-medium">No pharmacies found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
