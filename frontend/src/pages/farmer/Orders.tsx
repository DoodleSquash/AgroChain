import React from 'react';

export default function Orders() {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1400px] mx-auto space-y-6 md:space-y-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Order Management</h1>
          <p className="text-on-surface-variant text-base mt-2">Track incoming demand, verify logistics, and manage fulfillments.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

       {/* Quick Stats Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Orders', val: '12', icon: 'shopping_cart', c: 'blue' },
            { label: 'Pending Pickup', val: '4', icon: 'local_shipping', c: 'amber' },
            { label: 'In Transit', val: '7', icon: 'route', c: 'violet' },
            { label: 'Escrow Locked', val: '₹62,400', icon: 'lock', c: 'primary' },
          ].map((s, i) => (
             <div key={i} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex items-center gap-4 group hover:border-primary-200 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-${s.c}-50 flex items-center justify-center text-${s.c}-600 group-hover:scale-110 transition-transform`}>
                   <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface-variant">{s.label}</p>
                  <p className="text-2xl font-extrabold font-headline text-on-surface">{s.val}</p>
                </div>
             </div>
          ))}
       </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col">
          
        {/* Table Toolbar */}
        <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
           <div className="flex items-center gap-2">
             <span className="material-symbols-outlined text-on-surface-variant">filter_alt</span>
             <span className="text-sm font-bold text-on-surface-variant">Filter by Status:</span>
             <select className="bg-white border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm font-medium outline-none text-on-surface">
                <option>All Orders</option>
                <option>Pending Pickup</option>
                <option>In Transit</option>
                <option>Delivered</option>
             </select>
           </div>
           
           <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[18px]">search</span>
              <input type="text" placeholder="Search Order ID or Buyer..." className="pl-9 pr-4 py-1.5 bg-white border border-outline-variant/30 rounded-lg outline-none focus:border-primary-500 text-sm w-64 text-on-surface" />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-bright border-b border-outline-variant/20">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Batch / Crop</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Amount Tracker</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {[
                  {
                    id: '#ORD-8821', date: 'Today, 10:45 AM', buyer: 'Fresh Mart Central', crop: 'Sweet Corn - 200kg', batch: 'BATCH-442',
                    status: 'In Transit', statusColor: 'bg-violet-50 text-violet-700 border-violet-200 text-violet-600', icon: 'route',
                    amount: '₹14,200', escrow: 'Locked in Escrow'
                  },
                  {
                    id: '#ORD-8845', date: 'Yesterday, 3:20 PM', buyer: 'WholeFoods Plaza', crop: 'Organic Basil - 50kg', batch: 'BATCH-448',
                    status: 'Pending Pickup', statusColor: 'bg-amber-50 text-amber-700 border-amber-200 text-amber-600', icon: 'inventory',
                    amount: '₹3,800', escrow: 'Escrow Funded'
                  },
                  {
                    id: '#ORD-8799', date: '12 Apr 2026', buyer: 'GreenMart Delhi', crop: 'Spinach - 300kg', batch: 'BATCH-412',
                    status: 'Delivered', statusColor: 'bg-green-50 text-green-700 border-green-200 text-green-600', icon: 'verified',
                    amount: '₹9,600', escrow: 'Released to Wallet'
                  },
                  {
                    id: '#ORD-8750', date: '10 Apr 2026', buyer: 'Metro Retail', crop: 'Potatoes - 1.2T', batch: 'BATCH-399',
                    status: 'Completed', statusColor: 'bg-blue-50 text-blue-700 border-blue-200 text-blue-600', icon: 'done_all',
                    amount: '₹22,000', escrow: 'Released to Wallet'
                  }
              ].map((order, i) => (
                <tr key={i} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                         {order.id}
                         <button className="text-outline hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100 p-0.5"><span className="material-symbols-outlined text-[14px]">content_copy</span></button>
                       </span>
                       <span className="text-xs text-on-surface-variant font-medium">{order.buyer}</span>
                       <span className="text-[11px] text-on-surface-variant mt-1 opacity-70 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">schedule</span> {order.date}
                       </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-on-surface-variant">grass</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-on-surface">{order.crop}</span>
                         <span className="text-xs font-mono text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded-md inline-block w-max mt-1">{order.batch}</span>
                       </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold capitalize ${order.statusColor}`}>
                       <span className="material-symbols-outlined text-[14px]">{order.icon}</span>
                       {order.status}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-on-surface">{order.amount}</span>
                      <span className="text-[11px] font-medium flex items-center gap-1 mt-1 text-on-surface-variant">
                         <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: order.escrow.includes('Locked') ? "'FILL' 1" : "'FILL' 0" }}>
                           {order.escrow.includes('Released') ? 'check_circle' : 'security'}
                         </span>
                         {order.escrow}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                     <button className="w-9 h-9 rounded-full bg-white hover:bg-surface-container-low border border-outline-variant/30 text-on-surface flex items-center justify-center transition-colors shadow-sm ml-auto">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
           <span className="text-xs font-medium text-on-surface-variant">Showing 1 to 4 of 12 orders</span>
           <div className="flex gap-1">
             <button className="w-8 h-8 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:bg-white transition-colors" disabled>
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
             </button>
             <button className="w-8 h-8 rounded-lg bg-primary-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">1</button>
             <button className="w-8 h-8 rounded-lg border border-outline-variant/30 bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-white transition-colors text-sm font-medium">2</button>
             <button className="w-8 h-8 rounded-lg border border-outline-variant/30 bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-white transition-colors text-sm font-medium">3</button>
             <button className="w-8 h-8 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
