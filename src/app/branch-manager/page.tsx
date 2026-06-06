"use client";
import React, { useEffect, useState } from 'react';
import { Users, Package2, AlertTriangle, ShoppingBag, Loader2, GitBranch, MapPin } from 'lucide-react';
import { getBranchDashboard, getMyBranch, type BranchStatsResponse, type BranchResponse } from '@/services/branchService';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function BranchManagerDashboard() {
  const [stats, setStats] = useState<BranchStatsResponse | null>(null);
  const [branch, setBranch] = useState<BranchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getBranchDashboard(), getMyBranch()])
      .then(([s, b]) => { setStats(s); setBranch(b); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading dashboard...</span>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-semibold">
      {error}
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Branch Dashboard</h1>
        {branch && (
          <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
            <GitBranch size={14} />
            <span className="font-semibold text-slate-700">{branch.name}</span>
            {branch.address && (
              <>
                <MapPin size={12} className="ml-1" />
                <span>{branch.address}</span>
              </>
            )}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold border ${
              branch.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>{branch.status}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users} label="Pharmacists" value={stats?.pharmacistCount ?? 0} color="bg-teal-500" />
        <StatCard icon={Package2} label="Inventory Items" value={stats?.inventoryItems ?? 0}
          sub={`${stats?.lowStockItems ?? 0} low stock`} color="bg-blue-500" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders ?? 0}
          sub={`${stats?.pendingOrders ?? 0} pending`} color="bg-violet-500" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={stats?.lowStockItems ?? 0}
          sub="items need restocking" color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, color: 'bg-amber-500' },
              { label: 'Completed Orders', value: stats?.completedOrders ?? 0, color: 'bg-emerald-500' },
              { label: 'Total Orders', value: stats?.totalOrders ?? 0, color: 'bg-teal-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Branch Info</h2>
          {branch && (
            <div className="space-y-3 text-sm">
              {[
                { label: 'Pharmacy', value: branch.pharmacyName },
                { label: 'Contact', value: branch.contactInfo ?? '—' },
                { label: 'Manager', value: branch.managerName ?? '—' },
                { label: 'Status', value: branch.status },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
