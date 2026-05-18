"use client";
import React, { useState } from 'react';
import { PackageSearch, Search, Filter, Download, MoreVertical, Archive } from 'lucide-react';

const MOCK_INVENTORY = [
  { id: 'INV-100', name: 'Amoxicillin 500mg', category: 'Antibiotics', initialStock: 1000, currentStock: 450, cost: '$12.00', status: 'In Stock' },
  { id: 'INV-101', name: 'Ibuprofen 400mg', category: 'Pain Relief', initialStock: 2000, currentStock: 150, cost: '$4.50', status: 'Low Stock' },
  { id: 'INV-102', name: 'Atorvastatin 20mg', category: 'Cardiovascular', initialStock: 800, currentStock: 0, cost: '$25.00', status: 'Out of Stock' },
  { id: 'INV-103', name: 'Metformin 850mg', category: 'Diabetes', initialStock: 1500, currentStock: 1100, cost: '$8.20', status: 'In Stock' },
  { id: 'INV-104', name: 'Omeprazole 20mg', category: 'Gastrointestinal', initialStock: 500, currentStock: 80, cost: '$15.00', status: 'Low Stock' },
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

export default function PharmacistInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Manage and track your pharmacy stock levels.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Items" value="1,248" icon={PackageSearch} color="text-teal-600" />
        <StatCard label="In Stock" value="1,150" icon={Archive} color="text-emerald-600" />
        <StatCard label="Low Stock" value="84" icon={Archive} color="text-orange-600" />
        <StatCard label="Out of Stock" value="14" icon={Archive} color="text-red-600" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory by item or ID..."
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
                <th className="px-6 py-4">Item ID</th>
                <th className="px-6 py-4">Medication Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_INVENTORY.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500 text-xs">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="font-bold text-slate-700">{item.currentStock}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : item.status === 'Low Stock' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {item.status}
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
