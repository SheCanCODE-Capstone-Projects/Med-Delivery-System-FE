"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, ClipboardList, FileText, Pill, Truck, DollarSign } from 'lucide-react';
import { getPatientReport, type PatientReport } from '@/services/reportService';
import PatientAppShell from '@/components/layout/PatientAppShell';
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

function HorizontalBar({ items, max, color = '#0ea5e9' }: {
  items: { label: string; value: number }[];
  max: number;
  color?: string;
}) {
  if (items.length === 0) return <p className="text-sm text-slate-400 text-center py-6">No medicines ordered yet.</p>;
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
          <span className="text-xs font-semibold text-slate-700 w-12 text-right flex-shrink-0">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PatientReportPage() {
  const [report, setReport] = useState<PatientReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPatientReport()
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n);

  const topMedicines = [...(report?.purchasedMedicines ?? [])].sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  const maxQty = Math.max(...topMedicines.map(m => m.quantity), 1);

  return (
    <PatientAppShell>
      {loading && (
        <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={24} /><span>Loading your report...</span>
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">{error}</div>
      )}

      {!loading && !error && report && (
        <PrintableReport
          title="Patient Medical Report"
          entityName={report.patientName}
          generatedDate={report.generatedDate}
          period={report.reportDate}
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={ClipboardList} label="Total Orders"      value={report.totalOrders}                     color="bg-teal-600" />
            <StatCard icon={FileText}      label="Prescriptions"     value={report.totalPrescriptions}              color="bg-violet-600" />
            <StatCard icon={DollarSign}    label="Total Spent"       value={fmt(report.totalAmountSpent ?? 0)}      color="bg-sky-600" />
            <StatCard icon={Pill}          label="Medicines Ordered" value={report.purchasedMedicines?.length ?? 0} color="bg-emerald-600" />
            <StatCard icon={Truck}         label="Deliveries"        value={report.deliveryHistory?.length ?? 0}    color="bg-amber-500" />
          </div>

          {/* Most ordered medicines chart */}
          {topMedicines.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 print:hidden">
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Most Ordered Medicines</h3>
              <HorizontalBar items={topMedicines.map(m => ({ label: m.medicineName, value: m.quantity }))} max={maxQty} />
            </div>
          )}

          {/* Order History */}
          <ReportTable
            title="Order History"
            columns={['Order ID', 'Date', 'Status', 'Type', 'Amount', 'Notes']}
            rows={(report.orderHistory ?? []).map((r) => [
              `#${r.orderId}`, r.date, r.status, r.orderType,
              fmt(r.amount ?? 0), r.medicationNotes || '—',
            ])}
            emptyMessage="No orders yet."
          />

          {/* Prescription History */}
          <ReportTable
            title="Prescription History"
            columns={['Prescription ID', 'Upload Date', 'Status', 'Validation']}
            rows={(report.prescriptionHistory ?? []).map((r) => [
              `#${r.prescriptionId}`, r.uploadDate, r.status, r.validationStatus,
            ])}
            emptyMessage="No prescriptions uploaded."
          />

          {/* Purchased Medicines */}
          <ReportTable
            title="Purchased Medicines"
            columns={['Medicine', 'Quantity', 'Order ID', 'Date']}
            rows={(report.purchasedMedicines ?? []).map((r) => [
              r.medicineName, r.quantity, r.orderId, r.date,
            ])}
            emptyMessage="No medicines purchased yet."
          />

          {/* Delivery History */}
          <ReportTable
            title="Delivery History"
            columns={['Order ID', 'Status', 'Fulfillment Type', 'Date']}
            rows={(report.deliveryHistory ?? []).map((r) => [
              `#${r.orderId}`, r.status, r.fulfillmentType, r.date,
            ])}
            emptyMessage="No delivery history."
          />
        </PrintableReport>
      )}
    </PatientAppShell>
  );
}
