"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell, ClipboardCheck, Loader2, AlertCircle, Pill,
  CheckCircle2, Clock, RefreshCw, ChevronRight,
  Package, PackageSearch, Truck, FileText, Activity,
  AlertTriangle, TrendingUp, ShieldCheck,
} from 'lucide-react';
import { getAssignedOrders, validatePrescription, confirmStock, dispenseMedicine } from '@/services/pharmacistApi';
import { getNotifications } from '@/services/notificationApi';
import type { DispensingOrderResponse, NotificationItem } from '@/types/api';
import { getUserName, getPharmacyId } from '@/services/authApi';
import { usePharmacyWebSocket } from '@/hooks/useOrderWebSocket';

const STATUS_STYLE: Record<string, { pill: string; dot: string; label: string }> = {
  PENDING:    { pill: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400',   label: 'Pending' },
  CONFIRMED:  { pill: 'bg-sky-50 text-sky-700 border-sky-200',          dot: 'bg-sky-400',     label: 'Confirmed' },
  PROCESSING: { pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-400',  label: 'Processing' },
  DISPENSED:  { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', label: 'Dispensed' },
  COMPLETED:  { pill: 'bg-teal-50 text-teal-700 border-teal-200',       dot: 'bg-teal-400',    label: 'Completed' },
  CANCELLED:  { pill: 'bg-rose-50 text-rose-700 border-rose-200',       dot: 'bg-rose-400',    label: 'Cancelled' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function PharmacistDashboard() {
  const [orders, setOrders] = useState<DispensingOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<NotificationItem[]>([]);
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  useEffect(() => { setUserName(getUserName()); }, []);
  useEffect(() => { setPharmacyId(getPharmacyId()); }, []);
  useEffect(() => {
    getNotifications().then((n) => setRecentActivity(n.slice(0, 4))).catch(() => {});
  }, []);

  // Real-time new order alerts for this pharmacy
  usePharmacyWebSocket(pharmacyId, (payload) => {
    if (payload.type === 'NEW_ORDER') {
      load();
      const msg = payload.message as string | undefined;
      setNewOrderAlert(msg ?? 'A new order has been assigned to your pharmacy.');
      setTimeout(() => setNewOrderAlert(null), 6000);
      getNotifications().then((n) => setRecentActivity(n.slice(0, 4))).catch(() => {});
    }
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await getAssignedOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pending    = orders.filter((o) => o.status === 'PENDING');
  const inProgress = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING');
  const completed  = orders.filter((o) => o.status === 'DISPENSED' || o.status === 'COMPLETED');
  const activeOrders = orders.filter((o) => !['DISPENSED', 'COMPLETED', 'CANCELLED'].includes(o.status));
  const needsRx    = activeOrders.filter((o) => o.status === 'PENDING');

  const handleAction = async (order: DispensingOrderResponse) => {
    setActionLoading(order.id);
    try {
      if (order.status === 'PENDING') {
        await validatePrescription(order.id);
      } else if (order.status === 'CONFIRMED' && !order.stockConfirmed) {
        await confirmStock(order.id);
      } else if (order.stockConfirmed) {
        await dispenseMedicine(order.id);
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getActionLabel = (order: DispensingOrderResponse) => {
    if (order.status === 'PENDING') return 'Validate Rx';
    if (order.status === 'CONFIRMED' && !order.stockConfirmed) return 'Confirm Stock';
    if (order.stockConfirmed) return 'Dispense';
    return null;
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const displayName = userName ?? 'Pharmacist';

  return (
    <div className="space-y-6">
      {newOrderAlert && (
        <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 shadow-sm">
          <Bell size={15} className="shrink-0 text-teal-600 animate-bounce" />
          <span>{newOrderAlert}</span>
        </div>
      )}

      {/* Workstation Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-8 flex flex-wrap items-center justify-between gap-4">
        {/* subtle dot pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <Pill className="text-white" size={26} />
          </div>
          <div>
            <p className="text-teal-100 text-xs font-semibold tracking-widest uppercase">{getGreeting()}</p>
            <h1 className="text-white text-2xl font-bold leading-tight">{displayName}</h1>
            <p className="text-teal-100 text-sm mt-0.5">{today} · Pharmacist Portal</p>
          </div>
        </div>

        <div className="relative flex items-center gap-3 flex-wrap">
          {needsRx.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 border border-white/20">
              <AlertTriangle size={14} className="text-white" />
              <span className="text-white text-xs font-semibold">{needsRx.length} Rx awaiting validation</span>
            </div>
          )}
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 text-white text-sm font-semibold transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Awaiting Action', value: pending.length,    icon: Clock,         accent: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100',  href: '/pharmacist/orders' },
          { label: 'In Progress',     value: inProgress.length, icon: Activity,      accent: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100', href: '/pharmacist/orders' },
          { label: 'Dispensed Today', value: completed.length,  icon: CheckCircle2,  accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',href: '/pharmacist/history' },
          { label: 'Total Assigned',  value: orders.length,     icon: TrendingUp,    accent: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-100',   href: '/pharmacist/orders' },
        ].map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:border-teal-200 transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bg} ${card.border} border`}>
                <card.icon size={17} className={card.accent} />
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-500 transition mt-1" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{loading ? <span className="text-slate-300">—</span> : card.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/pharmacist/prescriptions', icon: FileText,      label: 'Review Prescriptions', accent: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
          { href: '/pharmacist/inventory',     icon: PackageSearch,  label: 'Check Inventory',      accent: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-100' },
          { href: '/pharmacist/delivery',      icon: Truck,          label: 'Track Deliveries',     accent: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
          { href: '/pharmacist/orders',        icon: ClipboardCheck, label: 'All Orders',           accent: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-teal-200 hover:shadow-md transition group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.bg} ${item.border} shrink-0`}>
              <item.icon size={15} className={item.accent} />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-teal-700 leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Activity strip */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Bell size={15} className="text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActivity.map((n) => {
              const iconMap: Record<string, React.ElementType> = { ORDER: Package, INSURANCE: ShieldCheck, SUBSTITUTION: RefreshCw };
              const Icon = iconMap[n.type] ?? Bell;
              return (
                <div key={n.id} className={`flex items-start gap-3 px-5 py-3 ${n.read ? "" : "bg-teal-50/20"}`}>
                  <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={12} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-tight ${n.read ? "text-slate-600" : "text-slate-800 font-semibold"}`}>{n.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Dispensing Queue — full width */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-800">Live Dispensing Queue</h2>
            </div>
            <Link href="/pharmacist/orders" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm">Loading queue…</span>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30 text-teal-400" />
              <p className="font-semibold text-sm">Queue is clear</p>
              <p className="text-xs mt-1">No active orders right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {activeOrders.slice(0, 8).map((order) => {
                const st = STATUS_STYLE[order.status];
                const actionLabel = getActionLabel(order);
                return (
                  <div key={order.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/70 transition">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${st?.dot ?? 'bg-slate-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-semibold text-slate-800 text-sm truncate">{order.patientName}</p>
                        {order.prescriptionUrl && (
                          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-100 rounded">Rx</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        #{order.id}
                        {order.medicines?.length ? ` · ${order.medicines.map((m) => m.medicineName).join(', ')}` : ''}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${st?.pill ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {st?.label ?? order.status}
                    </span>
                    {actionLabel && (
                      <button
                        onClick={() => handleAction(order)}
                        disabled={actionLoading === order.id}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition"
                      >
                        {actionLoading === order.id && <Loader2 size={11} className="animate-spin" />}
                        {actionLabel}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
            <span className="text-xs text-slate-400">{activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}</span>
            {activeOrders.length > 8 && (
              <Link href="/pharmacist/orders" className="text-xs font-semibold text-teal-600 hover:underline">
                +{activeOrders.length - 8} more
              </Link>
            )}
          </div>
        </div>
    </div>
  );
}