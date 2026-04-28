"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { getAdminMetrics, getWorkingPharmacies } from '@/services/api';
import { Package, CheckSquare, ShieldCheck, Box, Filter } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, pharmaciesData] = await Promise.all([
          getAdminMetrics(),
          getWorkingPharmacies(),
        ]);
        setMetrics(metricsData);
        setPharmacies(pharmaciesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !metrics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[15px] font-semibold text-slate-500">overall Orders</span>
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-400 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
          <div className="text-[40px] font-bold text-slate-800 leading-none">{metrics.overallOrders}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[15px] font-semibold text-slate-500">Orders to Review</span>
             <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[40px] font-bold text-slate-800 leading-none">{metrics.ordersToReview}</span>
            <span className="text-xs text-slate-400 mt-2">Requires attention</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[15px] font-semibold text-slate-500">pharmacies in kigali</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="text-[40px] font-bold text-slate-800 leading-none">{metrics.pharmaciesInKigali}</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[15px] font-semibold text-slate-500">patients</span>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
              <Box size={20} />
            </div>
          </div>
          <div className="text-[40px] font-bold text-slate-800 leading-none">{metrics.patients}</div>
        </div>
      </div>

      {/* Working Pharmacies Table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">working pharmacies</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
            <Filter size={16} /> Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafb] text-xs font-semibold text-slate-500 tracking-wide uppercase">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Pharmacy Name</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pharmacies && pharmacies.map((pharmacy) => (
                <tr key={pharmacy.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-5 font-semibold text-slate-800">{pharmacy.id}</td>
                  <td className="px-6 py-5 font-semibold text-slate-700">{pharmacy.name}</td>
                  <td className="px-6 py-5 text-slate-500">{pharmacy.time}</td>
                  <td className="px-6 py-5">
                    {pharmacy.status === 'Pending' && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full">
                        Pending
                      </span>
                    )}
                    {pharmacy.status === 'Reviewing' && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                        Reviewing
                      </span>
                    )}
                    {pharmacy.status === 'Confirmed' && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                        Confirmed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {pharmacy.action === 'Review' && (
                      <button className="px-4 py-1.5 bg-teal-800 text-white text-xs font-semibold rounded hover:bg-teal-900 transition">
                        Review
                      </button>
                    )}
                    {pharmacy.action === 'Continue' && (
                      <button className="px-4 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded hover:bg-slate-50 transition">
                        Continue
                      </button>
                    )}
                    {pharmacy.action === 'View' && (
                      <button className="px-4 py-1.5 text-teal-700 text-xs font-bold hover:text-teal-900 transition">
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
    </AdminLayout>
  );
}
