"use client";
import React, { useEffect, useState } from 'react';
import { getWorkingPharmacies } from '@/services/api';

export default function SuperAdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const data = await getWorkingPharmacies();
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Platform Pharmacies</h1>
        <p className="text-slate-500 mb-8">View and manage all registered pharmacies on MedDelivery.</p>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 border-b border-slate-200">ID</th>
                    <th className="px-6 py-4 border-b border-slate-200">Pharmacy Name</th>
                    <th className="px-6 py-4 border-b border-slate-200">Registered</th>
                    <th className="px-6 py-4 border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pharmacies.length > 0 ? (
                    pharmacies.map((pharmacy) => (
                      <tr key={pharmacy.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{pharmacy.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{pharmacy.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{pharmacy.time}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            pharmacy.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                            pharmacy.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {pharmacy.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No pharmacies found on the platform.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
