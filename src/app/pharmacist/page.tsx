"use client";
import React, { useEffect, useState } from 'react';
import PharmacistLayout from '@/components/layout/PharmacistLayout';
import { getPharmacistMetrics, getPharmacistOrders } from '@/services/api';

export default function PharmacistDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Confirm & process');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, ordersData] = await Promise.all([
          getPharmacistMetrics(),
          getPharmacistOrders(),
        ]);
        setMetrics(metricsData);
        setOrders(ordersData);
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
      <>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a4843]"></div>
        </div>
      </>
    );
  }

  const tabs = [
    { name: 'Confirm & process', count: 4, desc: 'Need processing', color: 'bg-[#0a4843]' },
    { name: 'Undergo', count: 3, desc: 'Undergoing', color: 'bg-transparent' },
    { name: 'Completed', count: 28, desc: 'Completed', color: 'bg-transparent' },
    { name: 'Rejected', count: 2, desc: 'Rejected', color: 'bg-transparent' },
  ];

  return (
    <>
      {/* Metric Cards Top */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-start relative overflow-hidden h-28">
          <div className="absolute top-0 left-6 w-8 h-1 bg-emerald-500 rounded-b-sm"></div>
          <div className="text-[32px] font-bold text-slate-800 leading-tight mt-1">{metrics.newOrders}</div>
          <div className="text-sm text-slate-500 font-medium">New orders today</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-start relative overflow-hidden h-28">
          <div className="absolute top-0 left-6 w-8 h-1 bg-amber-500 rounded-b-sm"></div>
          <div className="text-[32px] font-bold text-slate-800 leading-tight mt-1">{metrics.pendingPrescriptions}</div>
          <div className="text-sm text-slate-500 font-medium">Pending prescriptions</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-start relative overflow-hidden h-28">
           <div className="absolute top-0 left-6 w-8 h-1 bg-blue-500 rounded-b-sm"></div>
          <div className="text-[32px] font-bold text-slate-800 leading-tight mt-1">{metrics.readyToShip}</div>
          <div className="text-sm text-slate-500 font-medium">Ready to ship</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-start relative overflow-hidden h-28">
           <div className="absolute top-0 left-6 w-8 h-1 bg-red-500 rounded-b-sm"></div>
          <div className="text-[32px] font-bold text-slate-800 leading-tight mt-1">{metrics.lowStockItems}</div>
          <div className="text-sm text-slate-500 font-medium">Low stock items</div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-sm font-bold tracking-widest text-slate-600 uppercase">ORDERS MANAGEMENT</h2>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 pt-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-16 items-start">
            <div className="text-[#0a4843] font-bold text-xl">MedDelivery</div>
            <div>
              <div className="font-bold text-slate-800">Orders</div>
              <div className="text-sm text-slate-500">City Pharmacy, Kigali</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">3 urgent</span>
             <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">AK</div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-8">
          {tabs.map((tab) => (
             <div 
               key={tab.name}
               onClick={() => setActiveTab(tab.name)}
               className={`pb-4 cursor-pointer relative min-w-[120px] ${
                 activeTab === tab.name ? 'text-[#0a4843]' : 'text-slate-500 hover:text-slate-800'
               }`}
             >
               <div className="flex items-center gap-3 mb-4">
                  <span className={`font-semibold text-[15px] ${activeTab === tab.name && 'font-bold'}`}>{tab.name}</span>
                  <span className={`text-xs font-bold ${activeTab === tab.name ? 'bg-orange-100 text-amber-700' : 'text-slate-400'} px-2 py-0.5 rounded`}>
                    {tab.count}
                  </span>
               </div>
               
               <div className="mb-2">
                 <div className={`text-2xl font-bold ${activeTab === tab.name || tab.name === 'Rejected' ? 'text-slate-800' : 'text-slate-800'}`}>
                   {tab.count}
                 </div>
                 <div className="text-xs font-medium text-slate-500">{tab.desc}</div>
               </div>

               {activeTab === tab.name && (
                 <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0a4843] rounded-t-sm"></div>
               )}
             </div>
          ))}
        </div>

        {/* Filter / Export Actions */}
        <div className="flex justify-between items-center mb-6">
           <div className="text-sm text-slate-400 w-80 truncate">Search by patient name or order ID...</div>
           <div className="flex gap-4 text-sm font-semibold text-slate-600">
             <button className="hover:text-slate-800 transition">Filter</button>
             <button className="hover:text-slate-800 transition">Export</button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-800 border-b border-slate-100">
                <th className="pb-4 font-bold">Order ID</th>
                <th className="pb-4 font-bold">Patient</th>
                <th className="pb-4 font-bold">Medication</th>
                <th className="pb-4 font-bold">Time</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="py-5 font-semibold text-slate-800">{order.id}</td>
                  <td className="py-5 text-slate-600">{order.patient}</td>
                  <td className="py-5 text-slate-600">{order.medication}</td>
                  <td className="py-5 text-slate-500 font-medium">{order.time}</td>
                  <td className="py-5">
                    {order.status === 'New' && <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded">New</span>}
                    {order.status === 'Undergo' && <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[11px] font-bold rounded">Undergo</span>}
                    {order.status === 'Processing' && <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[11px] font-bold rounded">Processing</span>}
                    {order.status === 'Completed' && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded">Completed</span>}
                    {order.status === 'Rejected' && <span className="px-3 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded">Rejected</span>}
                  </td>
                  <td className="py-5">
                    {order.action === 'Confirm' && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded hover:bg-emerald-100 transition">Confirm</button>
                        <button className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded hover:bg-red-100 transition">Reject</button>
                      </div>
                    )}
                    {order.action === 'View' && (
                       <button className="px-3 py-1 border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-50 transition">View</button>
                    )}
                    {order.action === 'Complete' && (
                       <button className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded hover:bg-emerald-100 transition">Complete</button>
                    )}
                    {order.action === 'Done' && (
                       <span className="text-slate-500 text-xs font-bold">Done</span>
                    )}
                    {order.action === 'Invalid Rx' && (
                       <span className="text-red-500 text-xs font-bold">Invalid Rx</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
