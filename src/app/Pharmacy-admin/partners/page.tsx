"use client";
import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Edit2, 
  ExternalLink,
  Handshake,
  Building2,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Mock Data ---

const PARTNERS = [
  {
    id: 1,
    name: "Kigali Central Pharmacy",
    code: "KCP-001",
    location: "Kigali, Rwanda",
    status: "Active",
    joinedDate: "Feb 2024",
    email: "contact@kigalipharmacy.rw",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=KC"
  },
  {
    id: 2,
    name: "Healing Hands Rx",
    code: "HHR-042",
    location: "Gisenyi, Rwanda",
    status: "Pending",
    joinedDate: "May 2024",
    email: "office@healinghands.com",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=HH"
  },
  {
    id: 3,
    name: "Metro Wellness Center",
    code: "MWC-009",
    location: "Butare, Rwanda",
    status: "Active",
    joinedDate: "Jan 2024",
    email: "info@metrowellness.rw",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=MW"
  },
  {
    id: 4,
    name: "Sunlight Pharmaceuticals",
    code: "SP-112",
    location: "Kigali, Rwanda",
    status: "Active",
    joinedDate: "Mar 2024",
    email: "support@sunlight.rw",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=SP"
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

const PartnerRow = ({ partner }: any) => (
  <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
    <td className="py-5 pl-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 p-1 flex items-center justify-center">
          <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-slate-800">{partner.name}</p>
          <p className="text-xs text-slate-400 font-medium">{partner.email}</p>
        </div>
      </div>
    </td>
    <td className="py-5">
      <div className="flex items-center gap-2 text-slate-700">
        <Building2 size={14} className="text-[#0ABFBC]" />
        <p className="font-bold text-sm tracking-tight">{partner.code}</p>
      </div>
    </td>
    <td className="py-5">
      <div className="flex items-center gap-2 text-slate-600">
        <MapPin size={14} className="text-slate-400" />
        <p className="text-sm font-medium">{partner.location}</p>
      </div>
    </td>
    <td className="py-5 text-center">
      <span className={cn(
        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        partner.status === "Active" 
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
          : "bg-amber-50 text-amber-600 border border-amber-100"
      )}>
        {partner.status}
      </span>
    </td>
    <td className="py-5 pr-4 text-right">
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all">
          <Edit2 size={16} />
        </button>
        <button className="p-2 h-9 w-9 flex items-center justify-center rounded-lg text-[#0ABFBC] hover:bg-[rgba(10,191,188,0.05)] transition-all">
          <ExternalLink size={16} />
        </button>
      </div>
    </td>
  </tr>
);

export default function PharmacyPartnersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#004d4d] tracking-tight">Pharmacy Partners</h1>
          <p className="text-slate-500 font-medium">Manage and monitor all pharmacy partnerships on the platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#0ABFBC] text-[#040F1A] px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#5EDEDD] transition-all shadow-lg shadow-teal-900/10">
          <Plus size={18} />
          <span>Invite New Partner</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          icon={Handshake} 
          label="Total Partners" 
          value="42" 
          colorClass="bg-[rgba(10,191,188,0.05)] text-[#0ABFBC]"
        />
        <SummaryCard 
          icon={CheckCircle2} 
          label="Active Integrations" 
          value="38" 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard 
          icon={Clock} 
          label="Pending Applications" 
          value="4" 
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Partner Directory</h3>
            <p className="text-sm text-slate-500 font-medium">Verified pharmacies delivering via MedDelivery.</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, code or city..."
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pharmacy</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PARTNERS.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase()) || 
                p.code.toLowerCase().includes(search.toLowerCase()) ||
                p.location.toLowerCase().includes(search.toLowerCase())
              ).map(partner => (
                <PartnerRow key={partner.id} partner={partner} />
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-slate-50 flex justify-between items-center">
          <p className="text-xs text-slate-400 font-medium">Showing 4 of 42 results</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
