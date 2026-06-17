"use client";
import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, ClipboardList, FileText, Wallet, CheckCircle2 } from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { getPatientReport, type PatientReport } from "@/services/reportService";
import StatCard from "@/components/analytics/StatCard";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";

export default function PatientAnalyticsPage() {
  const [report, setReport] = useState<PatientReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getPatientReport("ALL_TIME")
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const completed = report?.ordersByStatus?.COMPLETED ?? 0;

  return (
    <PatientAppShell>
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading analytics…</p>
        </div>
      )}

      {!loading && (error || !report) && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-600">
          <AlertCircle size={36} />
          <p className="font-semibold">{error || "No analytics data."}</p>
          <button onClick={load} className="text-sm text-teal-600 underline">Retry</button>
        </div>
      )}

      {!loading && !error && report && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-7 text-white shadow-lg">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <p className="text-teal-100 text-xs font-bold tracking-widest uppercase mb-1">My Analytics</p>
              <h1 className="text-2xl font-bold text-white leading-tight">Your Health Activity</h1>
              <p className="text-teal-100 text-sm mt-0.5">Orders, prescriptions and spending at a glance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Orders" value={Number(report.totalOrders).toLocaleString()} icon={ClipboardList}
              iconBg="bg-sky-50" iconColor="text-sky-600" accent="border-l-sky-500" />
            <StatCard label="Prescriptions" value={Number(report.totalPrescriptions).toLocaleString()} icon={FileText}
              iconBg="bg-violet-50" iconColor="text-violet-600" accent="border-l-violet-500" />
            <StatCard label="Amount Spent (RWF)" value={Number(report.totalAmountSpent ?? 0).toLocaleString()} icon={Wallet}
              iconBg="bg-amber-50" iconColor="text-amber-600" accent="border-l-amber-500" />
            <StatCard label="Completed Orders" value={Number(completed).toLocaleString()} icon={CheckCircle2}
              iconBg="bg-emerald-50" iconColor="text-emerald-600" accent="border-l-emerald-500" />
          </div>

          <AnalyticsCharts analytics={report} revenueTitle="Spending by Month (RWF)" />
        </div>
      )}
    </PatientAppShell>
  );
}
