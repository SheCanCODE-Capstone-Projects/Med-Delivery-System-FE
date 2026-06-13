"use client";
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getBranchManagerReport, type BranchManagerReport } from '@/services/reportService';
import PrintableReport from '@/components/report/PrintableReport';
import ReportTable from '@/components/report/ReportTable';

const PERIODS = [
  { value: 'DAILY',    label: 'Today'     },
  { value: 'WEEKLY',   label: 'This Week' },
  { value: 'MONTHLY',  label: 'Monthly'   },
  { value: 'YEARLY',   label: 'Yearly'    },
  { value: 'ALL_TIME', label: 'All Time'  },
];

export default function BranchReportsPage() {
  const [report, setReport] = useState<BranchManagerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('MONTHLY');

  useEffect(() => {
    setLoading(true);
    setReport(null);
    getBranchManagerReport(period)
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [period]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
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
          title="Branch Manager Report"
          filename={`branch-report-${period.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`}
          generatedBy={report.managerName}
          generatedDate={report.generatedDate}
          meta={{ rows: [
            { label: 'Manager',              value: report.managerName },
            { label: 'Branch',               value: report.branchName },
            { label: 'Report Period',        value: report.reportPeriod },
            { label: 'Total Orders',         value: report.totalOrders },
            { label: 'Revenue',              value: fmt(report.revenue ?? 0) },
            { label: 'Patients Served',      value: report.patientsServed },
            { label: 'Pharmacists',          value: report.pharmacistCount },
            { label: 'Delivered',            value: report.delivered },
            { label: 'Pending',              value: report.pending },
            { label: 'Cancelled',            value: report.cancelled },
            { label: 'Prescription Orders',  value: report.prescriptionOrders },
            { label: 'Generated On',         value: report.generatedDate },
          ]}}
        >
          <ReportTable
            title="Sales Report"
            columns={['Medicine', 'Qty Sold', 'Revenue (RWF)']}
            rows={(report.salesReport ?? []).map((r) => [r.medicineName, r.qtySold, fmt(r.revenue ?? 0)])}
            emptyMessage="No sales data yet."
          />

          <ReportTable
            title="Prescription Orders"
            columns={['Order ID', 'Patient', 'Status', 'Date']}
            rows={(report.prescriptions ?? []).map((r) => [`#${r.orderId}`, r.patientName, r.status, r.date])}
            emptyMessage="No prescriptions yet."
          />

          <ReportTable
            title="Branch Inventory"
            columns={['Medicine', 'Available Stock', 'Unit', 'Low Stock']}
            rows={(report.inventoryReport ?? []).map((r) => [r.medicineName, r.availableStock, r.unit, r.lowStock ? 'Yes' : 'No'])}
            emptyMessage="No inventory items."
          />

          <ReportTable
            title="Staff Activities"
            columns={['Pharmacist', 'ID', 'Orders Handled', 'Active']}
            rows={(report.staffActivities ?? []).map((r) => [r.pharmacistName, r.pharmacistId, r.ordersHandled, r.active ? 'Yes' : 'No'])}
            emptyMessage="No staff data."
          />
        </PrintableReport>
      )}
    </div>
  );
}
