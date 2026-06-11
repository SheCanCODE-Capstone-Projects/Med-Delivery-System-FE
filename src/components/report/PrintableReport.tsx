import React from 'react';
import { Printer } from 'lucide-react';

export interface ReportMeta {
  rows: { label: string; value: string | number | undefined | null }[];
}

interface PrintableReportProps {
  title: string;
  subtitle?: string;
  meta?: ReportMeta;
  generatedBy?: string;
  generatedDate?: string;
  children: React.ReactNode;
}

export default function PrintableReport({
  title,
  subtitle,
  meta,
  generatedBy,
  generatedDate,
  children,
}: PrintableReportProps) {
  return (
    <>
      <style>{`
        @media print {
          /* Make everything invisible, then selectively show the report */
          body * { visibility: hidden; }
          .med-print-root,
          .med-print-root * { visibility: visible; }
          /* Position the report at the top-left of the printed page */
          .med-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print { display: none !important; }
          /* Force colours in print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Remove clipping so long tables are not cut off */
          .print-container {
            overflow: visible !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Keep table rows together; repeat headers on every page */
          table { page-break-inside: auto; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      <div className="med-print-root">
        {/* Print button — screen only */}
        <div className="no-print mb-6 flex justify-end">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>

        {/* ── Document ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print-container">

          {/* ── Page header: title left, logo right ── */}
          <div className="px-8 pt-7 pb-4 flex items-start justify-between border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
              {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
              {generatedDate && (
                <p className="text-xs text-slate-400 mt-2">Generated: {generatedDate}</p>
              )}
            </div>
            {/* Logo placeholder */}
            <div className="shrink-0 w-16 h-16 border-2 border-slate-200 rounded-lg flex flex-col items-center justify-center text-center bg-slate-50 text-slate-400">
              <div className="text-[9px] font-bold leading-tight text-center px-1">MedDelivery</div>
            </div>
          </div>

          {/* ── Meta info panel (DATE / CLIENT / SITE style) ── */}
          {meta && meta.rows.length > 0 && (
            <div className="px-8 py-5 border-b border-slate-200">
              <div className="border border-slate-300 rounded overflow-hidden">
                {/* Section header band */}
                <div className="bg-slate-700 text-white px-4 py-2">
                  <span className="text-xs font-bold tracking-widest uppercase">Report Information</span>
                </div>
                {/* Label : Value rows */}
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    {meta.rows.map((row) => (
                      <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
                        <td
                          className="py-2 pr-3 pl-6 font-bold text-slate-600 text-right whitespace-nowrap"
                          style={{ width: '38%' }}
                        >
                          {row.label}:
                        </td>
                        <td className="py-2 pl-3 pr-6 text-slate-800">
                          {row.value ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Body sections (ReportTables etc.) ── */}
          <div className="px-8 py-6 space-y-6">
            {children}
          </div>

          {/* ── Footer: signature lines ── */}
          <div className="px-8 py-6 border-t border-slate-200 bg-slate-50/50">
            <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm text-slate-600">
              <div className="flex items-end gap-3">
                <span className="font-bold whitespace-nowrap">Prepared By:</span>
                <span className="border-b-2 border-slate-400 inline-block min-w-[140px] pb-0.5 text-slate-800">
                  {generatedBy ?? ''}
                </span>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-bold">Signature:</span>
                <span className="border-b-2 border-slate-400 inline-block min-w-[180px] pb-0.5" />
              </div>
              <div className="flex items-end gap-3">
                <span className="font-bold">Date:</span>
                <span className="border-b-2 border-slate-400 inline-block min-w-[120px] pb-0.5" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
