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
          /* Hide everything except our report root */
          body > * { display: none !important; }
          .med-print-root { display: block !important; }
          /* Remove screen chrome from the report itself */
          .no-print { display: none !important; }
          .print-container {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          /* Force colour */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Full-width pages */
          @page { margin: 1.5cm; }
        }
      `}</style>

      <div className="med-print-root">
        {/* Screen: Print button */}
        <div className="no-print mb-6 flex items-center justify-end">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>

        {/* Report document */}
        <div className="print-container bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-slate-800 text-white px-8 py-6 flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-1">MedDelivery System</p>
              <h1 className="text-2xl font-bold tracking-wide">{title}</h1>
              {subtitle && <p className="text-slate-300 text-sm mt-1">{subtitle}</p>}
            </div>
            <div className="text-right text-xs text-slate-400 shrink-0">
              {generatedDate && <p>Generated: {generatedDate}</p>}
              {generatedBy && <p className="mt-0.5">By: {generatedBy}</p>}
            </div>
          </div>

          {/* ── Meta info panel (like DATE/CLIENT/SITE in Image 4) ── */}
          {meta && meta.rows.length > 0 && (
            <div className="border-b border-slate-200">
              <div className="px-8 py-2 bg-slate-700 text-white">
                <p className="text-xs font-bold tracking-widest uppercase">Report Information</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-x divide-y divide-slate-100">
                {meta.rows.map((row) => (
                  <div key={row.label} className="px-6 py-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{row.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{row.value ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Body ── */}
          <div className="p-8 space-y-8">
            {children}
          </div>

          {/* ── Footer ── */}
          <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/40 flex flex-wrap items-center justify-between gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Prepared By:</span>
              <span className="border-b border-slate-400 inline-block w-40 pb-0.5">{generatedBy ?? ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Signature:</span>
              <span className="border-b border-slate-400 inline-block w-48 pb-0.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Date:</span>
              <span className="border-b border-slate-400 inline-block w-32 pb-0.5" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
