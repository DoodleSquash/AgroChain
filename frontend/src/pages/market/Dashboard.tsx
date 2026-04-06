import React from 'react';

export default function MarketDashboard() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Market Dashboard</h1>
      <p className="text-gray-500 mb-8">Spend analytics, active order tracking, and delivery updates.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-64 flex items-center justify-center text-gray-400">
          Analytics Chart Placeholder
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-64 flex items-center justify-center text-gray-400" >
          Recent Orders List Placeholder
        </div>
      </div>
    </div>
  );
}
