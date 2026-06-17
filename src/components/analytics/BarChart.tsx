import React from 'react';

export interface BarChartProps {
  labels: string[];
  values: number[];
  /** Bar fill color (defaults to teal). */
  color?: string;
  /** Format the value label drawn above each bar. */
  formatValue?: (v: number) => string;
}

/**
 * Lightweight SVG vertical bar chart used by the role analytics dashboards.
 * Renders a value label above each bar and a category label below it.
 */
export default function BarChart({
  labels, values, color = '#0E9384', formatValue,
}: BarChartProps) {
  const W = 720, H = 280;
  const pad = { top: 28, right: 16, bottom: 32, left: 16 };
  const w = W - pad.left - pad.right;
  const h = H - pad.top - pad.bottom;
  const max = Math.max(...values, 1);
  const n = values.length || 1;
  const slot = w / n;
  const barW = Math.min(slot * 0.5, 56);

  const fmt = formatValue ?? ((v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* baseline */}
      <line x1={pad.left} y1={pad.top + h} x2={W - pad.right} y2={pad.top + h} stroke="#e2e8f0" strokeWidth={1} />
      {values.map((v, i) => {
        const barH = max > 0 ? (v / max) * h : 0;
        const x = pad.left + slot * i + (slot - barW) / 2;
        const y = pad.top + h - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={6} fill={color} opacity={0.92} />
            <text x={x + barW / 2} y={y - 8} textAnchor="middle" fill="#334155" fontSize={12} fontWeight={700}>
              {v > 0 ? fmt(v) : ''}
            </text>
            <text x={x + barW / 2} y={H - 10} textAnchor="middle" fill="#94a3b8" fontSize={12}>
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
