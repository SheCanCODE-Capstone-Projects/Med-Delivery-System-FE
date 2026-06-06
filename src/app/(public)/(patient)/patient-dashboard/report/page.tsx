"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, ClipboardList, FileText, Pill } from 'lucide-react';
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
            <StatCard icon={ClipboardList} label="Total Orders"       value={report.totalOrders}        color="bg-teal-600" />
            <StatCard icon={FileText}      label="Prescriptions"      value={report.totalPrescriptions} color="bg-violet-600" />
            <StatCard icon={Pill}          label="Total Spent"        value={fmt(report.totalAmountSpent ?? 0)} color="bg-sky-600" />
          </div>

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
