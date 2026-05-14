"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, Truck, MapPin, Navigation, CheckCircle, MoreVertical } from 'lucide-react';

const MOCK_DELIVERIES = [
  { id: 'DEL-1011', orderId: 'ORD-5001', address: 'Kigali Heights, Kimihurura', rider: 'Moses N.', timeEstimate: '15 mins', status: 'In Transit' },
  { id: 'DEL-1012', orderId: 'ORD-5002', address: 'Remera, Kisimenti', rider: 'Peter K.', timeEstimate: '--', status: 'Delivered' },
  { id: 'DEL-1013', orderId: 'ORD-5005', address: 'Kacyiru, near Library', rider: 'Unassigned', timeEstimate: '--', status: 'Awaiting Pickup' },
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

export default function PharmacistDeliveryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Delivery Routing</h1>
          <p className="text-slate-500 mt-1">Track and manage active rider dispatches.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            <Download size={18} />
            Export Routes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Dispatches" value="84" icon={Truck} color="text-teal-600" />
        <StatCard label="In Transit" value="12" icon={Navigation} color="text-blue-600" />
        <StatCard label="Awaiting Pickup" value="5" icon={MapPin} color="text-orange-600" />
        <StatCard label="Delivered Today" value="67" icon={CheckCircle} color="text-emerald-600" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search deliveries by ID, Order, or Address..."
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
                <th className="px-6 py-4">Delivery ID</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Destination Address</th>
                <th className="px-6 py-4">Assigned Rider</th>
                <th className="px-6 py-4">Est. Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_DELIVERIES.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500 text-xs">{delivery.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500 text-xs">{delivery.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-800">{delivery.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{delivery.rider}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">{delivery.timeEstimate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        delivery.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        delivery.status === 'In Transit' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {delivery.status}
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
