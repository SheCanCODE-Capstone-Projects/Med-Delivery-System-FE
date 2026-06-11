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
      {/* Section header — dark band matching Image 4 style */}
      <div className="bg-slate-700 text-white px-4 py-2 rounded-t-lg">
        <h2 className="text-xs font-bold tracking-widest uppercase">{title}</h2>
      </div>

      {rows.length === 0 ? (
        <div className="border border-t-0 border-slate-200 rounded-b-lg px-4 py-5">
          <p className="text-sm text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-t-0 border-slate-200 rounded-b-lg">
          <table
            className="w-full text-left text-sm"
            style={{ borderCollapse: 'collapse' }}
          >
            <thead>
              <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3 border border-slate-200">#</th>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 border border-slate-200">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono border border-slate-200">{i + 1}</td>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-slate-700 border border-slate-200">
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
