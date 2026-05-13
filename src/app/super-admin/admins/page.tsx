"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  MapPin, 
  Building2,
  UserPlus,
  Trash2,
  Eye,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ADMINS = [
  { 
    id: 'ADM-007', 
    name: 'Alice Rugamba', 
    email: 'alice@meddelivery.rw', 
    region: 'Kigali', 
    managedPharmacy: 'Kigali Main Pharmacy', 
    status: 'Active',
    joinedDate: 'Jan 12, 2024'
  },
  { 
    id: 'ADM-006', 
    name: 'Bob Mutangana', 
    email: 'bob@meddelivery.rw', 
    region: 'Musanze', 
    managedPharmacy: 'City Care Drugstore', 
    status: 'Active',
    joinedDate: 'Feb 05, 2024'
  },
  { 
    id: 'ADM-005', 
    name: 'Carol Kamanzi', 
    email: 'carol@meddelivery.rw', 
    region: 'Huye', 
    managedPharmacy: 'Hope Pharma Huye', 
    status: 'Inactive',
    joinedDate: 'Mar 20, 2024'
  },
  { 
    id: 'ADM-004', 
    name: 'David Ndayishimiye', 
    email: 'david@meddelivery.rw', 
    region: 'Rubavu', 
    managedPharmacy: 'Lakeside Medic', 
    status: 'Active',
    joinedDate: 'Apr 11, 2024'
  },
  { 
    id: 'ADM-003', 
    name: 'Eve Umutoni', 
    email: 'eve@meddelivery.rw', 
    region: 'Kayonza', 
    managedPharmacy: 'East-Point Pharmacy', 
    status: 'Active',
    joinedDate: 'May 02, 2024'
  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
}

// ─── Admins Page ─────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    region: 'Kigali',
    managedPharmacy: '',
  });

  // Load and apply persistence
  useEffect(() => {
    const storedAdmins = localStorage.getItem('admin_directory');
    if (storedAdmins) {
      setAdmins(JSON.parse(storedAdmins));
    } else {
      setAdmins(MOCK_ADMINS);
      localStorage.setItem('admin_directory', JSON.stringify(MOCK_ADMINS));
    }
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const id = `ADM-${Math.floor(100 + Math.random() * 900)}`;
    const adminToAdd = {
      ...newAdmin,
      id,
      status: 'Active', // Automatically approved when added by Super Admin
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    const updatedAdmins = [adminToAdd, ...admins];
    setAdmins(updatedAdmins);
    localStorage.setItem('admin_directory', JSON.stringify(updatedAdmins));

    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setShowAddModal(false);
      setNewAdmin({ name: '', email: '', region: 'Kigali', managedPharmacy: '' });
    }, 1500);
  };

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      const updatedAdmins = admins.filter(a => a.id !== id);
      setAdmins(updatedAdmins);
      localStorage.setItem('admin_directory', JSON.stringify(updatedAdmins));
      setActiveMenu(null);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SuperAdminLayout>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Regional Admins</h1>
          <p className="text-slate-500 mt-1">Manage and monitor administrators for different pharmacy regions.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition shadow-md shadow-teal-600/20"
        >
          <UserPlus size={18} />
          Add New Admin
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters and Search */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-slate-200 rounded-lg p-1">
              {['All', 'Active', 'Inactive'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                    statusFilter === f
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition bg-white">
              <Filter size={15} />
              More Filters
            </button>
          </div>
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafb] text-[11px] font-semibold text-slate-500 tracking-wide uppercase border-b border-slate-100">
                <th className="px-6 py-4">Admin Name</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Managed Pharmacy</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition group text-sm">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-sm border border-teal-100">
                          {admin.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{admin.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail size={12} className="text-slate-400" />
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {admin.region}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 flex-shrink-0">
                          <Building2 size={14} />
                        </div>
                        <span className="font-bold text-slate-700">{admin.managedPharmacy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={admin.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs italic">
                      {admin.joinedDate}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === admin.id ? null : admin.id)}
                        className={`p-2 rounded-lg transition ${activeMenu === admin.id ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenu === admin.id && (
                        <div className="absolute right-6 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            onClick={() => router.push(`/super-admin/admins/${admin.id}`)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition text-left"
                          >
                            <Eye size={16} className="text-teal-600" />
                            View Details
                          </button>
                          <button 
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition text-left border-t border-slate-50"
                          >
                            <Trash2 size={16} />
                            Delete Admin
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No admins found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/30">
          <span>Showing {filteredAdmins.length} of {admins.length} results</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 transition">Next</button>
          </div>
        </div>
      </div>

      {/* ── Add Admin Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">Register New Admin</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddAdmin} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="e.g. Jean Damascene"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="name@meddelivery.rw"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Assigned Region</label>
                <select 
                  value={newAdmin.region}
                  onChange={(e) => setNewAdmin({ ...newAdmin, region: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all bg-white"
                >
                  <option value="Kigali">Kigali</option>
                  <option value="Musanze">Musanze</option>
                  <option value="Huye">Huye</option>
                  <option value="Rubavu">Rubavu</option>
                  <option value="Kayonza">Kayonza</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Pharmacy to Manage</label>
                <input 
                  required
                  type="text" 
                  value={newAdmin.managedPharmacy}
                  onChange={(e) => setNewAdmin({ ...newAdmin, managedPharmacy: e.target.value })}
                  placeholder="e.g. Kigali Heights Pharmacy"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                {showSuccess ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm animate-in slide-in-from-bottom-2">
                    <CheckCircle2 size={18} />
                    Admin Registry Successful!
                  </div>
                ) : (
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    Create Admin Account
                  </button>
                )}
                <p className="text-[11px] text-slate-400 text-center px-4">
                  Registering an admin directly approves them for platform operations. All managed data will be visible to this user.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
