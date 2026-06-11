
interface ReportTableProps {
  title: string;
  columns: string[];
  rows: (string | number | boolean | null | undefined)[][];
  emptyMessage?: string;
}

export default function ReportTable({ title, columns, rows, emptyMessage = 'No data available.' }: ReportTableProps) {
  return (
    <div className="border border-slate-300 rounded overflow-hidden">
      {/* Section header — dark band matching image style */}
      <div className="bg-slate-700 text-white px-4 py-2">
        <h2 className="text-xs font-bold tracking-widest uppercase">{title}</h2>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-5 bg-white">
          <p className="text-sm text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
          {/* Column header row */}
          <thead>
            <tr className="bg-white border-b border-slate-300">
              <th className="px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 text-xs">#</th>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 text-xs last:border-r-0">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-t border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="px-4 py-2.5 text-slate-500 font-mono text-xs border-r border-slate-200">{i + 1}</td>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 text-slate-700 border-r border-slate-200 last:border-r-0">
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
