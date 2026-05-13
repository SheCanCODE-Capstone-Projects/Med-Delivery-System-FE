"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Building2, 
  Calendar, 
  ArrowLeft,
  Loader2,
  Trash2,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function AdminDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const storedAdmins = localStorage.getItem('admin_directory');
        if (storedAdmins) {
          const admins = JSON.parse(storedAdmins);
          const found = admins.find((a: any) => a.id === id);
          if (found) {
            setAdmin({
              ...found,
              phone: '+250 788 123 456',
              address: 'Kigali Heights, 4th Floor',
              lastActive: '2 hours ago',
              bio: 'Experienced regional administrator focused on optimizing pharmaceutical supply chains across Rwanda.'
            });
          }
        }
      } catch (error) {
        console.error("Error fetching admin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this admin account?')) {
      const storedAdmins = localStorage.getItem('admin_directory');
      if (storedAdmins) {
        const admins = JSON.parse(storedAdmins);
        const updated = admins.filter((a: any) => a.id !== id);
        localStorage.setItem('admin_directory', JSON.stringify(updated));
        router.push('/super-admin/admins');
      }
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex flex-col items-center justify-center p-24">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading administrator profile...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!admin) {
    return (
      <SuperAdminLayout>
        <div className="text-center p-24 bg-white rounded-3xl border border-slate-100 shadow-sm mx-auto max-w-lg">
          <ShieldCheck className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Admin Not Found</h2>
          <p className="text-slate-500 mt-2">The administrator you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.push('/super-admin/admins')}
            className="mt-6 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
          >
            Back to Directory
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Admins
        </button>
        
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-teal-600 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-teal-600/30 border-4 border-white">
              {admin.name.split(' ').map((n: any) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{admin.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  admin.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {admin.status}
                </span>
              </div>
              <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-600" />
                Regional Administrator • {admin.id}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm">
                Message Admin
             </button>
             <button 
               onClick={handleDelete}
               className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition shadow-sm"
             >
                <Trash2 size={18} />
                Terminate Access
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Profile Overview</h3>
              <Clock size={16} className="text-slate-400" />
            </div>
            <div className="p-8 space-y-8">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About Administrator</p>
                <p className="text-slate-600 leading-relaxed font-semibold">
                  {admin.bio}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                        <p className="font-bold text-slate-800 mt-1">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Assigned Region</p>
                        <p className="font-bold text-slate-800 mt-1">{admin.region} Province</p>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Registration Date</p>
                        <p className="font-bold text-slate-800 mt-1">{admin.joinedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                        <p className="font-bold text-emerald-600 mt-1 uppercase text-xs">{admin.lastActive}</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group border border-slate-800">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h4 className="font-black text-xl mb-2 italic">Regional Performance Snapshot</h4>
                <p className="text-slate-400 text-sm font-medium">Monitoring {admin.managedPharmacy} in {admin.region}.</p>
              </div>
              <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition backdrop-blur-md border border-white/10">
                <ExternalLink size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Active', value: 'Yes', color: 'text-emerald-400' },
                { label: 'Pending', value: '0', color: 'text-amber-400' },
                { label: 'Compliance', value: '100%', color: 'text-teal-400' }
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{stat.label}</p>
                  <p className={`text-xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center">
              <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-50 pb-4">Managed Pharmacy</h4>
              <div className="flex flex-col items-center justify-center py-4">
                 <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-orange-400 mb-4 border border-orange-100">
                    <Building2 size={32} />
                 </div>
                 <p className="font-bold text-slate-800 italic">"{admin.managedPharmacy}"</p>
                 <button className="mt-6 w-full py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition tracking-widest">
                    View Pharmacy Profile
                 </button>
              </div>
           </div>

           <div className="bg-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-teal-600/30 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-black uppercase tracking-widest text-[10px] mb-4 opacity-70">Security Status</h4>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/20 rounded-lg">
                      <ShieldCheck size={20} />
                   </div>
                   <p className="font-bold">Verified Access</p>
                </div>
                <button className="mt-6 w-full py-2 bg-white text-teal-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-50 transition">
                  Audit logs
                </button>
              </div>
              <ShieldCheck size={120} className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
           </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
