"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, MoreVertical, Pill, ClipboardCheck, AlertTriangle, ShieldCheck } from 'lucide-react';

const MOCK_PRESCRIPTIONS = [
  { id: 'RX-9901', patient: 'Jean Claude Uwimana', doctor: 'Dr. Habimana', date: 'Oct 12, 10:30 AM', validUntil: 'Nov 12, 2024', status: 'Pending Review' },
  { id: 'RX-9902', patient: 'Marie Claire Mukamanzi', doctor: 'Dr. Uzziel', date: 'Oct 11, 09:15 AM', validUntil: 'Nov 11, 2024', status: 'Approved' },
  { id: 'RX-9903', patient: 'Emmanuel Rugero', doctor: 'Dr. Sibo', date: 'Oct 10, 04:45 PM', validUntil: 'Oct 17, 2024', status: 'Rejected' },
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

export default function PharmacistPrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-slate-500 mt-1">Validate and manage incoming patient prescriptions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Rx" value="452" icon={Pill} color="text-teal-600" />
        <StatCard label="Pending Review" value="12" icon={ClipboardCheck} color="text-orange-600" />
        <StatCard label="Approved" value="420" icon={ShieldCheck} color="text-emerald-600" />
        <StatCard label="Rejected" value="20" icon={AlertTriangle} color="text-red-600" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search prescriptions by ID, patient, or doctor..."
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
                <th className="px-6 py-4">Rx ID</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Prescribing Doctor</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_PRESCRIPTIONS.map((rx) => (
                <tr key={rx.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500 text-xs">{rx.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{rx.patient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{rx.doctor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">{rx.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">{rx.validUntil}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        rx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        rx.status === 'Pending Review' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {rx.status}
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
