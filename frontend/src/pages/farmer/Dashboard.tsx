import React from 'react';
import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Farmer';
  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">Farmer Portal</p>
              <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface leading-none">
                {userName}
              </h1>
            </div>
          </div>
          <p className="text-on-surface-variant text-base">
            Welcome back 👋 — Your harvest is yielding results. Here's your farm performance at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/farmer/listings/new"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-primary-500 to-primary-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-primary-600/30 hover:from-primary-400 hover:to-primary-600 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            New Listing
          </Link>
          <button className="p-3 rounded-2xl bg-white border border-outline-variant/20 shadow-sm hover:bg-primary-50 transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: 'payments', label: 'Total Earnings', value: '₹42,850', badge: '+12%', badgeColor: 'text-green-700 bg-green-100',
            iconBg: 'bg-primary-50', iconColor: 'text-primary-600',
            gradient: 'from-primary-600 to-primary-700', isHighlight: true,
          },
          {
            icon: 'schedule', label: 'Pending Escrow', value: '₹12,400', badge: '4 Batches', badgeColor: 'text-blue-700 bg-blue-100',
            iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
          },
          {
            icon: 'verified', label: 'Released Funds', value: '₹30,450', badge: 'Settled', badgeColor: 'text-emerald-700 bg-emerald-100',
            iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
          },
          {
            icon: 'storefront', label: 'Active Listings', value: '8', badge: '2 New', badgeColor: 'text-violet-700 bg-violet-100',
            iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
          },
        ].map((stat, i) => (
          <div key={i} className={`group relative p-6 rounded-3xl shadow-sm border border-outline-variant/10 bg-surface-container-lowest hover:shadow-md transition-all duration-300 overflow-hidden`}>
            {/* Decorative blob */}
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br from-primary-50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className={`w-11 h-11 rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${stat.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.badgeColor}`}>{stat.badge}</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-extrabold font-headline text-on-surface mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Active Listings ── */}
        <section className="xl:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-headline text-on-surface">Active Listings</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">8 live batches on marketplace</p>
            </div>
            <Link to="/farmer/listings" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                name: 'Organic Heritage Carrots', qty: '500 kg', price: '₹2.50/kg', status: 'Live',
                progress: 75, views: 124, orders: 3,
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDADUPKZm82mq0BK-JRDilcM5teN2pGng4pqrSBKvAVioPsvbCESgMip-w5ix-UMw9U24u0-b_mMDdE7cO-XH4mvXYztH2P1FmzOYv_uO5dvV3u-EY0eiqqGuagBnQ1toaFP8tL6AhWMgRa33EwmDgb0ZTSGzAxHoXGQF8gxEP09R2UqXhUcIpbgENUCjQFrR8xcjFB-0-7-0Q6yzc25rvlUAtLa0s4OegRs_edAQQNlR2irwkJb_bX5RS3QL0jrlottbnMbA_29Q',
                harvest: '2 Apr 2026', expire: '10 Apr 2026',
              },
              {
                name: 'Premium Russet Potatoes', qty: '1.2 Tons', price: '₹1.10/kg', status: 'Live',
                progress: 50, views: 89, orders: 1,
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYNDT4qNHZ6AoVNVjXiOpPRuzvlwmtzHrChtLVX1G87jdqSrZcMAvYzmHyjqRwmhF0Qf3aWC63_jYLiJ1AHMlveM6lNychkDg2fde4sCmEQxU0FPChkZ_Vt2cdDT2XWSdO83UU6YnytsYp9IHJeTRZ85msrIrXf4Zyl6dmGa0GUTy8AX5_uB0QDIHiFWFtRk7ioHoHmi7fagQHC2jJ0jfiFS2PBbXJtHZBM2eFp8qIZ138a2R_ArRXxMz-uFD_yhjPI9PLZ_iGcA',
                harvest: '28 Mar 2026', expire: '15 Apr 2026',
              },
            ].map((item, i) => (
              <div key={i} className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-outline-variant/10">
                <div className="h-44 overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={item.name}
                    src={item.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />{item.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <p className="text-white font-bold text-base leading-tight drop-shadow">{item.name}</p>
                    <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-xl">{item.price}</span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">inventory_2</span>{item.qty}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-on-surface-variant text-xs">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>{item.views}
                      </span>
                      <span className="flex items-center gap-1 text-primary-600 text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">shopping_bag</span>{item.orders} orders
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-green-600">agriculture</span>Harvested: {item.harvest}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-amber-500">timer</span>Expires: {item.expire}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Quantity sold</span>
                      <span className="font-bold text-primary-600">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-primary-50 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-full rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 text-xs font-bold py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all">
                      <span className="material-symbols-outlined text-[14px] align-middle mr-1">edit</span>Edit
                    </button>
                    <button className="flex-1 text-xs font-bold py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all">
                      <span className="material-symbols-outlined text-[14px] align-middle mr-1">qr_code</span>QR Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Avg. Order Value', value: '₹8,200', icon: 'trending_up', color: 'text-green-600 bg-green-50' },
              { label: 'Repeat Buyers', value: '67%', icon: 'people', color: 'text-blue-600 bg-blue-50' },
              { label: 'Trust Score', value: '4.9 ★', icon: 'verified_user', color: 'text-amber-600 bg-amber-50' },
            ].map((s, i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 text-center shadow-sm">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <p className="text-lg font-extrabold font-headline">{s.value}</p>
                <p className="text-xs text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Right Column ── */}
        <section className="xl:col-span-5 space-y-6">

          {/* Recent Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-headline text-on-surface">Recent Orders</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">5 orders this week</p>
              </div>
              <Link to="/farmer/orders" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                History <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="space-y-3">
              {[
                {
                  buyer: 'Fresh Mart Central', detail: '200kg Sweet Corn', order: '#AC-8821',
                  amount: '₹14,200', status: 'In Transit', statusStyle: 'bg-blue-50 text-blue-700 border border-blue-200',
                  icon: 'local_shipping', iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
                },
                {
                  buyer: 'WholeFoods Plaza', detail: '50kg Organic Basil', order: '#AC-8845',
                  amount: '₹3,800', status: 'Pending', statusStyle: 'bg-amber-50 text-amber-700 border border-amber-200',
                  icon: 'pending_actions', iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
                },
                {
                  buyer: 'GreenMart Delhi', detail: '300kg Spinach', order: '#AC-8799',
                  amount: '₹9,600', status: 'Delivered', statusStyle: 'bg-green-50 text-green-700 border border-green-200',
                  icon: 'check_circle', iconBg: 'bg-green-50', iconColor: 'text-green-600',
                },
              ].map((order, i) => (
                <div key={i} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 border border-outline-variant/10 hover:border-primary-200 hover:shadow-sm transition-all group">
                  <div className={`w-11 h-11 rounded-2xl ${order.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined ${order.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{order.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm text-on-surface truncate">{order.buyer}</h4>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${order.statusStyle}`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">{order.detail} · {order.order}</p>
                  </div>
                  <p className="text-sm font-extrabold text-primary-700 flex-shrink-0">{order.amount}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow Status Card */}
          <div className="bg-gradient-to-br from-secondary to-secondary-container text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-white/90" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                <h4 className="font-bold text-base">Secure Escrow Status</h4>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Fund Verification', pct: 85 },
                  { label: 'Delivery Confidence', pct: 92 },
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span>{bar.label}</span>
                      <span>{bar.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" style={{ width: `${bar.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-white/20 flex justify-between items-center">
                <div>
                  <p className="text-white/70 text-xs">Locked in escrow</p>
                  <p className="text-xl font-extrabold font-headline">₹12,400</p>
                </div>
                <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span> View Details
                </button>
              </div>
              <p className="text-[11px] text-white/60 mt-3 italic">Funds auto-release after delivery confirmation.</p>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-base text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-600 text-[18px]">history</span>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { text: 'New order received from FreshMart', time: '2 hrs ago', icon: 'shopping_bag', color: 'text-blue-500 bg-blue-50' },
                { text: 'QR scanned at warehouse checkpoint', time: '5 hrs ago', icon: 'qr_code_scanner', color: 'text-violet-500 bg-violet-50' },
                { text: 'Escrow released: ₹9,800 credited', time: '1 day ago', icon: 'payments', color: 'text-green-500 bg-green-50' },
                { text: 'Listing "Sweet Corn" marked as Sold', time: '2 days ago', icon: 'sell', color: 'text-amber-500 bg-amber-50' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${a.color}`}>
                    <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface leading-snug">{a.text}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FarmerDashboard;
