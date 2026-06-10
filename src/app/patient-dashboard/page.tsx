"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ShoppingBag, FileText, CreditCard, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { getMyOrders, getMyPrescriptions, getMyInsuranceCards } from '@/services/patientApi';
import type { OrderResponse, PrescriptionResponse, InsuranceCardResponse } from '@/types/api';

function StatCard({ icon: Icon, label, value, color, href }: {
  icon: React.ElementType; label: string; value: number; color: string; href: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 transition shrink-0" />
    </Link>
  );
}

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
  PENDING:   'bg-amber-100 text-amber-700',
};

function statusColor(s: string) {
  return STATUS_COLOR[s] ?? 'bg-sky-100 text-sky-700';
}

export default function PatientDashboardPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [insuranceCards, setInsuranceCards] = useState<InsuranceCardResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyOrders(0, 50).then(p => setOrders(p.content)).catch(() => {}),
      getMyPrescriptions().then(setPrescriptions).catch(() => {}),
      getMyInsuranceCards().then(setInsuranceCards).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading your dashboard...</span>
    </div>
  );

  const completed = orders.filter(o => o.status === 'COMPLETED').length;
  const active    = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;
  const recent    = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here&apos;s an overview of your health activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag}  label="Total Orders"      value={orders.length}           color="bg-sky-500"     href="/patient-dashboard/orders" />
        <StatCard icon={CheckCircle2} label="Completed"         value={completed}               color="bg-emerald-500" href="/patient-dashboard/orders" />
        <StatCard icon={Clock}        label="Active Orders"     value={active}                  color="bg-amber-500"   href="/patient-dashboard/orders" />
        <StatCard icon={FileText}     label="Prescriptions"     value={prescriptions.length}    color="bg-violet-500"  href="/patient-dashboard/prescriptions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Recent Orders</h2>
            <Link href="/patient-dashboard/orders" className="text-xs text-sky-600 font-semibold hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Order #{o.id}</p>
                    <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(o.status)}`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h2>
          {[
            { href: '/patient-dashboard/prescriptions', icon: FileText,   label: 'Upload a Prescription', color: 'text-violet-600 bg-violet-50' },
            { href: '/patient-dashboard/insurance',     icon: CreditCard, label: 'Manage Insurance',      color: 'text-sky-600 bg-sky-50' },
            { href: '/patient-dashboard/reports',       icon: ShoppingBag,label: 'View My Report',        color: 'text-emerald-600 bg-emerald-50' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition group"
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} shrink-0`}>
                <Icon size={15} />
              </span>
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500 transition" />
            </Link>
          ))}
          {insuranceCards.length === 0 && (
            <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-xs font-semibold">
              No insurance card on file. Add one to save on orders.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
