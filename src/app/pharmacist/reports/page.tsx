"use client";
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getPharmacistReport, type PharmacistReport } from '@/services/reportService';
import PrintableReport from '@/components/report/PrintableReport';
import ReportTable from '@/components/report/ReportTable';

const PERIODS = [
  { value: 'DAILY',    label: 'Today'     },
  { value: 'WEEKLY',   label: 'This Week' },
  { value: 'MONTHLY',  label: 'Monthly'   },
  { value: 'YEARLY',   label: 'Yearly'    },
  { value: 'ALL_TIME', label: 'All Time'  },
];

export default function PharmacistReportsPage() {
  const [report, setReport] = useState<PharmacistReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('MONTHLY');

  useEffect(() => {
    setLoading(true);
    setReport(null);
    getPharmacistReport(period)
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div>
      {/* Period selector */}
      <div className="no-print flex items-center gap-2 mb-4 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
              period === p.value
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={24} /><span>Loading report...</span>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">{error}</div>
      )}

      {!loading && !error && report && (
    <PrintableReport
      title="Pharmacist Activity Report"
      filename={`pharmacist-report-${period.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`}
      generatedBy={report.pharmacistName}
      generatedDate={report.generatedDate}
      meta={{ rows: [
        { label: 'Pharmacist',              value: report.pharmacistName },
        { label: 'Pharmacist ID',           value: report.pharmacistId },
        { label: 'Branch',                  value: report.branch },
        { label: 'Pharmacy',                value: report.pharmacyName },
        { label: 'Report Period',           value: report.reportPeriod },
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
      )}
    </div>
  );
}
