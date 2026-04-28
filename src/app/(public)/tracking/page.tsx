import React from 'react';

export default function TrackingPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Track Your Delivery</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p className="text-slate-600">No active tracking sessions found.</p>
      </div>
    </div>
  );
}
