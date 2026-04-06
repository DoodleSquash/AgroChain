import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API, apiFetch } from '../../lib/api';
import AIPriceAdvisor from '../../components/dashboard/AIPriceAdvisor';
import { useVoice } from '../../context/VoiceContext';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || t('nav.farmer_portal');

  const [listings, setListings] = React.useState<any[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>({ activeListings: 0, pendingOrders: 0, totalEarnings: 0 });
  const [payments, setPayments] = React.useState<any>({ pendingPayments: 0, releasedPayments: 0, totalEarnings: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [dashRes, orderRes, batchRes, payRes] = await Promise.all([
          apiFetch<any>(`/farmers/dashboard?farmer_id=${user.id}`),
          apiFetch<any[]>(`/farmers/orders?farmer_id=${user.id}`),
          apiFetch<any[]>(`/farmers/batches?farmer_id=${user.id}`),
          apiFetch<any>(`/farmers/payments?farmer_id=${user.id}`)
        ]);

        setStats(dashRes);
        setOrders(orderRes.slice(0, 3));
        setListings(Array.isArray(batchRes) ? batchRes.slice(0, 4) : []);
        setPayments(payRes);
      } catch (err) {
        console.error('Dashboard Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user.id) fetchAllData();
  }, [user.id]);

  const cropImg = (crop: string) => {
    const c = crop.toLowerCase();
    if (c.includes('tomato'))  return '/product_tomatoes.png';
    if (c.includes('tulsi') || c.includes('spinach')) return '/product_tulsi.png';
    if (c.includes('milk') || c.includes('dairy'))    return '/product_milk.png';
    return '/product_tomatoes.png';
  };

  // ── Voice Context Integration ──
  const dashboardContext = React.useMemo(() => {
    return `
PAGE: Farmer Dashboard (Overview)
NO SPECIFIC ACTIONS AVAILABLE. YOU ARE ACTING AS A DATA ANALYST.
Use the following live dat to answer the user's questions:
- Total Earnings: ₹${stats?.totalEarnings || 0}
- Pending Escrow Payments: ₹${payments?.pendingPayments || 0}
- Released Escrow Funds: ₹${payments?.releasedPayments || 0}
- Active Product Listings: ${stats?.activeListings || 0}
- Pending Orders: ${stats?.pendingOrders || 0}

Recent Orders (First 3):
${orders.map(o => `- Order from ${o?.buyer?.name || 'Unknown'}: ${o?.quantity}kg of ${o?.batch?.crop} for ₹${o?.total_amount} (Status: ${o?.status})`).join('\n')}

Active Listings:
${listings.map(l => `- ${l?.crop} at ₹${l?.price_per_unit}/kg (Quantity: ${l?.quantity}kg)`).join('\n')}
    `.trim();
  }, [stats, payments, orders, listings]);

  useVoice(dashboardContext, (intent) => {
    // We don't have local actions on the dashboard, 
    // the bot will just reply conversationally or use GLOBAL_NAVIGATE.
    console.log('[Dashboard] Voice Intent:', intent);
  });

  return (
    <div className="p-3 sm:p-6 md:p-10 space-y-6 md:space-y-10 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-[20px] sm:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none mb-1">{t('nav.farmer_portal')}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface leading-none">
                {userName}
              </h1>
            </div>
          </div>
          <p className="text-on-surface-variant text-sm sm:text-base">
            {t('dashboard.welcome')} 👋 <span className="hidden xs:inline">— {t('dashboard.farmer_sub')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/farmer/listings/new"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary-500 to-primary-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold shadow-lg hover:shadow-primary-600/30 hover:from-primary-400 hover:to-primary-600 transition-all active:scale-95 text-sm sm:text-base"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add_circle</span>
            {t('dashboard.new_listing')}
          </Link>
          <button className="p-2.5 sm:p-3 rounded-2xl bg-white border border-outline-variant/20 shadow-sm hover:bg-primary-50 transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">tune</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: 'payments', label: t('dashboard.total_earnings'), value: `₹${stats.totalEarnings?.toLocaleString() || 0}`, badge: 'Total', badgeColor: 'text-green-700 bg-green-100',
            iconBg: 'bg-primary-50', iconColor: 'text-primary-600',
          },
          {
            icon: 'schedule', label: t('dashboard.pending_escrow'), value: `₹${payments.pendingPayments?.toLocaleString() || 0}`, badge: `${stats.pendingOrders || 0} Pending`, badgeColor: 'text-blue-700 bg-blue-100',
            iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
          },
          {
            icon: 'verified', label: t('dashboard.released_funds'), value: `₹${payments.releasedPayments?.toLocaleString() || 0}`, badge: 'Settled', badgeColor: 'text-emerald-700 bg-emerald-100',
            iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
          },
          {
            icon: 'storefront', label: t('dashboard.active_listings'), value: (stats.activeListings || 0).toString(), badge: 'Active', badgeColor: 'text-violet-700 bg-violet-100',
            iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
          },
        ].map((stat, i) => (
          <div key={i} className={`group relative p-4 sm:p-6 rounded-3xl shadow-sm border border-outline-variant/10 bg-surface-container-lowest hover:shadow-md transition-all duration-300 overflow-hidden`}>
            {/* Decorative blob */}
            <div className="absolute -right-6 -top-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[20px] sm:text-[24px] ${stat.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <span className={`text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${stat.badgeColor}`}>{stat.badge}</span>
            </div>
            <p className="text-on-surface-variant text-[11px] sm:text-sm font-medium truncate">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-extrabold font-headline text-on-surface mt-0.5 sm:mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Left Column ── */}
        <section className="xl:col-span-7 space-y-6">
          
          {/* Active Listings Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-headline text-on-surface">{t('dashboard.active_listings')}</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">{listings.length} {t('dashboard.farmer_sub')}</p>
            </div>
            <Link to="/farmer/listings" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              {t('dashboard.view_all')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-balance	">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-64 bg-surface-container-low rounded-3xl animate-pulse" />)
            ) : (
              listings.map((item, i) => (
                <div key={i} className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-outline-variant/10">
                  <div className="h-44 overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={item.crop}
                      src={item.images?.[0]?.image_url || cropImg(item.crop)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />{item.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <p className="text-white font-bold text-base leading-tight drop-shadow">{item.crop}</p>
                      <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-xl">₹{item.price_per_unit}/kg</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">inventory_2</span>{item.quantity} kg
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-on-surface-variant text-xs">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>{Math.floor(Math.random() * 100)}
                        </span>
                        <span className="flex items-center gap-1 text-primary-600 text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">shopping_bag</span>{Math.floor(Math.random() * 5)} orders
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Link to="/farmer/listings" className="flex-1 text-center text-xs font-bold py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-primary-50 hover:text-primary-700 transition-all">
                        Manage
                      </Link>
                      <button className="flex-1 text-xs font-bold py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all">
                        QR Code
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {listings.length === 0 && !loading && (
              <div className="col-span-2 p-10 bg-surface-container-low rounded-3xl text-center border-2 border-dashed border-outline-variant/20">
                 <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">inventory_2</span>
                 <p className="text-on-surface-variant font-bold mt-2">No active listings. Create one to start selling!</p>
              </div>
            )}
          </div>

          {/* 🧩 NEW: Sales Performance Chart (Visual Filler) */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <div>
                   <h3 className="font-bold text-lg text-on-surface">{t('dashboard.yield_trend')}</h3>
                   <p className="text-xs text-on-surface-variant">Estimated revenue vs actual harvest</p>
                </div>
                <div className="flex gap-2">
                   <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-500" /> <span className="text-[10px] font-bold text-on-surface-variant">Sales</span></div>
                   <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" /> <span className="text-[10px] font-bold text-on-surface-variant">Yield</span></div>
                </div>
             </div>
             
             <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
                {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85, 60, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                     <div className="w-full relative flex items-end justify-center h-40">
                        <div className="w-full bg-secondary/10 rounded-t-lg absolute bottom-0 h-full" />
                        <div 
                          className="w-1/2 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-1000 group-hover:from-primary-500 group-hover:to-primary-300"
                          style={{ height: `${h}%` }}
                        />
                     </div>
                     <span className="text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-tighter">M{i+1}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* 🧩 NEW: Weather & Soil Widget (Visual Filler) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-5 sm:p-6 rounded-[2rem] text-white shadow-lg flex items-center justify-between">
               <div>
                  <p className="text-[10px] sm:text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">{t('dashboard.weather')}</p>
                  <h4 className="text-2xl sm:text-3xl font-black">28°C</h4>
                  <p className="text-xs sm:text-sm font-medium text-blue-50">Partly Cloudy · Humidity 45%</p>
               </div>
               <span className="material-symbols-outlined text-[48px] sm:text-[64px] text-white/40" style={{ fontVariationSettings: "'FILL' 1" }}>partly_cloudy_day</span>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 p-5 sm:p-6 rounded-[2rem] text-white shadow-lg flex items-center justify-between">
               <div>
                  <p className="text-[10px] sm:text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">{t('dashboard.soil')}</p>
                  <h4 className="text-2xl sm:text-3xl font-black">64%</h4>
                  <p className="text-xs sm:text-sm font-medium text-emerald-50">Optimal for Root Crops</p>
               </div>
               <span className="material-symbols-outlined text-[48px] sm:text-[64px] text-white/40" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
          </div>

        </section>

        {/* ── Right Column ── */}
        <section className="xl:col-span-5 space-y-6">
          <AIPriceAdvisor />

          {/* Recent Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-headline text-on-surface">{t('dashboard.recent_orders')}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">5 orders this week</p>
              </div>
              <Link to="/farmer/orders" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                {t('dashboard.history')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="space-y-3">
              {orders.length === 0 && !loading && (
                 <div className="p-8 bg-surface-container-low rounded-2xl text-center border border-dashed border-outline-variant/20 grayscale opacity-60">
                    <p className="text-xs font-bold text-on-surface-variant">No orders yet.</p>
                 </div>
              )}
              {orders.map((order, i) => {
                const statusStyles: Record<string, string> = {
                  'PENDING': 'bg-amber-50 text-amber-700 border border-amber-200',
                  'IN_TRANSIT': 'bg-blue-50 text-blue-700 border border-blue-200',
                  'DELIVERED': 'bg-green-50 text-green-700 border border-green-200',
                  'CANCELLED': 'bg-red-50 text-red-700 border border-red-200',
                };
                const iconMap: Record<string, string> = {
                  'PENDING': 'pending_actions',
                  'IN_TRANSIT': 'local_shipping',
                  'DELIVERED': 'check_circle',
                  'CANCELLED': 'cancel',
                };
                return (
                  <div key={i} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 border border-outline-variant/10 hover:border-primary-200 hover:shadow-sm transition-all group">
                    <div className={`w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0`}>
                      <span className={`material-symbols-outlined text-primary-600`} style={{ fontVariationSettings: "'FILL' 1" }}>{iconMap[order.status] || 'receipt_long'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-on-surface truncate">{order.buyer?.name || 'Unknown Buyer'}</h4>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-lg flex-shrink-0 ${statusStyles[order.status] || 'bg-gray-50'}`}>{order.status}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">{order.batch?.crop} · {order.quantity}kg</p>
                    </div>
                    <p className="text-sm font-extrabold text-primary-700 flex-shrink-0">₹{(order.total_amount || 0).toLocaleString()}</p>
                  </div>
                );
              })}
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
                <h4 className="font-bold text-base">Ecrow Account Overview</h4>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Funds Released', pct: payments.totalEarnings ? Math.round((payments.releasedPayments / payments.totalEarnings) * 100) : 0 },
                  { label: 'Funds Pending', pct: payments.totalEarnings ? Math.round((payments.pendingPayments / payments.totalEarnings) * 100) : 0 },
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-medium mb-1.5 text-white/90">
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
                  <p className="text-white/70 text-xs">Total Contract Value</p>
                  <p className="text-xl font-extrabold font-headline">₹{(payments.totalEarnings || 0).toLocaleString()}</p>
                </div>
                <Link to="/farmer/payments" className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1 text-on-secondary">
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span> Details
                </Link>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-5 shadow-sm">
            <h3 className="font-bold text-base text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-600 text-[18px]">history</span>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {orders.length === 0 && (
                <p className="text-xs text-on-surface-variant italic">No recent activities to show.</p>
              )}
              {orders.map((order, i) => {
                 let text = '';
                 let icon = 'info';
                 let color = 'text-blue-500 bg-blue-50';
                 
                 if (order.status === 'PENDING') {
                   text = `New order for ${order.batch?.crop} from ${order.buyer?.name}`;
                   icon = 'shopping_bag';
                   color = 'text-amber-500 bg-amber-50';
                 } else if (order.status === 'IN_TRANSIT') {
                   text = `${order.batch?.crop} is in transit to ${order.buyer?.name}`;
                   icon = 'local_shipping';
                   color = 'text-blue-500 bg-blue-50';
                 } else if (order.status === 'DELIVERED') {
                   text = `Payment for ${order.batch?.crop} released to your account`;
                   icon = 'payments';
                   color = 'text-green-500 bg-green-50';
                 }

                 return (
                   <div key={i} className="flex items-start gap-3 border-l-2 border-outline-variant/10 pl-3 ml-1">
                     <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}>
                       <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                     </div>
                     <div className="flex-1">
                       <p className="text-sm font-medium text-on-surface leading-snug">{text}</p>
                       <p className="text-[10px] uppercase font-black text-on-surface-variant mt-1">
                         {new Date(order.created_at).toLocaleDateString()}
                       </p>
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FarmerDashboard;
