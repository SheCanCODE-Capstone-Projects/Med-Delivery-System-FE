"use client";
import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, ClipboardCheck, CheckCircle2, XCircle, Pill } from "lucide-react";
import { getPharmacistReport, type PharmacistReport } from "@/services/reportService";
import StatCard from "@/components/analytics/StatCard";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";

export default function PharmacistAnalyticsPage() {
  const [report, setReport] = useState<PharmacistReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getPharmacistReport("ALL_TIME")
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading analytics…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-600">
        <AlertCircle size={36} />
        <p className="font-semibold">{error || "No analytics data."}</p>
        <button onClick={load} className="text-sm text-teal-600 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B2F2B] to-[#0E9384] px-6 py-7 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <p className="text-teal-200 text-xs font-bold tracking-widest uppercase mb-1">Pharmacist</p>
          <h1 className="text-2xl font-bold text-white leading-tight">Dispensing Analytics</h1>
          <p className="text-teal-100 text-sm mt-0.5">{report.pharmacyName}{report.branch && report.branch !== "—" ? ` · ${report.branch}` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Prescriptions Reviewed" value={Number(report.prescriptionsReviewed).toLocaleString()} icon={ClipboardCheck}
          iconBg="bg-sky-50" iconColor="text-sky-600" accent="border-l-sky-500" />
        <StatCard label="Approved" value={Number(report.prescriptionsApproved).toLocaleString()} icon={CheckCircle2}
          iconBg="bg-emerald-50" iconColor="text-emerald-600" accent="border-l-emerald-500" />
        <StatCard label="Rejected" value={Number(report.prescriptionsRejected).toLocaleString()} icon={XCircle}
          iconBg="bg-rose-50" iconColor="text-rose-600" accent="border-l-rose-500" />
        <StatCard label="Medicines Dispensed" value={Number(report.medicinesDispensed).toLocaleString()} icon={Pill}
          iconBg="bg-teal-50" iconColor="text-teal-600" accent="border-l-teal-500" />
      </div>

      <AnalyticsCharts analytics={report} revenueTitle="Order Value by Month (RWF)" />
    </div>
  );
}
