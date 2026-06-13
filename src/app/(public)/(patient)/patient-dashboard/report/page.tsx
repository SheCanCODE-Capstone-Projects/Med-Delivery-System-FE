"use client";
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getPatientReport, type PatientReport } from '@/services/reportService';
import PatientAppShell from '@/components/layout/PatientAppShell';
import PrintableReport from '@/components/report/PrintableReport';
import ReportTable from '@/components/report/ReportTable';

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
          filename={`patient-report-${new Date().toISOString().slice(0, 10)}.pdf`}
          generatedBy={report.patientName}
          generatedDate={report.generatedDate}
          meta={{ rows: [
            { label: 'Patient Name',      value: report.patientName },
            { label: 'Report Date',       value: report.reportDate },
            { label: 'Total Orders',      value: report.totalOrders },
            { label: 'Total Prescriptions', value: report.totalPrescriptions },
            { label: 'Medicines Ordered', value: report.purchasedMedicines?.length ?? 0 },
            { label: 'Deliveries',        value: report.deliveryHistory?.length ?? 0 },
            { label: 'Total Spent',       value: fmt(report.totalAmountSpent ?? 0) },
            { label: 'Generated On',      value: report.generatedDate },
          ]}}
        >
          <ReportTable
            title="Order History"
            columns={['Order ID', 'Date', 'Status', 'Type', 'Amount', 'Notes']}
            rows={(report.orderHistory ?? []).map((r) => [
              `#${r.orderId}`, r.date, r.status, r.orderType,
              fmt(r.amount ?? 0), r.medicationNotes || '—',
            ])}
            emptyMessage="No orders yet."
          />

          <ReportTable
            title="Prescription History"
            columns={['Prescription ID', 'Upload Date', 'Status', 'Validation']}
            rows={(report.prescriptionHistory ?? []).map((r) => [
              `#${r.prescriptionId}`, r.uploadDate, r.status, r.validationStatus,
            ])}
            emptyMessage="No prescriptions uploaded."
          />

          <ReportTable
            title="Purchased Medicines"
            columns={['Medicine', 'Quantity', 'Order ID', 'Date']}
            rows={(report.purchasedMedicines ?? []).map((r) => [
              r.medicineName, r.quantity, r.orderId, r.date,
            ])}
            emptyMessage="No medicines purchased yet."
          />

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
