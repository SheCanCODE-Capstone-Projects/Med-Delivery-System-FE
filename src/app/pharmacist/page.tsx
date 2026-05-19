"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck, Loader2, AlertCircle, Pill, CheckCircle2, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { getAssignedOrders, validatePrescription, confirmStock, dispenseMedicine } from '@/services/pharmacistApi';
import type { DispensingOrderResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-100',
  PROCESSING: 'bg-violet-50 text-violet-700 border-violet-100',
  DISPENSED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  COMPLETED: 'bg-teal-50 text-teal-700 border-teal-100',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function PharmacistDashboard() {
  const [orders, setOrders] = useState<DispensingOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssignedOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pending = orders.filter((o) => o.status === 'PENDING');
  const inProgress = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING');
  const completed = orders.filter((o) => o.status === 'DISPENSED' || o.status === 'COMPLETED');

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

  const activeOrders = orders.filter((o) => !['DISPENSED', 'COMPLETED', 'CANCELLED'].includes(o.status));

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dispensing Dashboard</h1>
          <p className="text-slate-500 mt-1">Your assigned orders and dispensing queue.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold flex gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Awaiting Action', value: pending.length, icon: Clock, color: 'text-amber-600 bg-amber-50', href: '/pharmacist/orders' },
          { label: 'In Progress', value: inProgress.length, icon: ClipboardCheck, color: 'text-violet-600 bg-violet-50', href: '/pharmacist/orders' },
          { label: 'Completed', value: completed.length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', href: '/pharmacist/history' },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-teal-200 hover:shadow-md transition flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{loading ? '—' : card.value}</p>
              <p className="text-sm text-slate-500 font-medium">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Active Queue</h2>
          <Link href="/pharmacist/orders" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading queue...</span>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Pill size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No active orders in your queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeOrders.slice(0, 8).map((order) => {
              const actionLabel = getActionLabel(order);
              return (
                <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-800 text-sm">{order.patientName}</p>
                      {order.prescriptionUrl && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-100 rounded">Rx</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Order #{order.id}
                      {order.medicines && order.medicines.length > 0 && ` · ${order.medicines.map((m) => m.medicineName).join(', ')}`}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${STATUS_STYLE[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {order.status}
                  </span>
                  {actionLabel && (
                    <button
                      onClick={() => handleAction(order)}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition shrink-0"
                    >
                      {actionLoading === order.id ? <Loader2 size={12} className="animate-spin" /> : null}
                      {actionLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
