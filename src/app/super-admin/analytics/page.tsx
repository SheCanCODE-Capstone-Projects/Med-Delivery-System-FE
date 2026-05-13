"use client";
import React from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Activity,
  Calendar
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total Revenue', value: 'RWF 12.8M', change: '+14.2%', isPositive: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Active Patients', value: '4,561', change: '+8.7%', isPositive: true, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Total Orders', value: '1,284', change: '-2.4%', isPositive: false, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Partner Pharmacies', value: '78', change: '+3', isPositive: true, icon: Building2, color: 'text-sky-600', bg: 'bg-sky-50' },
];

const REGIONAL_PERFORMANCE = [
  { region: 'Kigali', pharmacies: 32, sales: 'RWF 5.2M', growth: '+12%', color: 'bg-teal-500' },
  { region: 'Musanze', pharmacies: 18, sales: 'RWF 3.1M', growth: '+8%', color: 'bg-emerald-500' },
  { region: 'Huye', pharmacies: 14, sales: 'RWF 2.4M', growth: '-2%', color: 'bg-orange-500' },
  { region: 'Rubavu', pharmacies: 10, sales: 'RWF 1.6M', growth: '+5%', color: 'bg-sky-500' },
  { region: 'Kayonza', pharmacies: 4, sales: 'RWF 0.5M', growth: '+15%', color: 'bg-indigo-500' },
];

// ─── Components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, change, isPositive, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
    </div>
  );
}

// ─── Analytics Page ──────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <SuperAdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Analytics</h1>
          <p className="text-slate-500 mt-1">Deep dive into MedDelivery's performance and growth metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-teal-600 text-white shadow-sm">24h</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50">7d</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50">30d</button>
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50">All Time</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            <Calendar size={16} />
            Custom Range
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Growth visualization (Mock) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-teal-600" />
              Order Volume Growth
            </h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+24% vs last month</span>
          </div>
          
          <div className="flex-1 flex items-end gap-3 px-2">
            {[45, 62, 58, 75, 90, 82, 95, 110, 105, 120, 135, 150].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-teal-500 rounded-t-lg transition-all duration-1000 hover:bg-teal-600 cursor-pointer relative group"
                  style={{ height: `${height * 2}px` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {height} orders
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Globe size={20} className="text-sky-600" />
            Regional Performance
          </h3>
          
          <div className="space-y-6 flex-1">
            {REGIONAL_PERFORMANCE.map((reg) => (
              <div key={reg.region}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">{reg.region}</span>
                    <span className="text-xs text-slate-400">{reg.pharmacies} pharmacies</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">{reg.sales}</span>
                    <span className={`text-[10px] font-bold ml-2 ${reg.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                      {reg.growth}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${reg.color} rounded-full`}
                    style={{ width: `${(parseInt(reg.sales.replace(/\D/g, '')) / 5.2) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Pulse */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Activity size={20} className="text-orange-600" />
          Real-time Platform Pulse
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Active Now</p>
            <p className="text-2xl font-bold text-slate-800">42</p>
            <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mt-1 block">● 2 mins ago</span>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Orders / Hour</p>
            <p className="text-2xl font-bold text-slate-800">18.5</p>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1 block">↑ Trending up</span>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-slate-800">99.2%</p>
            <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider mt-1 block">Excellent</span>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Avg Response</p>
            <p className="text-2xl font-bold text-slate-800">4.2s</p>
            <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-1 block">Normal</span>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
