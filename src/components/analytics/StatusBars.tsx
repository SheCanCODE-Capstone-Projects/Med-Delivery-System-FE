import React from 'react';

export interface StatusBarsProps {
  /** Map of order status -> count. */
  data: Record<string, number>;
}

const STATUS_META: Record<string, { label: string; bar: string; text: string }> = {
  COMPLETED:        { label: 'Completed',        bar: 'bg-emerald-500', text: 'text-emerald-600' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', bar: 'bg-sky-500',     text: 'text-sky-600' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bar: 'bg-sky-500',     text: 'text-sky-600' },
  IN_PROGRESS:      { label: 'In Progress',      bar: 'bg-teal-500',    text: 'text-teal-600' },
  ASSIGNED:         { label: 'Assigned',         bar: 'bg-violet-500',  text: 'text-violet-600' },
  STOCK_CONFIRMED:  { label: 'Stock Confirmed',  bar: 'bg-indigo-500',  text: 'text-indigo-600' },
  MATCHING:         { label: 'Matching',         bar: 'bg-amber-500',   text: 'text-amber-600' },
  UPLOADED:         { label: 'Received',         bar: 'bg-amber-400',   text: 'text-amber-600' },
  CANCELLED:        { label: 'Cancelled',        bar: 'bg-rose-500',    text: 'text-rose-600' },
};

function metaFor(status: string) {
  return STATUS_META[status] ?? {
    label: status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' '),
    bar: 'bg-slate-400',
    text: 'text-slate-500',
  };
}

/** Horizontal "Orders by Status" progress bars with percentages. */
export default function StatusBars({ data }: StatusBarsProps) {
  const entries = Object.entries(data ?? {}).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No order activity yet.</p>;
  }

  const sorted = [...entries].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {sorted.map(([status, count]) => {
        const pct = Math.round((count / total) * 100);
        const meta = metaFor(status);
        return (
          <div key={status} className="flex items-center gap-4">
            <span className="w-32 shrink-0 text-sm font-medium text-slate-600">{meta.label}</span>
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`w-12 shrink-0 text-right text-sm font-bold ${meta.text}`}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
