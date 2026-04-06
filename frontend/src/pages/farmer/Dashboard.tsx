import React from 'react';

const FarmerDashboard = () => {
  return (
    <div className="p-6 md:p-10 space-y-10">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Farmer Dashboard</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Welcome back, Miller Farms. Your harvest is yielding results.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gradient-to-br from-primary-container to-primary text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
          <span className="material-symbols-outlined">add_circle</span>
          Create New Listing
        </button>
      </div>

      {/* Earnings Bento Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <span className="material-symbols-outlined text-primary p-3 bg-primary-fixed/20 rounded-2xl">payments</span>
              <span className="text-primary text-sm font-bold bg-primary-fixed/30 px-3 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-zinc-500 font-medium mb-1">Total Earnings</h3>
            <p className="text-3xl font-extrabold font-headline">₹42,850.00</p>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <span className="material-symbols-outlined text-secondary p-3 bg-secondary-fixed-dim/20 rounded-2xl">schedule</span>
              <span className="text-secondary text-sm font-bold bg-secondary-fixed/30 px-3 py-1 rounded-full">4 Assets</span>
            </div>
            <h3 className="text-zinc-500 font-medium mb-1">Pending Escrow</h3>
            <p className="text-3xl font-extrabold font-headline text-secondary">₹12,400.00</p>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <span className="material-symbols-outlined text-green-800 p-3 bg-green-100 rounded-2xl">verified</span>
              <span className="text-green-800 text-sm font-bold bg-green-200 px-3 py-1 rounded-full">Ready</span>
            </div>
            <h3 className="text-zinc-500 font-medium mb-1">Released Funds</h3>
            <p className="text-3xl font-extrabold font-headline">₹30,450.00</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Active Listings */}
        <section className="xl:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-headline">Active Listings</h2>
            <button className="text-primary font-bold text-sm">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-40 overflow-hidden relative">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Close-up of vibrant organic carrots" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDADUPKZm82mq0BK-JRDilcM5teN2pGng4pqrSBKvAVioPsvbCESgMip-w5ix-UMw9U24u0-b_mMDdE7cO-XH4mvXYztH2P1FmzOYv_uO5dvV3u-EY0eiqqGuagBnQ1toaFP8tL6AhWMgRa33EwmDgb0ZTSGzAxHoXGQF8gxEP09R2UqXhUcIpbgENUCjQFrR8xcjFB-0-7-0Q6yzc25rvlUAtLa0s4OegRs_edAQQNlR2irwkJb_bX5RS3QL0jrlottbnMbA_29Q"/>
                <div className="absolute top-4 left-4 bg-primary-container text-white text-xs font-bold px-3 py-1 rounded-full">Live</div>
              </div>
              <div className="p-5 space-y-3">
                <h4 className="font-bold text-lg">Organic Heritage Carrots</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">500 kg Available</span>
                  <span className="font-bold text-primary">₹2.50/kg</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-4">
                  <div className="bg-primary h-full rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="h-40 overflow-hidden relative">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Premium Russet Potatoes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYNDT4qNHZ6AoVNVjXiOpPRuzvlwmtzHrChtLVX1G87jdqSrZcMAvYzmHyjqRwmhF0Qf3aWC63_jYLiJ1AHMlveM6lNychkDg2fde4sCmEQxU0FPChkZ_Vt2cdDT2XWSdO83UU6YnytsYp9IHJeTRZ85msrIrXf4Zyl6dmGa0GUTy8AX5_uB0QDIHiFWFtRk7ioHoHmi7fagQHC2jJ0jfiFS2PBbXJtHZBM2eFp8qIZ138a2R_ArRXxMz-uFD_yhjPI9PLZ_iGcA"/>
                <div className="absolute top-4 left-4 bg-primary-container text-white text-xs font-bold px-3 py-1 rounded-full">Live</div>
              </div>
              <div className="p-5 space-y-3">
                <h4 className="font-bold text-lg">Premium Russet Potatoes</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">1.2 Tons Available</span>
                  <span className="font-bold text-primary">₹1.10/kg</span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-4">
                  <div className="bg-primary h-full rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="xl:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-headline">Recent Orders</h2>
            <button className="text-primary font-bold text-sm">History</button>
          </div>
          <div className="space-y-4">
            {/* Order 1 */}
            <div className="bg-surface-container-lowest p-5 rounded-3xl flex items-center gap-4 border border-outline-variant/10">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold">Fresh Mart Central</h4>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 text-secondary border border-secondary/20">In Transit</span>
                </div>
                <p className="text-sm text-zinc-500">200kg Sweet Corn • Order #AC-8821</p>
              </div>
            </div>
            {/* Order 2 */}
            <div className="bg-surface-container-lowest p-5 rounded-3xl flex items-center gap-4 border border-outline-variant/10">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold">WholeFoods Plaza</h4>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">Pending</span>
                </div>
                <p className="text-sm text-zinc-500">50kg Organic Basil • Order #AC-8845</p>
              </div>
            </div>
          </div>
          
          {/* Escrow Trust Bar */}
          <div className="bg-secondary-container text-white p-6 rounded-3xl mt-8">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              Secure Escrow Status
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Fund Verification</span>
                <span>85% Secure</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white shadow-[0_0_10px_#fff] w-[85%] transition-all"></div>
              </div>
              <p className="text-[10px] text-white/70 mt-2 italic">Funds are locked in smart contract until delivery confirmation.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FarmerDashboard;
