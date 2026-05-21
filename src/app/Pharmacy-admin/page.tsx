"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Package2, ClipboardCheck, Loader2, AlertCircle } from 'lucide-react';
import { getMyPharmacy } from '@/services/pharmacyApi';
import { getPharmacistsByPharmacy, getInventory } from '@/services/pharmacyApi';
import { getPharmacyId } from '@/services/authApi';
import type { PharmacyResponse } from '@/types/api';

export default function PharmacyAdminDashboard() {
  const [pharmacy, setPharmacy] = useState<PharmacyResponse | null>(null);
  const [pharmacistCount, setPharmacistCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const ph = await getMyPharmacy();
        setPharmacy(ph);
        const pharmacyId = ph.id ?? getPharmacyId();
        if (pharmacyId) {
          const [pharmacists, inventory] = await Promise.all([
            getPharmacistsByPharmacy(pharmacyId).catch(() => []),
            getInventory(pharmacyId).catch(() => []),
          ]);
          setPharmacistCount(pharmacists.length);
          setInventoryCount(inventory.length);
        }
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

  const cards = [
    { label: 'Pharmacists', value: pharmacistCount, icon: Users, href: '/Pharmacy-admin/employees', color: 'text-teal-600 bg-teal-50' },
    { label: 'Inventory Items', value: inventoryCount, icon: Package2, href: '/Pharmacy-admin/inventory', color: 'text-sky-600 bg-sky-50' },
    { label: 'View Orders', value: '→', icon: ClipboardCheck, href: '/Pharmacy-admin/orders', color: 'text-violet-600 bg-violet-50' },
    { label: 'Settings', value: '→', icon: Building2, href: '/Pharmacy-admin/settings', color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{pharmacy?.name ?? 'My Pharmacy'}</h1>
        <p className="text-slate-500 mt-1 flex items-center gap-2">
          <Building2 size={14} />
          {pharmacy?.address ?? '—'} &middot; Licence: {pharmacy?.licenseNumber ?? '—'}
        </p>
        <span className={`mt-2 inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
          pharmacy?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
          pharmacy?.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
          'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {pharmacy?.status ?? '—'}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-teal-200 hover:shadow-md transition group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-sm text-slate-500 font-medium mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Pharmacy Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Pharmacy Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Name', value: pharmacy?.name },
            { label: 'Manager', value: pharmacy?.managerName },
            { label: 'Email', value: pharmacy?.email },
            { label: 'Phone', value: pharmacy?.phoneNumber },
            { label: 'Address', value: pharmacy?.address },
            { label: 'Licence', value: pharmacy?.licenseNumber },
          ].map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-400 uppercase">{row.label}</span>
              <span className="font-semibold text-slate-700">{row.value ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
