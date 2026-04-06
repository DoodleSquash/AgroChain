import React from 'react';

export default function CreateListing() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Listing</h1>
      <p className="text-gray-500 mb-8">Fill in the details below to list your produce on the AgroChain marketplace.</p>
      
      <div className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-10 bg-gray-50 rounded-lg border border-gray-200"></div>
          <div className="h-10 bg-gray-50 rounded-lg border border-gray-200"></div>
        </div>
        <div className="h-32 bg-gray-50 rounded-lg border border-gray-200"></div>
        <button className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl opacity-50 cursor-not-allowed">
          Generate QR & Publish
        </button>
      </div>
    </div>
  );
}
