"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, TrendingUp, ShoppingBag, Package2, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getBranchManagerReport, type BranchManagerReport } from '@/services/reportService';
import PrintableReport from '@/components/report/PrintableReport';
import ReportTable from '@/components/report/ReportTable';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function BarChart({ bars, color = '#0E9384' }: { bars: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="flex items-end gap-3 h-36 w-full print:hidden">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-[11px] font-bold text-slate-600">{b.value}</span>
          <div
            className="w-full rounded-t-md"
            style={{ height: `${Math.max((b.value / max) * 112, b.value ? 6 : 2)}px`, background: color, WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
          />
          <span className="text-[10px] text-slate-500 truncate w-full text-center leading-tight">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBar({ items, max, color = '#0E9384' }: { items: { label: string; value: number; sub?: string }[]; max: number; color?: string }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm text-slate-700 w-36 min-w-0 truncate flex-shrink-0" title={item.label}>{item.label}</span>
          <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden min-w-0">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%`, background: color, WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 w-20 text-right flex-shrink-0">
            {item.value}{item.sub ? ` ${item.sub}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BranchReportsPage() {
  const [report, setReport] = useState<BranchManagerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBranchManagerReport()
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading report...</span>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">{error}</div>
  );

  if (!report) return null;

  const fmt = (n: number) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n);

  const orderBreakdownBars = [
    { label: 'Delivered',    value: report.delivered ?? 0 },
    { label: 'Pending',      value: report.pending ?? 0 },
    { label: 'Cancelled',    value: report.cancelled ?? 0 },
    { label: 'Prescription', value: report.prescriptionOrders ?? 0 },
  ];

  const topSales = [...(report.salesReport ?? [])].sort((a, b) => b.qtySold - a.qtySold).slice(0, 8);
  const maxSalesQty = Math.max(...topSales.map(s => s.qtySold), 1);

  const topRevenue = [...(report.salesReport ?? [])].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  const maxRevenue = Math.max(...topRevenue.map(s => s.revenue), 1);

  return (
    <PrintableReport
      title="Branch Manager Report"
      generatedBy={report.managerName}
      generatedDate={report.generatedDate}
      meta={{ rows: [
        { label: 'Manager Name', value: report.managerName },
        { label: 'Branch', value: report.branchName },
        { label: 'Report Period', value: report.reportPeriod },
        { label: 'Total Orders', value: report.totalOrders },
        { label: 'Pharmacists', value: report.pharmacistCount },
        { label: 'Patients Served', value: report.patientsServed },
      ]}}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={ShoppingBag} label="Total Orders"     value={report.totalOrders}       color="bg-teal-600" />
        <StatCard icon={TrendingUp}  label="Revenue"          value={fmt(report.revenue ?? 0)} color="bg-violet-600" />
        <StatCard icon={Users}       label="Patients Served"  value={report.patientsServed}    color="bg-sky-600" />
        <StatCard icon={Users}       label="Pharmacists"      value={report.pharmacistCount}   color="bg-emerald-600" />
        <StatCard icon={CheckCircle2}label="Delivered"        value={report.delivered}         color="bg-emerald-500" />
        <StatCard icon={XCircle}     label="Cancelled"        value={report.cancelled}         color="bg-rose-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Orders Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Orders Breakdown</h3>
          <p className="text-[10px] text-slate-400 mb-4">Count per order outcome category</p>
          <BarChart bars={orderBreakdownBars} color="#0E9384" />
          {/* print fallback */}
          <table className="hidden print:table w-full text-xs mt-2 border-collapse">
            <thead><tr><th className="text-left border border-slate-200 px-2 py-1">Category</th><th className="text-right border border-slate-200 px-2 py-1">Count</th></tr></thead>
            <tbody>{orderBreakdownBars.map(b => <tr key={b.label}><td className="border border-slate-200 px-2 py-1">{b.label}</td><td className="border border-slate-200 px-2 py-1 text-right">{b.value}</td></tr>)}</tbody>
          </table>
        </div>

        {/* Delivery Breakdown detail */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Delivery Breakdown</h3>
          <div className="space-y-3">
            {[
              { icon: CheckCircle2, label: 'Delivered',           value: report.delivered,         color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              { icon: Clock,        label: 'Pending',             value: report.pending,           color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
              { icon: XCircle,      label: 'Cancelled',           value: report.cancelled,         color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-100' },
              { icon: Package2,     label: 'Prescription Orders', value: report.prescriptionOrders, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${bg}`}>
                <div className="flex items-center gap-2">
                  <Icon size={15} className={color} />
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </div>
                <span className={`text-lg font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top medicines charts */}
      {topSales.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-5">Top Medicines by Quantity Sold</h3>
            <HorizontalBar items={topSales.map(s => ({ label: s.medicineName, value: s.qtySold, sub: 'units' }))} max={maxSalesQty} color="#0E9384" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-5">Top Medicines by Revenue</h3>
            <HorizontalBar
              items={topRevenue.map(s => ({ label: s.medicineName, value: Math.round(s.revenue / 1000) }))}
              max={Math.round(maxRevenue / 1000)}
              color="#8b5cf6"
            />
            <p className="text-[10px] text-slate-400 mt-3">Values in RWF&apos;000</p>
          </div>
        </div>
      )}

      {/* Sales Report */}
      <ReportTable
        title="Sales Report"
        columns={['Medicine', 'Qty Sold', 'Revenue']}
        rows={(report.salesReport ?? []).map((r) => [r.medicineName, r.qtySold, fmt(r.revenue ?? 0)])}
        emptyMessage="No sales data yet."
      />

      {/* Prescription Report */}
      <ReportTable
        title="Prescription Orders"
        columns={['Order ID', 'Patient', 'Status', 'Date']}
        rows={(report.prescriptions ?? []).map((r) => [`#${r.orderId}`, r.patientName, r.status, r.date])}
        emptyMessage="No prescriptions yet."
      />

      {/* Inventory Report */}
      <ReportTable
        title="Branch Inventory"
        columns={['Medicine', 'Available Stock', 'Unit', 'Low Stock']}
        rows={(report.inventoryReport ?? []).map((r) => [r.medicineName, r.availableStock, r.unit, r.lowStock ? 'Yes' : 'No'])}
        emptyMessage="No inventory items."
      />

      {/* Staff Activities */}
      <ReportTable
        title="Staff Activities"
        columns={['Pharmacist', 'ID', 'Orders Handled', 'Active']}
        rows={(report.staffActivities ?? []).map((r) => [r.pharmacistName, r.pharmacistId, r.ordersHandled, r.active ? 'Yes' : 'No'])}
        emptyMessage="No staff data."
      />
    </PrintableReport>
  );
}
