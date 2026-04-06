import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const FARMER_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/farmer/dashboard', icon: 'dashboard' },
  { label: 'My Listings', path: '/farmer/listings', icon: 'storefront' },
  { label: 'Orders', path: '/farmer/orders', icon: 'shopping_bag' },
  { label: 'Payments', path: '/farmer/payments', icon: 'account_balance_wallet' },
];

const MARKET_NAV: NavItem[] = [
  { label: 'Marketplace', path: '/market/browse', icon: 'shopping_cart' },
  { label: 'My Orders', path: '/market/dashboard', icon: 'receipt_long' },
  { label: 'Logistics', path: '/market/logistics', icon: 'local_shipping' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const isFarmer = location.pathname.startsWith('/farmer');
  const navItems = isFarmer ? FARMER_NAV : MARKET_NAV;

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-low font-body text-on-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-3 border-b border-outline-variant/10 text-on-surface">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-green-800 font-headline">AgroChain</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to={isFarmer ? "/farmer/dashboard" : "/market/browse"} 
              className={`font-medium py-1 transition-colors ${location.pathname.includes('dashboard') || location.pathname.includes('browse') ? 'text-green-700 border-b-2 border-green-700' : 'text-zinc-600 hover:text-green-700'}`}
            >
              Main
            </Link>
            <Link 
              to={isFarmer ? "/farmer/orders" : "/market/dashboard"} 
              className="text-zinc-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
            >
              Activity
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-sm font-medium text-zinc-500">
            {isFarmer ? 'Farmer Portal' : 'Marketplace'}
          </span>
          <button className="p-2 hover:bg-green-50 rounded-full transition-colors text-zinc-600">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 hover:bg-green-50 rounded-full transition-colors text-zinc-600">
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-zinc-50 p-4 sticky top-16 h-[calc(100vh-64px)] border-r border-outline-variant/10">
          
          <nav className="flex-1 flex flex-col gap-1 mt-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all hover:translate-x-1 ${
                    isActive 
                      ? 'bg-white text-green-700 shadow-sm' 
                      : 'text-zinc-500 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            {isFarmer && (
              <button className="w-full bg-primary-container text-white py-3 px-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">add_circle</span>
                Commit Funds
              </button>
            )}
            <Link to="/auth" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-500 font-semibold transition-colors">
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-lg rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 transition-all ${isActive ? 'bg-green-600 text-white rounded-2xl scale-110 shadow-lg' : 'text-zinc-400 hover:text-green-600'}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium font-body">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
