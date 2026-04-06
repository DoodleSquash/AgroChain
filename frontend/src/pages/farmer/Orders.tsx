import React from 'react';

export default function Orders() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Farmer Orders</h1>
      <p className="text-gray-500 mb-8">Track incoming demand and delivery status for your crops.</p>
      
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Crop</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[1, 2].map((i) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#ORD-000{i}</td>
                <td className="px-6 py-4 text-sm text-gray-500">Sample Crop Name</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg">In Transit</span></td>
                <td className="px-6 py-4 text-sm font-bold text-primary-600">₹12,400</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
