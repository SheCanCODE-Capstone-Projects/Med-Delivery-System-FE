"use client";
import React, { useEffect, useState } from 'react';
import { Loader2, ClipboardList, CheckCircle2, XCircle, Pill } from 'lucide-react';
import { getPharmacistReport, type PharmacistReport } from '@/services/reportService';
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

export default function PharmacistReportsPage() {
  const [report, setReport] = useState<PharmacistReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPharmacistReport()
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

  return (
    <PrintableReport
      title="Pharmacist Activity Report"
      generatedBy={report.pharmacistName}
      generatedDate={report.generatedDate}
      meta={{ rows: [
        { label: 'Pharmacist Name', value: report.pharmacistName },
        { label: 'Pharmacist ID', value: report.pharmacistId },
        { label: 'Branch', value: report.branch },
        { label: 'Pharmacy', value: report.pharmacyName },
        { label: 'Report Date', value: report.reportDate },
        { label: 'Generated On', value: report.generatedDate },
      ]}}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Reviewed"  value={report.prescriptionsReviewed}  color="bg-teal-600" />
        <StatCard icon={CheckCircle2} label="Approved"   value={report.prescriptionsApproved}  color="bg-emerald-600" />
        <StatCard icon={XCircle}      label="Rejected"   value={report.prescriptionsRejected}  color="bg-rose-500" />
        <StatCard icon={Pill}         label="Dispensed"  value={report.medicinesDispensed}      color="bg-violet-600" />
      </div>

      {/* Processed Prescriptions */}
      <ReportTable
        title="Processed Prescriptions"
        columns={['Order ID', 'Patient', 'Status', 'Validation', 'Date']}
        rows={(report.processedPrescriptions ?? []).map((r) => [
          `#${r.orderId}`, r.patientName, r.status, r.validationStatus, r.date,
        ])}
        emptyMessage="No prescriptions processed yet."
      />

      {/* Dispensed Medicines */}
      <ReportTable
        title="Dispensed Medicines"
        columns={['Medicine', 'Total Quantity']}
        rows={(report.dispensedMedicines ?? []).map((r) => [r.medicineName, r.totalQuantity])}
        emptyMessage="No medicines dispensed yet."
      />

      {/* Rejected Prescriptions */}
      <ReportTable
        title="Rejected Prescriptions"
        columns={['Order ID', 'Patient', 'Reason', 'Date']}
        rows={(report.rejectedPrescriptions ?? []).map((r) => [
          `#${r.orderId}`, r.patientName, r.reason, r.date,
        ])}
        emptyMessage="No rejected prescriptions."
      />
    </PrintableReport>
  );
}
