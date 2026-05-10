"use client";
import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Edit2, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ArrowRight,
  ShieldAlert,
  Power,
  Users,
  Store,
  Clock
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Mock Data ---

const EMPLOYEES = [
  {
    id: 1,
    name: "Ava Mitchell",
    email: "ava.mitchell@citycenter.com",
    post: "Dispensing Station",
    role: "Lead Pharmacist",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava"
  },
  {
    id: 2,
    name: "Omar Rahman",
    email: "omar.r@greenleafrx.com",
    post: "Inventory Mgmt",
    role: "Pharmacist",
    status: "Pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar"
  },
  {
    id: 3,
    name: "Claire Lin",
    email: "claire.lin@metropharmacy.co",
    post: "Front Desk",
    role: "Pharmacist",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claire"
  },
  {
    id: 4,
    name: "Nikhil Shah",
    email: "nikhil.shah@evercare.com",
    post: "Quality Control",
    role: "Pharmacist",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikhil"
  }
];

// --- Sub-components ---

const SummaryCard = ({ icon: Icon, label, value, colorClass }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 flex-1 min-w-[200px]">
    <div className={cn("p-4 rounded-xl", colorClass)}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

const EmployeeRow = ({ employee }: any) => (
  <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
    <td className="py-5 pl-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
          <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="font-bold text-slate-800">{employee.name}</p>
          <p className="text-xs text-slate-400 font-medium">{employee.email}</p>
        </div>
      </div>
    </td>
    <td className="py-5">
      <div className="flex items-center gap-2 text-slate-700">
        <MapPin size={14} className="text-teal-500" />
        <p className="font-bold">{employee.post}</p>
      </div>
    </td>
    <td className="py-5">
      <p className="font-semibold text-slate-600 text-sm">{employee.role}</p>
    </td>
    <td className="py-5 text-center">
      <span className={cn(
        "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
        employee.status === "Active" 
          ? "bg-teal-50 text-teal-600 border border-teal-100" 
          : "bg-orange-50 text-orange-600 border border-orange-100"
      )}>
        {employee.status}
      </span>
    </td>
    <td className="py-5 pr-4 text-right">
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all">
          <Edit2 size={16} />
        </button>
        <button className="p-2 h-9 w-9 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

const InputField = ({ label, placeholder, type = "text", fullWidth = false }: any) => (
  <div className={cn("space-y-1.5", fullWidth ? "w-full" : "flex-1")}>
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
    />
  </div>
);

const SelectField = ({ label, options, placeholder }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">{label}</label>
    <div className="relative">
      <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none text-slate-800">
        <option value="" disabled selected>{placeholder}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
    </div>
  </div>
);

// --- Main Page Component ---

export default function PersonnelManagement() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#004d4d] tracking-tight">Pharmacy Admin Oversight</h1>
          <p className="text-slate-500 font-medium">Add and remove employees, and manage pharmacy operations globally.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          icon={Users} 
          label="Total Employees" 
          value="184" 
          colorClass="bg-teal-50 text-teal-600"
        />
        <SummaryCard 
          icon={Store} 
          label="Active Stations" 
          value="12" 
          colorClass="bg-teal-50 text-teal-600"
        />
        <SummaryCard 
          icon={Clock} 
          label="Pending Staff Requests" 
          value="3" 
          colorClass="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Employee Directory */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Employee Directory</h3>
                <p className="text-sm text-slate-500 font-medium font-sans">Manage access for all partner pharmacists.</p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 hidden sm:table-header-group">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Assigned Post</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {EMPLOYEES.map(emp => (
                    <EmployeeRow key={emp.id} employee={emp} />
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-50 flex justify-center">
               <button className="text-teal-600 text-xs font-bold uppercase tracking-widest hover:text-teal-700 transition-colors flex items-center gap-1">
                 View All Employees <ArrowRight size={14} />
               </button>
            </div>
          </div>
        </div>

        {/* Right: Actions and Forms */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Add Employee Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Add New Employee</h3>
              <p className="text-sm text-slate-500 font-medium">Register a pharmacist and assign them.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <InputField label="First Name" placeholder="e.g. John" />
                <InputField label="Last Name" placeholder="e.g. Doe" />
              </div>
              <InputField label="Email Address" placeholder="john.doe@pharmacy.com" fullWidth />
              <SelectField 
                label="Assigned Post" 
                placeholder="Select a station..." 
                options={["Dispensing Station", "Inventory Mgmt", "Front Desk", "Quality Control"]} 
              />
              <div className="flex gap-4">
                <SelectField 
                  label="Role" 
                  placeholder="Select role" 
                  options={["Lead Pharmacist", "Pharmacist", "Support"]} 
                />
                <InputField label="License No." placeholder="Optional" />
              </div>
              <button className="w-full py-3.5 px-4 bg-[#004d4d] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/10 hover:bg-[#003d3d] transition-all transform hover:-translate-y-0.5 mt-2">
                Create Employee Account
              </button>
            </div>
          </div>

          {/* Pharmacy Operations */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Pharmacy Operations</h3>
              <p className="text-sm text-slate-500 font-medium">Execute system-level controls for your pharmacy.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
                    <Store size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Edit Pharmacy Details</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Update operational hours and info.</p>
                  </div>
                </div>
                <button className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Revoke Staff Access</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase font-sans">Force logout all 4 employees.</p>
                  </div>
                </div>
                <button className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Revoke</button>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
                    <Power size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Suspend Operations</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Temporarily hide from platform.</p>
                  </div>
                </div>
                <button className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Suspend</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
