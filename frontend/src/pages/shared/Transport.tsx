import React from 'react';
import { useParams } from 'react-router-dom';

export default function Transport() {
  const { token } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-4xl mb-4">🚚</div>
        <h1 className="text-2xl font-bold mb-2">Transport Job</h1>
        <p className="text-gray-500 mb-8 text-sm">Token ID: {token?.slice(0, 8)}...</p>
        
        <div className="space-y-4 mb-8">
           <button className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
             Scan QR to Pickup
           </button>
           <button className="w-full py-4 bg-white border-2 border-gray-100 text-gray-400 font-bold rounded-2xl cursor-not-allowed">
             Mark Delivered
           </button>
        </div>
        
        <p className="text-xs text-gray-400">No app download required. Just scan and upload proof.</p>
      </div>
    </div>
  );
}
