import React from 'react';

interface ReportTableProps {
  title: string;
  columns: string[];
  rows: (string | number | boolean | null | undefined)[][];
  emptyMessage?: string;
}

export default function ReportTable({ title, columns, rows, emptyMessage = 'No data available.' }: ReportTableProps) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-700 mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 py-4">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-slate-700">
                      {cell == null ? '—' : typeof cell === 'boolean' ? (cell ? 'Yes' : 'No') : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
