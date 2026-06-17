import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent?: string; // left border accent color class, e.g. "border-l-teal-500"
}

/**
 * KPI stat card used across all role analytics dashboards.
 * Mirrors the Super Admin analytics card styling for visual consistency.
 */
export default function StatCard({
  label, value, sub, subColor, icon: Icon, iconBg, iconColor, accent,
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 ${accent ? `border-l-4 ${accent}` : ''} shadow-sm p-5 hover:shadow-md hover:border-slate-200 transition-all duration-200`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {sub && <p className={`text-xs font-semibold mt-1 ${subColor ?? 'text-teal-600'}`}>{sub}</p>}
    </div>
  );
}
