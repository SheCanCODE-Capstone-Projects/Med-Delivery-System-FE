"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Trash2,
  Check,
  Loader2,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { getWorkingPharmacies } from '@/services/api';

export default function PharmacyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        const pharmacies = await getWorkingPharmacies();
        const found = pharmacies.find(p => p.id.replace('#', '') === id);
        
        // Simulating detailed data
        if (found) {
          const cachedData = localStorage.getItem('pharmacy_cache');
          const cache = cachedData ? JSON.parse(cachedData) : {};
          const statusOverride = cache[found.id]?.status;

          setPharmacy({
            ...found,
            status: statusOverride || found.status,
            email: `${found.name.toLowerCase().replace(' ', '')}@meddelivery.rw`,
            phone: '+250 788 000 000',
            address: 'KG 123 St, Kigali, Rwanda',
            pharmacistName: 'Dr. Jean Bosco',
            licenseNumber: 'MD-RX-2024-991',
            region: 'Kigali City',
            description: 'A licensed pharmacy providing quality healthcare services and authentic medications to the local community.'
          });
        }
      } catch (error) {
        console.error("Error fetching pharmacy:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacy();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Cache the change
    const cachedData = localStorage.getItem('pharmacy_cache');
    const cache = cachedData ? JSON.parse(cachedData) : {};
    cache[pharmacy.id] = { ...cache[pharmacy.id], status: 'Confirmed' };
    localStorage.setItem('pharmacy_cache', JSON.stringify(cache));

    setPharmacy(prev => ({ ...prev, status: 'Confirmed' }));
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this pharmacy? This action cannot be undone.')) {
      setActionLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Cache the deletion
      const cachedData = localStorage.getItem('pharmacy_cache');
      const cache = cachedData ? JSON.parse(cachedData) : {};
      cache[pharmacy.id] = { ...cache[pharmacy.id], deleted: true };
      localStorage.setItem('pharmacy_cache', JSON.stringify(cache));

      setActionLoading(false);
      router.push('/super-admin/pharmacies');
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center p-24">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500">Loading pharmacy details...</p>
        </div>
      </>
    );
  }

  if (!pharmacy) {
    return (
      <>
        <div className="text-center p-24">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Pharmacy Not Found</h2>
          <button 
            onClick={() => router.push('/super-admin/pharmacies')}
            className="mt-4 text-teal-600 font-bold hover:underline"
          >
            Back to Pharmacies
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium mb-4"
        >
          <ArrowLeft size={16} />
          Back to Directory
        </button>
        
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border-2 border-teal-100 shadow-sm">
              <Building2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{pharmacy.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  pharmacy.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  pharmacy.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {pharmacy.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium">Pharmacy ID: {pharmacy.id}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {pharmacy.status !== 'Confirmed' ? (
              <button 
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Approve Pharmacy
              </button>
            ) : (
              <button 
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Delete Pharmacy
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 text-[14px] font-bold text-slate-800">
              Registration Information
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">License Number</p>
                    <p className="font-semibold text-slate-700">{pharmacy.licenseNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Managing Pharmacist</p>
                    <p className="font-semibold text-slate-700">{pharmacy.pharmacistName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Registration Date</p>
                    <p className="font-semibold text-slate-700">{pharmacy.time}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Operating Region</p>
                    <p className="font-semibold text-slate-700">{pharmacy.region}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Registration Status</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {pharmacy.status === 'Confirmed' ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <Clock size={16} className="text-amber-500" />
                      )}
                      <p className="text-sm font-bold text-slate-700">{pharmacy.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50/30 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">About Pharmacy</p>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{pharmacy.description}"
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Compliance History</p>
                <p className="text-xs text-slate-500">This pharmacy has no reported compliance violations.</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition">View Logs</button>
          </div>
        </div>

        {/* Right Column: Contact & Location */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 text-[14px] font-bold text-slate-800">
              Contact Details
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase leading-none">Email Address</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{pharmacy.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase leading-none">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{pharmacy.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase leading-none">Main Location</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{pharmacy.address}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-center">
               <button className="text-[13px] font-bold text-teal-600 hover:underline">Download Documentation (PDF)</button>
            </div>
          </div>

          <div className="p-6 bg-teal-600 rounded-2xl shadow-lg shadow-teal-600/20 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-1">Stock Overview</h4>
              <p className="text-xs text-white/70 mb-4">Total products currently in inventory</p>
              <p className="text-3xl font-black">482</p>
            </div>
            <div className="absolute -bottom-6 -right-6 opacity-20">
               <Building2 size={120} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
