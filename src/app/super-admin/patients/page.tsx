"use client";
import React, { useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  MoreVertical,
  Activity,
  UserCheck,
  UserPlus
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PATIENTS = [
  { 
    id: 'PAT-8291', 
    name: 'Jean Claude Uwimana', 
    email: 'j.uwimana@email.com', 
    phone: '+250 788 000 111',
    region: 'Kigali', 
    orders: 24, 
    status: 'Active',
    lastActive: '2 hours ago',
    joined: 'Jan 2024'
  },
  { 
    id: 'PAT-8290', 
    name: 'Marie Claire Mukamanzi', 
    email: 'm.claire@email.com', 
    phone: '+250 788 222 333',
    region: 'Musanze', 
    orders: 15, 
    status: 'Active',
    lastActive: '1 day ago',
    joined: 'Feb 2024'
  },
  { 
    id: 'PAT-8289', 
    name: 'Emmanuel Rugero', 
    email: 'emmanuel.r@email.com', 
    phone: '+250 788 444 555',
    region: 'Huye', 
    orders: 8, 
    status: 'Inactive',
    lastActive: '2 weeks ago',
    joined: 'Mar 2024'
  },
  { 
    id: 'PAT-8288', 
    name: 'Divine Ishimwe', 
    email: 'divine.i@email.com', 
    phone: '+250 788 666 777',
    region: 'Rubavu', 
    orders: 31, 
    status: 'Active',
    lastActive: '5 mins ago',
    joined: 'Apr 2024'
  },
  { 
    id: 'PAT-8287', 
    name: 'Patrick Niyomugabo', 
    email: 'patrick.n@email.com', 
    phone: '+250 788 888 999',
    region: 'Kayonza', 
    orders: 12, 
    status: 'Active',
    lastActive: '12 hours ago',
    joined: 'May 2024'
  },
];

// ─── Components ─────────────────────────────────────────────────────────────

function PatientStat({ label, value, icon: Icon, color }: any) {
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

// ─── Patients Page ─────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients & Customers</h1>
          <p className="text-slate-500 mt-1">Directory of all registered users on the MedDelivery platform.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            <Download size={18} />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition shadow-md shadow-teal-600/20">
            <UserPlus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PatientStat label="Total Patients" value="4,561" icon={Users} color="text-teal-600" />
        <PatientStat label="Active Patients" value="3,842" icon={UserCheck} color="text-emerald-600" />
        <PatientStat label="New Today" value="+12" icon={Activity} color="text-sky-600" />
        <PatientStat label="Avg. Orders/User" value="4.8" icon={Calendar} color="text-orange-600" />
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patients by name, ID, or email..."
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Contact Information</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4 text-center">Orders</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic text-sm">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition not-italic">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-500 text-xs">{patient.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{patient.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">Member since {patient.joined}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[13px]">
                        <Mail size={12} className="text-slate-400" />
                        {patient.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 text-[13px]">
                        <Phone size={12} className="text-slate-400" />
                        {patient.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      {patient.region}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="font-bold text-slate-700">{patient.orders}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        patient.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {patient.status}
                      </span>
                      <span className="text-[10px] text-slate-400">Activity: {patient.lastActive}</span>
                    </div>
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
        
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/30">
          <span>Page 1 of 456 (Showing 10 results per page)</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 transition">Next</button>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
