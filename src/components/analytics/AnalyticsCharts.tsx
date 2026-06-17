import React from 'react';
import BarChart from './BarChart';
import StatusBars from './StatusBars';
import type { ReportAnalytics } from '@/services/reportService';

export interface AnalyticsChartsProps {
  analytics: ReportAnalytics;
  ordersTitle?: string;
  revenueTitle?: string;
  showRevenue?: boolean;
}

const fmtMoney = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000 ? `${(v / 1_000).toFixed(1)}k`
  : `${Math.round(v)}`;

/**
 * Renders the standard analytics charts shared by every role dashboard:
 * "Orders by Month", optional "Revenue by Month", and "Orders by Status".
 */
export default function AnalyticsCharts({
  analytics,
  ordersTitle = 'Orders by Month (Last 6 Months)',
  revenueTitle = 'Revenue by Month (RWF)',
  showRevenue = true,
}: AnalyticsChartsProps) {
  const orderLabels = (analytics.ordersByMonth ?? []).map((p) => p.month);
  const orderValues = (analytics.ordersByMonth ?? []).map((p) => p.value);
  const revLabels = (analytics.revenueByMonth ?? []).map((p) => p.month);
  const revValues = (analytics.revenueByMonth ?? []).map((p) => p.value);

  return (
    <div className="space-y-5">
      <div className={`grid grid-cols-1 gap-5 ${showRevenue ? 'lg:grid-cols-2' : ''}`}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-5">{ordersTitle}</h2>
          <div className="h-56 overflow-hidden">
            <BarChart labels={orderLabels} values={orderValues} />
          </div>
        </div>
        {showRevenue && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-5">{revenueTitle}</h2>
            <div className="h-56 overflow-hidden">
              <BarChart labels={revLabels} values={revValues} color="#0B6E63" formatValue={fmtMoney} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-5">Orders by Status</h2>
        <StatusBars data={analytics.ordersByStatus ?? {}} />
      </div>
    </div>
  );
}
