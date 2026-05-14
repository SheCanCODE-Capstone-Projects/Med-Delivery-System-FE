"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, FileText, CheckCircle, Clock, XCircle, MoreVertical } from 'lucide-react';

const MOCK_ORDERS = [
  { id: 'ORD-5001', patient: 'Jean Claude Uwimana', items: 3, total: '$45.00', date: 'Oct 12, 10:30 AM', status: 'Pending' },
  { id: 'ORD-5002', patient: 'Marie Claire Mukamanzi', items: 1, total: '$12.50', date: 'Oct 12, 09:15 AM', status: 'Processing' },
  { id: 'ORD-5003', patient: 'Emmanuel Rugero', items: 5, total: '$120.00', date: 'Oct 11, 04:45 PM', status: 'Completed' },
  { id: 'ORD-5004', patient: 'Divine Ishimwe', items: 2, total: '$25.00', date: 'Oct 11, 02:20 PM', status: 'Cancelled' },
  { id: 'ORD-5005', patient: 'Patrick Niyomugabo', items: 4, total: '$65.80', date: 'Oct 11, 11:10 AM', status: 'Processing' },
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

export default function PharmacistOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders Management</h1>
          <p className="text-slate-500 mt-1">Manage processing and fulfillment of patient orders.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Orders" value="1,284" icon={FileText} color="text-teal-600" />
        <StatCard label="Pending" value="23" icon={Clock} color="text-orange-600" />
        <StatCard label="Completed" value="1,156" icon={CheckCircle} color="text-emerald-600" />
        <StatCard label="Cancelled" value="105" icon={XCircle} color="text-red-600" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders by ID or patient..."
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
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total Value</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500 text-xs">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{order.patient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{order.items} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-medium">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {order.status}
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
