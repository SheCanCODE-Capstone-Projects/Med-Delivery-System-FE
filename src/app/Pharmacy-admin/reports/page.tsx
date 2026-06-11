"use client";
import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { getPharmacyAdminReport, type PharmacyAdminReport } from "@/services/reportService";
import PrintableReport from "@/components/report/PrintableReport";
import ReportTable from "@/components/report/ReportTable";

export default function ReportsPage() {
  const [comprehensiveReport, setComprehensiveReport] = useState<PharmacyAdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPharmacyAdminReport()
      .then(setComprehensiveReport)
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load report"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading report…</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-600">
      <AlertCircle size={32} /><p>{error}</p>
    </div>
  );

  if (!comprehensiveReport) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <p>No report data available.</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pharmacy Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Comprehensive report generated from your pharmacy data</p>
      </div>

      <PrintableReport
        title="Pharmacy Admin Comprehensive Report"
        generatedBy={comprehensiveReport.generatedBy}
        generatedDate={comprehensiveReport.generatedDate}
        meta={{ rows: [
          { label: 'Pharmacy',        value: comprehensiveReport.pharmacyName },
          { label: 'Manager',         value: comprehensiveReport.generatedBy },
          { label: 'Report Period',   value: comprehensiveReport.reportPeriod },
          { label: 'Total Branches',  value: comprehensiveReport.totalBranches },
          { label: 'Total Staff',     value: comprehensiveReport.totalStaff },
          { label: 'Total Orders',    value: comprehensiveReport.totalOrders },
          { label: 'Total Revenue',   value: `RWF ${Number(comprehensiveReport.totalRevenue ?? 0).toLocaleString()}` },
          { label: 'Inventory Items', value: comprehensiveReport.totalInventoryItems },
          { label: 'Generated On',    value: comprehensiveReport.generatedDate },
        ]}}
      >
        <ReportTable
          title="Branch Performance"
          columns={['Branch', 'Orders', 'Pharmacists', 'Inventory Items', 'Status']}
          rows={(comprehensiveReport.branchPerformance ?? []).map((r) => [
            r.branchName, r.orders, r.pharmacists, r.inventoryItems, r.status,
          ])}
          emptyMessage="No branch data."
        />

        <ReportTable
          title="Staff Summary"
          columns={['Employee', 'Email', 'Role', 'Branch', 'Active']}
          rows={(comprehensiveReport.staffSummary ?? []).map((r) => [
            r.employeeName, r.email, r.role, r.branch, r.active ? 'Yes' : 'No',
          ])}
          emptyMessage="No staff data."
        />

        <ReportTable
          title="Inventory Summary"
          columns={['Medicine', 'Total Stock', 'Unit', 'Price (RWF)']}
          rows={(comprehensiveReport.inventorySummary ?? []).map((r) => [
            r.medicineName, r.totalStock, r.unit, r.price,
          ])}
          emptyMessage="No inventory data."
        />

        <ReportTable
          title="Low Stock Medicines"
          columns={['Medicine', 'Current Stock', 'Reorder Level', 'Branch']}
          rows={(comprehensiveReport.lowStockMedicines ?? []).map((r) => [
            r.medicineName, r.currentStock, r.reorderLevel, r.branch,
          ])}
          emptyMessage="No low-stock items."
        />
      </PrintableReport>
    </div>
  );
}
