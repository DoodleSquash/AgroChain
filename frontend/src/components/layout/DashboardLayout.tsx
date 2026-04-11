import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../shared/LanguageSwitcher";

export default function DashboardLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const isFarmer = location.pathname.startsWith("/farmer");

  const FARMER_NAV = [
    { label: t("nav.dashboard"), path: "/farmer/dashboard", icon: "dashboard" },
    { label: t("nav.listings"), path: "/farmer/listings", icon: "storefront" },
    { label: t("nav.orders"), path: "/farmer/orders", icon: "shopping_bag" },
    { label: "Chats", path: "/farmer/chats", icon: "chat" },
    {
      label: t("nav.payments"),
      path: "/farmer/payments",
      icon: "account_balance_wallet",
    },
    { label: "Hire Workers", path: "/farmer/hire", icon: "badge" },
    { label: "Network", path: "/farmer/buyers", icon: "diversity_3" },
  ];

  const MARKET_NAV = [
    {
      label: t("nav.marketplace"),
      path: "/market/browse",
      icon: "shopping_cart",
    },
    {
      label: t("nav.my_orders"),
      path: "/market/dashboard",
      icon: "receipt_long",
    },
    { label: "Chats", path: "/market/chats", icon: "chat" },
    {
      label: t("nav.logistics"),
      path: "/market/logistics",
      icon: "local_shipping",
    },
    {
      label: "Transporters",
      path: "/market/transporters",
      icon: "person_pin_circle",
    },
    { label: "Warehouses", path: "/market/warehouses", icon: "warehouse" },
  ];

  const navItems = isFarmer ? FARMER_NAV : MARKET_NAV;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName =
    user.name || (isFarmer ? t("nav.farmer_portal") : t("nav.buyer_portal"));

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-low font-body text-on-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-2xl shadow-sm flex justify-between items-center px-3 sm:px-4 md:px-6 py-2 border-b border-outline-variant/20 text-on-surface transition-all">
        {/* Logo Section */}
        <div className="flex items-center gap-3 md:gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-md shadow-primary-600/20 group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-white text-[20px] sm:text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                eco
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight font-headline bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent group-hover:to-primary-500 transition-colors hidden xs:block sm:block">
              AgroChain
            </span>
          </Link>

          {/* Quick Context Links */}
          <div className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
            <Link
              to={isFarmer ? "/farmer/dashboard" : "/market/browse"}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${location.pathname.includes("dashboard") || location.pathname.includes("browse") ? "bg-white shadow-sm text-primary-700" : "text-on-surface-variant hover:text-on-surface hover:bg-white/50"}`}
            >
              {t("nav.overview")}
            </Link>
            <Link
              to={isFarmer ? "/farmer/orders" : "/market/dashboard"}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${location.pathname.includes("orders") ? "bg-white shadow-sm text-primary-700" : "text-on-surface-variant hover:text-on-surface hover:bg-white/50"}`}
            >
              {t("nav.activity")}
            </Link>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-5">
          {/* Role Badge - Links to Edit Profile */}
          <Link
            to={isFarmer ? "/farmer/profile/edit" : "/market/profile/edit"}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isFarmer ? "local_florist" : "storefront"}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isFarmer ? t("nav.farmer_portal") : t("nav.buyer_portal")}
            </span>
          </Link>

          <LanguageSwitcher />

          <div className="h-6 w-px bg-outline-variant/30 hidden md:block"></div>

          <button className="relative p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant group">
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform text-[22px] sm:text-[24px]">
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 border-2 border-white rounded-full shadow-sm"></span>
          </button>

          {/* Mobile-accessible Wallet (moved from bottom nav) */}
          <Link
            to={isFarmer ? "/farmer/payments" : "/market/dashboard"}
            className="p-2 hover:bg-surface-container rounded-full transition-colors text-primary-700 md:hidden flex items-center justify-center"
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance_wallet
            </span>
          </Link>

          <Link
            to={isFarmer ? "/farmer/profile/edit" : "/market/profile/edit"}
            className="flex items-center gap-2 hover:bg-surface-container-low p-1 rounded-full transition-colors border border-transparent hover:border-outline-variant/20 group"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(isFarmer ? t("nav.farmer_portal") : t("nav.buyer_portal"))}&background=16A34A&color=fff&bold=true`}
              alt="Profile"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full shadow-sm border border-outline-variant/20 transition-transform group-hover:scale-105"
            />
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary-700 transition-colors">
                {isFarmer ? t("nav.farmer_portal") : t("nav.buyer_portal")}
              </span>
              <span className="text-[10px] text-primary-600 font-bold flex items-center gap-0.5">
                <span
                  className="material-symbols-outlined text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>{" "}
                {t("dashboard.verified")}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] hidden md:block group-hover:translate-x-0.5 transition-transform">
              keyboard_arrow_right
            </span>
          </Link>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 bg-white p-6 sticky top-16 h-[calc(100vh-64px)] border-r border-zinc-200/50 shadow-sm">
          <nav className="flex-1 flex flex-col gap-1 mt-4">
            <div className="px-3 mb-3">
              <span className="text-[11px] font-black tracking-[0.15em] text-zinc-400 uppercase">
                {t("nav.general")}
              </span>
            </div>

            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const isFirstInSection = index === 0;
              const needsSeparator = index === 1; // Show 'Management' before listings/orders

              return (
                <React.Fragment key={item.path}>
                  {needsSeparator && (
                    <div className="px-3 mt-6 mb-3">
                      <span className="text-[11px] font-black tracking-[0.15em] text-zinc-400 uppercase">
                        {t("nav.management")}
                      </span>
                    </div>
                  )}
                  <Link
                    to={item.path}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-primary-50 text-primary-800 shadow-sm"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95"
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 rounded-r-full shadow-[0_0_12px_rgba(22,163,74,0.4)]" />
                    )}

                    <span
                      className="material-symbols-outlined text-[22px] transition-all group-hover:scale-110"
                      style={{
                        fontVariationSettings: isActive
                          ? "'FILL' 1"
                          : undefined,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-body text-[15px]">{item.label}</span>

                    {/* Subtle hover reveal element */}
                    {!isActive && (
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-sm text-zinc-300">
                          chevron_right
                        </span>
                      </div>
                    )}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-100 space-y-4">
            <div className="px-3 mb-1">
              <span className="text-[11px] font-black tracking-[0.15em] text-zinc-400 uppercase">
                {t("nav.account")}
              </span>
            </div>

            <Link
              to={
                location.pathname.startsWith("/farmer")
                  ? "/farmer/profile/edit"
                  : "/market/profile/edit"
              }
              className="group flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-primary-700 hover:bg-primary-50 rounded-2xl font-bold transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                person
              </span>
              <span>Edit Profile</span>
            </Link>

            <Link
              to="/auth"
              className="group flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-500 hover:bg-red-50/50 rounded-2xl font-bold transition-all duration-200 mt-2"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-100/50 transition-colors">
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
                  logout
                </span>
              </div>
              <span className="font-body">{t("nav.logout")}</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
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
              className={`flex flex-col items-center justify-center p-2 transition-all ${isActive ? "bg-green-600 text-white rounded-2xl scale-110 shadow-lg" : "text-zinc-400 hover:text-green-600"}`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : undefined,
                }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium font-body">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
