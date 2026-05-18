"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, History, Calendar, CheckSquare, MoreVertical } from 'lucide-react';

const MOCK_HISTORY = [
  { id: 'LOG-7701', action: 'Order Fulfilled', entityId: 'ORD-5003', date: 'Oct 11, 2024 - 05:00 PM', value: '$120.00', status: 'Success' },
  { id: 'LOG-7702', action: 'Prescription Validated', entityId: 'RX-9902', date: 'Oct 11, 2024 - 09:20 AM', value: '--', status: 'Success' },
  { id: 'LOG-7703', action: 'Stock Replenished', entityId: 'INV-103', date: 'Oct 10, 2024 - 02:15 PM', value: '+500 units', status: 'Success' },
  { id: 'LOG-7704', action: 'Prescription Rejected', entityId: 'RX-9903', date: 'Oct 10, 2024 - 04:55 PM', value: '--', status: 'Failed' },
];

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-slate-50 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function PharmacistHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaction History</h1>
          <p className="text-slate-500 mt-1">Audit logs of all pharmacy transactions and validations.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            <Download size={18} />
            Export Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Logs" value="8,942" icon={History} color="text-teal-600" />
        <StatCard label="Last 7 Days" value="450" icon={Calendar} color="text-blue-600" />
        <StatCard label="Success Events" value="8,800" icon={CheckSquare} color="text-emerald-600" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search history by log ID, action, or entity..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-slate-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
            <Filter size={15} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafb] text-[11px] font-semibold text-slate-500 tracking-wide uppercase border-b border-slate-100">
                <th className="px-6 py-4">Log ID</th>
                <th className="px-6 py-4">Action Taken</th>
                <th className="px-6 py-4">Reference Entity</th>
                <th className="px-6 py-4">Value / Metric</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_HISTORY.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500 text-xs">{log.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500 text-xs">{log.entityId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{log.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">{log.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {log.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
