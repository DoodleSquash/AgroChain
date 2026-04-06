import React from 'react';

export default function Payments() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments & Earnings</h1>
      <p className="text-gray-500 mb-8">Detailed breakdown of your escrow settlements and transaction history.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary-600 p-6 rounded-3xl text-white">
          <div className="text-primary-100 text-sm font-medium mb-1">Total Released</div>
          <div className="text-3xl font-bold">₹1,24,500</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-sm font-medium mb-1">Pending Escrow</div>
          <div className="text-3xl font-bold text-gray-900">₹45,200</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-sm font-medium mb-1">Next Payout</div>
          <div className="text-3xl font-bold text-gray-900">12 Apr 2026</div>
        </div>
      </div>
    </div>
  );
}
