"use client";
import React, { useState } from 'react';
import { 
  Search, 
  ClipboardCheck, 
  User, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Mock Data ---

const ORDERS = [
  {
    id: "ORD-9283",
    customer: "Samuel Kamali",
    medicine: "Amoxicillin 500mg",
    pharmacy: "Kigali Central",
    status: "Delivered",
    amount: "8,500 RWF",
    date: "10:30 AM",
    type: "Prescription"
  },
  {
    id: "ORD-9284",
    customer: "Alice Umutoni",
    medicine: "Paracetamol 1g",
    pharmacy: "Healing Hands",
    status: "Pending",
    amount: "2,000 RWF",
    date: "11:15 AM",
    type: "OTC"
  },
  {
    id: "ORD-9285",
    customer: "Jean Bosco",
    medicine: "Metformin 850mg",
    pharmacy: "Metro Wellness",
    status: "In Transit",
    amount: "12,400 RWF",
    date: "12:05 PM",
    type: "Chronic"
  },
  {
    id: "ORD-9286",
    customer: "Marie Claire",
    medicine: "Insulin Glargine",
    pharmacy: "Sunlight Pharma",
    status: "Pending",
    amount: "45,000 RWF",
    date: "12:20 PM",
    type: "Prescription"
  },
  {
    id: "ORD-9287",
    customer: "David Mugisha",
    medicine: "Loratadine 10mg",
    pharmacy: "Kigali Central",
    status: "Cancelled",
    amount: "3,500 RWF",
    date: "Yesterday",
    type: "OTC"
  }
];

// --- Sub-components ---

const StatCard = ({ icon: Icon, label, value, trend, colorClass }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 min-w-[240px]">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", colorClass)}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <ArrowUpRight size={10} />
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </div>
);

const OrderRow = ({ order }: any) => (
  <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
    <td className="py-5 pl-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
          {order.id.split('-')[1]}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">{order.id}</p>
          <p className="text-[10px] text-slate-400 font-medium">{order.date}</p>
        </div>
      </div>
    </td>
    <td className="py-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[rgba(10,191,188,0.05)] flex items-center justify-center text-[#0ABFBC]">
          <User size={14} />
        </div>
        <p className="font-bold text-sm text-slate-700">{order.customer}</p>
      </div>
    </td>
    <td className="py-5">
      <div className="flex flex-col gap-0.5">
        <p className="font-bold text-sm text-slate-700">{order.medicine}</p>
        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase">
          <MapPin size={10} />
          {order.pharmacy}
        </div>
      </div>
    </td>
    <td className="py-5">
      <span className={cn(
        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit",
        order.status === "Delivered" && "bg-emerald-50 text-emerald-600 border border-emerald-100",
        order.status === "Pending" && "bg-amber-50 text-amber-600 border border-amber-100",
        order.status === "In Transit" && "bg-blue-50 text-blue-600 border border-blue-100",
        order.status === "Cancelled" && "bg-red-50 text-red-600 border border-red-100"
      )}>
        {order.status === "Delivered" && <CheckCircle2 size={12} />}
        {order.status === "Pending" && <Clock size={12} />}
        {order.status === "In Transit" && <Truck size={12} />}
        {order.status === "Cancelled" && <AlertCircle size={12} />}
        {order.status}
      </span>
    </td>
    <td className="py-5 text-right">
      <p className="font-extrabold text-slate-800 text-sm">{order.amount}</p>
    </td>
    <td className="py-5 pr-4 text-right">
      <button className="p-2 text-slate-400 hover:text-[#0ABFBC] transition-colors">
        <ChevronRight size={18} />
      </button>
    </td>
  </tr>
);

export default function OrderOversightPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#004d4d] tracking-tight">Order Oversight</h1>
          <p className="text-slate-500 font-medium">Monitor real-time fulfillment across all pharmacy partners.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-white transition-all">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-2 bg-[#0ABFBC] text-[#040F1A] px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#5EDEDD] transition-all shadow-lg shadow-teal-900/10">
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={ClipboardCheck} 
          label="Total Orders" 
          value="1,284" 
          trend="+12.5%"
          colorClass="bg-[rgba(10,191,188,0.05)] text-[#0ABFBC]"
        />
        <StatCard 
          icon={Clock} 
          label="Active Fulfillment" 
          value="12" 
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard 
          icon={Truck} 
          label="In Transit" 
          value="18" 
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Completed Today" 
          value="42" 
          trend="+4.2%"
          colorClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-slate-800 text-nowrap">Recent Orders</h3>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex gap-1">
              {["All", "Pending", "Active", "Completed"].map(tab => (
                <button 
                  key={tab} 
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                    tab === "All" ? "bg-[#004d4d] text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, customer or medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-[#0ABFBC] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Medicine & Pharmacy</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ORDERS.filter(o => 
                o.id.toLowerCase().includes(search.toLowerCase()) || 
                o.customer.toLowerCase().includes(search.toLowerCase()) ||
                o.medicine.toLowerCase().includes(search.toLowerCase())
              ).map(order => (
                <OrderRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-slate-50 flex justify-center">
            <button className="text-[#089A97] text-xs font-bold uppercase tracking-widest hover:text-[#0ABFBC] transition-colors flex items-center gap-1.5 group">
              View Detailed Fulfillment Report
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
}
