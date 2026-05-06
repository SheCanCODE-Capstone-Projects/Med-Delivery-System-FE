"use client";
import React, { useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import {
  Package,
  Building2,
  Users,
  ShieldCheck,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_METRICS = {
  totalOrders: 1_284,
  ordersChange: +12.4,
  totalPharmacies: 78,
  pharmaciesChange: +3,
  totalPatients: 4_561,
  patientsChange: +8.7,
  activeAdmins: 14,
  adminsChange: -1,
  pendingApprovals: 11,
  revenueThisMonth: 'RWF 6.2M',
};

const MOCK_PHARMACIES = [
  { id: '#SA-1024', name: 'KiPharma Ltd', region: 'Kigali', registeredDate: 'Apr 28, 09:15 AM', status: 'Active', admin: 'Alice R.' },
  { id: '#SA-1023', name: 'Sana Pharmacy', region: 'Musanze', registeredDate: 'Apr 28, 08:42 AM', status: 'Pending', admin: 'Bob M.' },
  { id: '#SA-1022', name: 'Viva Pharmacy', region: 'Kigali', registeredDate: 'Apr 27, 08:30 AM', status: 'Under Review', admin: 'Alice R.' },
  { id: '#SA-1021', name: 'HealthPlus Clinic', region: 'Huye', registeredDate: 'Apr 27, 08:15 AM', status: 'Active', admin: 'Carol K.' },
  { id: '#SA-1020', name: 'MediCare Rwanda', region: 'Rubavu', registeredDate: 'Apr 26, 02:00 PM', status: 'Suspended', admin: 'Carol K.' },
  { id: '#SA-1019', name: 'PharmaCare', region: 'Kigali', registeredDate: 'Apr 26, 11:20 AM', status: 'Active', admin: 'Bob M.' },
];

const MOCK_RECENT_ADMINS = [
  { id: 'ADM-007', name: 'Alice Rugamba', email: 'alice@meddelivery.rw', region: 'Kigali', pharmaciesManaged: 12, status: 'Active' },
  { id: 'ADM-006', name: 'Bob Mutangana', email: 'bob@meddelivery.rw', region: 'Musanze', pharmaciesManaged: 8, status: 'Active' },
  { id: 'ADM-005', name: 'Carol Kamanzi', email: 'carol@meddelivery.rw', region: 'Huye', pharmaciesManaged: 6, status: 'Inactive' },
  { id: 'ADM-004', name: 'David Ndayishimiye', email: 'david@meddelivery.rw', region: 'Rubavu', pharmaciesManaged: 9, status: 'Active' },
];

const MOCK_ACTIVITY = [
  { time: '09:42 AM', event: 'Pharmacy "KiPharma Ltd" approved by Alice R.', type: 'success' },
  { time: '09:15 AM', event: 'New pharmacy registration: "Sana Pharmacy" pending review', type: 'warning' },
  { time: '08:50 AM', event: 'Admin "David N." added to Rubavu region', type: 'info' },
  { time: '08:30 AM', event: 'Pharmacy "MediCare Rwanda" suspended — compliance issue', type: 'error' },
  { time: '08:00 AM', event: '11 new patient registrations across all regions', type: 'info' },
  { time: 'Yesterday', event: 'Monthly report generated for April 2026', type: 'success' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
    'Under Review': 'bg-sky-50 text-sky-700',
    Suspended: 'bg-red-50 text-red-700',
    Inactive: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg,
  iconColor,
  subtitle,
}: {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <span className="text-[14px] font-semibold text-slate-500">{label}</span>
        <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <div className="text-[38px] font-bold text-slate-800 leading-none">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isPositive ? '+' : ''}{change}% this month</span>
          </div>
        )}
        {subtitle && <span className="text-xs text-amber-500 font-semibold mt-1 block">{subtitle}</span>}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const [pharmacyFilter, setPharmacyFilter] = useState<string>('All');

  const filteredPharmacies =
    pharmacyFilter === 'All'
      ? MOCK_PHARMACIES
      : MOCK_PHARMACIES.filter((p) => p.status === pharmacyFilter);

  const activityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />;
      case 'warning': return <Clock size={15} className="text-amber-500 shrink-0 mt-0.5" />;
      case 'error': return <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />;
      default: return <Activity size={15} className="text-sky-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <SuperAdminLayout>
      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <MetricCard
          label="Total Orders"
          value={MOCK_METRICS.totalOrders.toLocaleString()}
          change={MOCK_METRICS.ordersChange}
          icon={Package}
          iconBg="bg-orange-50"
          iconColor="text-orange-400"
        />
        <MetricCard
          label="Pharmacies"
          value={MOCK_METRICS.totalPharmacies}
          change={MOCK_METRICS.pharmaciesChange}
          icon={Building2}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <MetricCard
          label="Total Patients"
          value={MOCK_METRICS.totalPatients.toLocaleString()}
          change={MOCK_METRICS.patientsChange}
          icon={Users}
          iconBg="bg-teal-50"
          iconColor="text-teal-500"
        />
        <MetricCard
          label="Active Admins"
          value={MOCK_METRICS.activeAdmins}
          change={MOCK_METRICS.adminsChange}
          icon={ShieldCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />
        <MetricCard
          label="Pending Approvals"
          value={MOCK_METRICS.pendingApprovals}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          subtitle="Requires attention"
        />
        <MetricCard
          label="Revenue (Month)"
          value={MOCK_METRICS.revenueThisMonth}
          icon={TrendingUp}
          iconBg="bg-sky-50"
          iconColor="text-sky-500"
        />
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Pharmacies Table (2/3) ── */}
        <div className="xl:col-span-2 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
            <h2 className="text-base font-bold text-slate-800">Registered Pharmacies</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {['All', 'Active', 'Pending', 'Under Review', 'Suspended'].map((f) => (
                <button
                  key={f}
                  onClick={() => setPharmacyFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    pharmacyFilter === f
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition">
                <Filter size={13} /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafb] text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Pharmacy</th>
                  <th className="px-5 py-3.5">Region</th>
                  <th className="px-5 py-3.5">Admin</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-semibold text-slate-700 text-xs">{pharmacy.id}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{pharmacy.name}</td>
                    <td className="px-5 py-4 text-slate-500">{pharmacy.region}</td>
                    <td className="px-5 py-4 text-slate-500">{pharmacy.admin}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{pharmacy.registeredDate}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={pharmacy.status} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      {pharmacy.status === 'Pending' || pharmacy.status === 'Under Review' ? (
                        <button className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded hover:bg-teal-700 transition shadow-sm">
                          Review
                        </button>
                      ) : pharmacy.status === 'Suspended' ? (
                        <button className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded hover:bg-red-50 transition">
                          Reinstate
                        </button>
                      ) : (
                        <button className="px-3 py-1.5 text-teal-600 text-xs font-bold hover:text-teal-800 transition">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-6">

          {/* ── Admins Panel ── */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800">Regional Admins</h2>
              <button className="text-xs text-teal-600 font-semibold hover:text-teal-800 transition">View all</button>
            </div>
            <ul className="divide-y divide-slate-100">
              {MOCK_RECENT_ADMINS.map((admin) => (
                <li key={admin.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">
                    {admin.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{admin.name}</p>
                    <p className="text-xs text-slate-400 truncate">{admin.region} · {admin.pharmaciesManaged} pharmacies</p>
                  </div>
                  <StatusBadge status={admin.status} />
                </li>
              ))}
            </ul>
          </div>

          {/* ── Activity Feed ── */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Recent Activity</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {MOCK_ACTIVITY.map((item, i) => (
                <li key={i} className="flex gap-3 px-5 py-3.5">
                  {activityIcon(item.type)}
                  <div className="flex-1">
                    <p className="text-xs text-slate-700 leading-snug">{item.event}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </SuperAdminLayout>
  );
}
