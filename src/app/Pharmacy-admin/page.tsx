"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2, Users, Package2, ClipboardList, ShieldCheck,
  Settings, TrendingUp, AlertTriangle, Loader2, AlertCircle,
  ArrowRight, Clock
} from 'lucide-react';
import { getMyPharmacy, getPharmacistsByPharmacy, getInventory } from '@/services/pharmacyApi';
import { getUserName } from '@/services/authApi';
import type { PharmacyResponse, PharmacyInventoryResponse } from '@/types/api';

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE:   { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PENDING:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  SUSPENDED:{ bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500'    },
};

export default function PharmacyAdminDashboard() {
  const [pharmacy, setPharmacy] = useState<PharmacyResponse | null>(null);
  const [pharmacistCount, setPharmacistCount] = useState(0);
  const [inventory, setInventory] = useState<PharmacyInventoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const managerName = typeof window !== 'undefined' ? getUserName() : null;

  useEffect(() => {
    const load = async () => {
      try {
        const ph = await getMyPharmacy();
        setPharmacy(ph);
        const [pharmacists, inv] = await Promise.all([
          getPharmacistsByPharmacy(ph.id).catch(() => []),
          getInventory(ph.id).catch(() => []),
        ]);
        setPharmacistCount(pharmacists.length);
        setInventory(inv);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <Loader2 className="animate-spin" size={24} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-600 p-8">
        <AlertCircle size={32} />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const lowStockItems = inventory.filter(
    (i) => i.lowStockThreshold != null && i.quantity <= i.lowStockThreshold
  );
  const statusStyle = STATUS_STYLE[pharmacy?.status ?? ''] ?? { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };

  const quickLinks = [
    { label: 'Employees', sub: `${pharmacistCount} pharmacist${pharmacistCount !== 1 ? 's' : ''}`, icon: Users, href: '/Pharmacy-admin/employees', gradient: 'from-violet-500 to-indigo-600' },
    { label: 'Inventory', sub: `${inventory.length} item${inventory.length !== 1 ? 's' : ''}`, icon: Package2, href: '/Pharmacy-admin/inventory', gradient: 'from-teal-500 to-cyan-600' },
    { label: 'Orders', sub: 'View & manage', icon: ClipboardList, href: '/Pharmacy-admin/orders', gradient: 'from-rose-500 to-pink-600' },
    { label: 'Insurance', sub: 'Providers & cards', icon: ShieldCheck, href: '/Pharmacy-admin/partners', gradient: 'from-amber-500 to-orange-500' },
    { label: 'Patients', sub: 'Order history', icon: TrendingUp, href: '/Pharmacy-admin/patients', gradient: 'from-sky-500 to-blue-600' },
    { label: 'Settings', sub: 'Profile & config', icon: Settings, href: '/Pharmacy-admin/settings', gradient: 'from-slate-500 to-slate-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 80% 20%, white 0%, transparent 50%)'}} />
        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium mb-1">
            Welcome back, {managerName ?? pharmacy?.managerName ?? 'Manager'}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">{pharmacy?.name ?? 'My Pharmacy'}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-indigo-200">
            {pharmacy?.address && (
              <span className="flex items-center gap-1.5">
                <Building2 size={13} />
                {pharmacy.address}
              </span>
            )}
            {pharmacy?.address && <span className="opacity-40">&middot;</span>}
            <span>Licence: {pharmacy?.licenseNumber ?? '—'}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              {pharmacy?.status ?? '—'}
            </span>
            {pharmacy?.status !== 'ACTIVE' && (
              <span className="text-xs text-indigo-300">Pending admin approval</span>
            )}
          </div>
        </div>
      </div>

      {/* Alerts row */}
      {lowStockItems.length > 0 && (
        <Link
          href="/Pharmacy-admin/inventory"
          className="flex items-center justify-between gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low on stock
              </p>
              <p className="text-xs text-amber-600">
                {lowStockItems.map((i) => i.medicineName).slice(0, 3).join(', ')}
                {lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} more` : ''}
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-amber-500 group-hover:translate-x-1 transition" />
        </Link>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pharmacists', value: pharmacistCount, icon: Users, color: 'text-violet-600 bg-violet-50 border-violet-100' },
          { label: 'Inventory Items', value: inventory.length, icon: Package2, color: 'text-teal-600 bg-teal-50 border-teal-100' },
          { label: 'Low Stock', value: lowStockItems.length, icon: AlertTriangle, color: lowStockItems.length > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-400 bg-slate-50 border-slate-100' },
          { label: 'Status', value: pharmacy?.status ?? '—', icon: Clock, color: pharmacy?.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-2 ${stat.color.split(' ')[2]}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color.split(' ')[1]}`}>
              <stat.icon size={16} className={stat.color.split(' ')[0]} />
            </div>
            <p className="text-xl font-extrabold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick navigation */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-transparent hover:shadow-lg transition-all duration-200"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                <link.icon size={18} className="text-white" />
              </div>
              <p className="font-bold text-slate-800 text-sm">{link.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{link.sub}</p>
              <ArrowRight size={14} className="absolute right-4 bottom-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Pharmacy details footer card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Pharmacy Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Name', value: pharmacy?.name },
            { label: 'Licence', value: pharmacy?.licenseNumber },
            { label: 'Contact', value: pharmacy?.contactInfo },
            { label: 'Address', value: pharmacy?.address },
            { label: 'Manager', value: pharmacy?.managerName },
            { label: 'Manager Email', value: pharmacy?.managerEmail },
          ].map((row) => (
            <div key={row.label}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{row.label}</span>
              <span className="font-semibold text-slate-700">{row.value ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
