import React from 'react';
import { useParams } from 'react-router-dom';

export default function Warehouse() {
  const { token } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-4xl mb-4">🏢</div>
        <h1 className="text-2xl font-bold mb-2">Warehouse Quality Check</h1>
        <p className="text-gray-500 mb-8 text-sm">Log quality metrics for batch.</p>
        
        <div className="space-y-4 mb-8 text-left">
           <div>
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Weight (kg)</label>
             <div className="h-12 bg-gray-50 rounded-xl border border-gray-100"></div>
           </div>
           <div>
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Quality Grade</label>
             <div className="h-12 bg-gray-50 rounded-xl border border-gray-100"></div>
           </div>
        </div>
        
        <button className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
          Submit Quality Logs
        </button>
      </div>
    </div>
  );
}
