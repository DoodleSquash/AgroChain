import React from 'react';
import { useParams } from 'react-router-dom';

export default function BatchDetails() {
  const { id } = useParams();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
        <span>Marketplace</span>
        <span>/</span>
        <span className="text-primary-600 font-bold">Batch Details</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="h-[500px] bg-gray-100 rounded-[2.5rem]"></div>
        <div className="py-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Batch #{id || 'AG-2041'}</h1>
          <p className="text-xl text-primary-600 font-bold mb-6">₹50/kg</p>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Crop Name</span>
              <span className="font-bold">Tomatoes</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Farmer</span>
              <span className="font-bold">Arjun Singh</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Location</span>
              <span className="font-bold">Pune, MH</span>
            </div>
          </div>
          <button className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
