"use client";
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getPharmacistReport, type PharmacistReport } from '@/services/reportService';
import PrintableReport from '@/components/report/PrintableReport';
import ReportTable from '@/components/report/ReportTable';

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
        { label: 'Pharmacist',              value: report.pharmacistName },
        { label: 'Pharmacist ID',           value: report.pharmacistId },
        { label: 'Branch',                  value: report.branch },
        { label: 'Pharmacy',                value: report.pharmacyName },
        { label: 'Report Date',             value: report.reportDate },
        { label: 'Prescriptions Reviewed',  value: report.prescriptionsReviewed },
        { label: 'Approved',                value: report.prescriptionsApproved },
        { label: 'Rejected',                value: report.prescriptionsRejected },
        { label: 'Medicines Dispensed',     value: report.medicinesDispensed },
        { label: 'Generated On',            value: report.generatedDate },
      ]}}
    >
      <ReportTable
        title="Processed Prescriptions"
        columns={['Order ID', 'Patient', 'Status', 'Validation', 'Date']}
        rows={(report.processedPrescriptions ?? []).map((r) => [
          `#${r.orderId}`, r.patientName, r.status, r.validationStatus, r.date,
        ])}
        emptyMessage="No prescriptions processed yet."
      />

      <ReportTable
        title="Dispensed Medicines"
        columns={['Medicine', 'Total Quantity']}
        rows={(report.dispensedMedicines ?? []).map((r) => [r.medicineName, r.totalQuantity])}
        emptyMessage="No medicines dispensed yet."
      />

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
