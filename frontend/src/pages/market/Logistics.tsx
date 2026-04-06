import React from 'react';

export default function Logistics() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Logistics Control Panel</h1>
      <p className="text-gray-500 mb-8">Generate and manage secure links for transporters and warehouses.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Transport Links</h2>
          <button className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl text-sm">
            + Generate Link
          </button>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Warehouse Links</h2>
          <button className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl text-sm">
            + Generate Link
          </button>
        </div>
      </div>
    </div>
  );
}
