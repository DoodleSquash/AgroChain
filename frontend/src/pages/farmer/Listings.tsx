import React from 'react';

export default function Listings() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Listings</h1>
      <p className="text-gray-500">Manage and track all your published crop batches here.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            Batch #{i} Placeholder
          </div>
        ))}
      </div>
    </div>
  );
}
