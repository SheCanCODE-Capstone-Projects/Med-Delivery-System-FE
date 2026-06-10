"use client";
import React, { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, Loader2, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import {
  getMyPharmacy,
  getInsuranceProviders,
  getPharmacyInsuranceProviders,
  addPharmacyInsuranceProvider,
  removePharmacyInsuranceProvider,
} from '@/services/pharmacyApi';
import type { InsuranceProvider } from '@/types/api';

export default function InsurancePage() {
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [myInsurances, setMyInsurances] = useState<InsuranceProvider[]>([]);
  const [allProviders, setAllProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [adding, setAdding] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const pharmacy = await getMyPharmacy();
        setPharmacyId(pharmacy.id);
        const [all, mine] = await Promise.all([
          getInsuranceProviders(),
          getPharmacyInsuranceProviders(pharmacy.id),
        ]);
        setAllProviders(all);
        setMyInsurances(mine);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load insurance data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const available = allProviders.filter((p) => !myInsurances.find((m) => m.id === p.id));

  const handleAdd = async (provider: InsuranceProvider) => {
    if (!pharmacyId) return;
    setAdding(provider.id);
    setActionMsg('');
    try {
      await addPharmacyInsuranceProvider(pharmacyId, provider.id);
      setMyInsurances((prev) => [...prev, provider]);
      setActionMsg(`${provider.name} added successfully.`);
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Failed to add provider');
    } finally {
      setAdding(null);
    }
  };

  const handleRemove = async (provider: InsuranceProvider) => {
    if (!pharmacyId || !window.confirm(`Remove ${provider.name} from your insurance list?`)) return;
    setRemoving(provider.id);
    setActionMsg('');
    try {
      await removePharmacyInsuranceProvider(pharmacyId, provider.id);
      setMyInsurances((prev) => prev.filter((m) => m.id !== provider.id));
      setActionMsg(`${provider.name} removed.`);
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Failed to remove provider');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Insurance Providers</h1>
        <p className="text-slate-500 mt-1">Manage which insurance providers your pharmacy accepts.</p>
      </div>

      <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>
          Select insurance providers from the master list below. Patients will see these when placing orders. You can remove providers when contracts end.
        </span>
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={15} /> {actionMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={22} /><span>Loading insurance data…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Active Providers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Shield size={16} className="text-teal-600" />
              <h2 className="text-sm font-bold text-slate-800">Active Providers</h2>
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                {myInsurances.length}
              </span>
            </div>

            {myInsurances.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Shield size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No insurance providers added yet.</p>
                <p className="text-xs mt-1">Add from the available list on the right.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myInsurances.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <Shield size={15} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">
                        Code: <span className="font-mono font-bold text-slate-600">{p.code}</span>
                        {' · '}{p.coveragePercentage}% coverage
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(p)}
                      disabled={removing === p.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
                    >
                      {removing === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Providers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Plus size={16} className="text-violet-600" />
              <h2 className="text-sm font-bold text-slate-800">Available to Add</h2>
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                {available.length}
              </span>
            </div>

            {available.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {allProviders.length === 0
                    ? 'No insurance providers registered yet.'
                    : 'All available providers are already active.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {available.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                      <Shield size={15} className="text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">
                        Code: <span className="font-mono font-bold text-slate-600">{p.code}</span>
                        {' · '}{p.coveragePercentage}% coverage
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      disabled={adding === p.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-600 border border-teal-100 rounded-lg hover:bg-teal-100 transition disabled:opacity-50"
                    >
                      {adding === p.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </>
  );
}
