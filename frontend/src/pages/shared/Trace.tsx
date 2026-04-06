import React from 'react';
import { useParams } from 'react-router-dom';

export default function Trace() {
  const { batchId } = useParams();

  return (
    <div className="min-h-screen bg-white">
      <nav className="h-16 border-b border-gray-100 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-primary-600">AgroChain Trace</span>
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verified Batch</div>
      </nav>
      
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <div className="inline-block p-4 bg-gray-50 rounded-3xl border border-gray-100 mb-8">
           <div className="w-48 h-48 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">QR CODE</div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Batch #{batchId || 'AG-XXXX'}</h1>
        <p className="text-gray-500 mb-12">Public traceability for transparency and trust.</p>
        
        <div className="text-left space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
           {['Batch Created', 'Pickup Verified', 'Warehouse Quality Log'].map((event, i) => (
             <div key={i} className="pl-10 relative">
               <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-primary-600 ring-4 ring-white"></div>
               <div className="font-bold text-gray-900">{event}</div>
               <div className="text-sm text-gray-400 font-medium">10 Apr 2026, 14:30</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
