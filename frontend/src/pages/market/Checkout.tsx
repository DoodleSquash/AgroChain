import React from 'react';

export default function Checkout() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-lg">Purchase Order</h3>
            <p className="text-sm text-gray-500">Secured via AgroChain Escrow</p>
          </div>
          <div className="text-2xl font-extrabold text-primary-600">₹1,24,500</div>
        </div>
        
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-primary-50 text-primary-700 rounded-2xl border border-primary-100 italic text-sm">
                <span>🛡️</span>
                <span>Funds will be held in escrow and released only upon verified pickup and delivery.</span>
            </div>
        </div>

        <button className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
          Pay & Fund Escrow
        </button>
      </div>
    </div>
  );
}
