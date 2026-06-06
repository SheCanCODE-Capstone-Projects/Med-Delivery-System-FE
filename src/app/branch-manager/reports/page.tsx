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

  return (
    <PrintableReport
      title="Branch Manager Report"
      entityName={report.branchName}
      generatedBy={report.managerName}
      period={report.reportPeriod}
      generatedDate={report.generatedDate}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={report.totalOrders} color="bg-teal-600" />
        <StatCard icon={TrendingUp} label="Revenue" value={fmt(report.revenue ?? 0)} color="bg-violet-600" />
        <StatCard icon={Users} label="Patients Served" value={report.patientsServed} color="bg-sky-600" />
        <StatCard icon={Users} label="Pharmacists" value={report.pharmacistCount} color="bg-emerald-600" />
        <StatCard icon={CheckCircle2} label="Delivered" value={report.delivered} color="bg-emerald-500" />
        <StatCard icon={XCircle} label="Cancelled" value={report.cancelled} color="bg-rose-500" />
      </div>

      {/* Delivery Breakdown */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Delivery Breakdown</h3>
        <div className="flex gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span className="font-semibold text-slate-700">Delivered:</span>
            <span className="font-bold text-emerald-700">{report.delivered}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={15} className="text-amber-600" />
            <span className="font-semibold text-slate-700">Pending:</span>
            <span className="font-bold text-amber-700">{report.pending}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle size={15} className="text-rose-600" />
            <span className="font-semibold text-slate-700">Cancelled:</span>
            <span className="font-bold text-rose-700">{report.cancelled}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Package2 size={15} className="text-violet-600" />
            <span className="font-semibold text-slate-700">Prescription Orders:</span>
            <span className="font-bold text-violet-700">{report.prescriptionOrders}</span>
          </div>
        </div>
      </div>

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
