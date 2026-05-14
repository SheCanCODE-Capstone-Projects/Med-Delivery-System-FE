"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getWorkingPharmacies } from '@/services/api';
import { Building2, Loader2, AlertCircle } from 'lucide-react';

export default function SuperAdminPharmaciesPage() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        console.log("Fetching pharmacies...");
        let data = await getWorkingPharmacies();
        
        // Apply localStorage cache
        const cachedData = localStorage.getItem('pharmacy_cache');
        if (cachedData) {
          const cache = JSON.parse(cachedData);
          data = data.map(p => {
            if (cache[p.id]?.status) {
              return { ...p, status: cache[p.id].status };
            }
            return p;
          }).filter(p => !cache[p.id]?.deleted);
        }

        setPharmacies(data || []);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Platform Pharmacies</h1>
        <p className="text-slate-500 mt-1">View and manage all registered pharmacies on MedDelivery.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading pharmacies data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h2 className="font-bold text-slate-800">Pharmacy Directory</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {pharmacies.length} Total Registered
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Pharmacy Name</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pharmacies.length > 0 ? (
                  pharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{pharmacy.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{pharmacy.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{pharmacy.time}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          pharmacy.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          pharmacy.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {pharmacy.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => router.push(`/super-admin/pharmacies/${pharmacy.id.replace('#', '')}`)}
                          className="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <AlertCircle size={32} />
                        <p className="font-medium">No pharmacies found on the platform.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
            <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition">
              Load More Pharmacies
            </button>
          </div>
        </div>
      )}
    </>
  );
}
