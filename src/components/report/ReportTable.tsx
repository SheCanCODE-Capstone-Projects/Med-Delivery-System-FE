interface ReportTableProps {
  title: string;
  columns: string[];
  rows: (string | number | boolean | null | undefined)[][];
  emptyMessage?: string;
}

export default function ReportTable({ title, columns, rows, emptyMessage = 'No data available.' }: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid #d1ede9' }}>
      {/* Section title band */}
      <div className="px-5 py-3 flex items-center gap-2" style={{ background: '#0E9384', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}>
        <div className="w-1 h-4 rounded-full bg-white opacity-60 flex-shrink-0" />
        <h2 className="text-xs font-bold tracking-widest uppercase text-white">{title}</h2>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-6 bg-white">
          <p className="text-sm text-slate-400 italic">{emptyMessage}</p>
        </div>
      ) : (
        <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
          {/* Column headers */}
          <thead>
            <tr style={{ background: '#f0fbf9', borderBottom: '2px solid #b2e4dc', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}>
              <th className="px-4 py-3 text-xs font-bold w-10" style={{ color: '#0E9384' }}>#</th>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-xs font-bold" style={{ color: '#0E9384' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? '#ffffff' : '#f8fffe',
                  borderTop: '1px solid #e5f5f2',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                } as React.CSSProperties}
              >
                <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: '#9ecec8' }}>{i + 1}</td>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-slate-700" style={{ borderLeft: '1px solid #eaf6f4' }}>
                    {cell == null ? '—' : typeof cell === 'boolean' ? (cell ? 'Yes' : 'No') : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
