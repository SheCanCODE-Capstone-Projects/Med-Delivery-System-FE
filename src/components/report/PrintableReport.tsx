import React from 'react';
import { Printer, Download } from 'lucide-react';

export interface ReportMeta {
  rows: { label: string; value: string | number | undefined | null }[];
}

interface PrintableReportProps {
  title: string;
  subtitle?: string;
  meta?: ReportMeta;
  generatedBy?: string;
  generatedDate?: string;
  filename?: string;
  children: React.ReactNode;
}

export default function PrintableReport({
  title,
  subtitle,
  meta,
  generatedBy,
  generatedDate,
  filename,
  children,
}: PrintableReportProps) {
  const handleDownload = () => {
    const prev = document.title;
    document.title = (filename ?? 'report').replace(/\.pdf$/i, '');
    window.print();
    setTimeout(() => { document.title = prev; }, 500);
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .med-print-root,
          .med-print-root * { visibility: visible; }
          .med-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            forced-color-adjust: none !important;
          }
          .print-container {
            overflow: visible !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          table { page-break-inside: auto; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      <div className="med-print-root">
        {/* ── Document card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print-container">

          {/* ── Banner header ── */}
          <div
            className="px-8 py-6 flex items-start justify-between"
            style={{
              background: 'linear-gradient(135deg, #0E9384 0%, #0a7568 100%)',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            } as React.CSSProperties}
          >
            {/* Left: brand + title */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <span className="text-sm font-bold tracking-wide" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  MedDelivery
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{subtitle}</p>
              )}
            </div>

            {/* Right: date + action buttons */}
            <div className="flex flex-col items-end gap-3">
              <div className="no-print flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >
                  <Printer size={14} /> Print / PDF
                </button>
                <button
                  onClick={handleDownload}
                  title="Opens print dialog — choose 'Save as PDF' to download"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
              {generatedDate && (
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Generated
                  </div>
                  <div className="text-sm font-bold text-white">{generatedDate}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Meta / Report Information ── */}
          {meta && meta.rows.length > 0 && (
            <div className="px-8 py-6 border-b border-slate-100" style={{ background: '#fafffe', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: '#0E9384' }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#0E9384' }}>
                  Report Information
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                {meta.rows.map((row) => (
                  <div key={row.label} className="flex items-baseline gap-3 py-1.5 border-b border-slate-100 last:border-b-0">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap w-40 flex-shrink-0 text-right">
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {row.value ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Body: tables and content ── */}
          <div className="px-8 py-6 space-y-6">
            {children}
          </div>

          {/* ── Footer ── */}
          <div className="px-8 pb-6">
            <div className="h-px w-full mb-5" style={{ background: 'linear-gradient(90deg, #0E9384, rgba(14,147,132,0.1))', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties} />
            <div className="flex flex-wrap gap-x-12 gap-y-4 text-sm text-slate-600">
              <div className="flex items-end gap-3">
                <span className="font-bold text-xs uppercase tracking-wide text-slate-500">Prepared By</span>
                <span
                  className="border-b-2 inline-block min-w-[160px] pb-0.5 text-slate-800 font-semibold"
                  style={{ borderColor: '#0E9384' }}
                >
                  {generatedBy ?? ''}
                </span>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-bold text-xs uppercase tracking-wide text-slate-500">Signature</span>
                <span className="border-b-2 inline-block min-w-[180px] pb-0.5" style={{ borderColor: '#cbd5e1' }} />
              </div>
              <div className="flex items-end gap-3">
                <span className="font-bold text-xs uppercase tracking-wide text-slate-500">Date</span>
                <span className="border-b-2 inline-block min-w-[120px] pb-0.5" style={{ borderColor: '#cbd5e1' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
