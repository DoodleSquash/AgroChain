import React from 'react';
import { Link } from 'react-router-dom';

export default function MarketDashboard() {
  const stats = [
    { label: 'Active Orders', value: '12', change: '+2 this week', icon: 'local_shipping', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Deliveries', value: '5', change: '3 arriving today', icon: 'inventory_2', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Spent', value: '₹12.4L', change: '+15% vs last month', icon: 'account_balance_wallet', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Saved via Escrow', value: '₹45K', change: 'Refunded from disputes', icon: 'shield', color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  const recentOrders = [
    { id: 'ORD-7721', crop: 'Organic Tomatoes', farmer: 'Ramesh Patel', amount: '₹14,500', status: 'In Transit', date: 'Oct 24, 2026' },
    { id: 'ORD-7720', crop: 'Premium Wheat', farmer: 'Singh Farms', amount: '₹85,000', status: 'Delivered', date: 'Oct 22, 2026' },
    { id: 'ORD-7719', crop: 'Red Onions', farmer: 'Kisan Co-op', amount: '₹32,000', status: 'Pending Pickup', date: 'Oct 21, 2026' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Market Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">Welcome back! Here's your supply chain overview.</p>
        </div>
        <Link to="/market/browse" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
          New Order
        </Link>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{stat.icon}</span>
            </div>
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 line-clamp-1">{stat.label}</p>
              <h3 className="text-xl sm:text-3xl font-black text-gray-900 mb-1 sm:mb-2">{stat.value}</h3>
              <p className="text-[10px] sm:text-sm font-medium text-gray-400 line-clamp-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Analytics Chart area */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[300px] sm:h-[400px]">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Spend Analytics</h2>
            <select className="bg-gray-50 border-none text-xs sm:text-sm font-bold text-gray-600 rounded-lg px-2 py-1 sm:px-3 sm:py-2 outline-none focus:ring-2 focus:ring-primary-500/20">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 flex items-end gap-2 sm:gap-4 p-2 sm:p-4 border border-gray-50 bg-gray-50/50 rounded-xl sm:rounded-2xl relative">
             <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-gray-400 font-medium flex items-center gap-2 text-xs sm:text-sm">
                     <span className="material-symbols-outlined text-[18px] sm:text-[24px]">bar_chart</span>
                     Interactive Chart Visualization
                 </span>
             </div>
             {/* Decorative bars */}
             {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                 <div key={i} className="flex-1 bg-gradient-to-t from-primary-600/20 to-primary-600/5 rounded-t-lg transition-all duration-1000 animate-pulse" style={{ height: `${h}%` }}></div>
             ))}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[350px] sm:h-[400px]">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-primary-600 hover:text-primary-700 font-bold text-xs sm:text-sm">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 sm:space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/50 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-1 sm:mb-2 gap-2">
                  <span className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">{order.crop}</span>
                  <span className="font-extrabold text-sm sm:text-base text-gray-900">{order.amount}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-500 flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
                    <span className="material-symbols-outlined text-[12px] sm:text-[14px]">person</span> <span className="truncate">{order.farmer}</span>
                  </span>
                  <span className={`px-2 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
