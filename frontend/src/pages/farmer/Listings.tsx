import React from 'react';

export default function Listings() {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1400px] mx-auto space-y-6 md:space-y-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">My Listings</h1>
          <p className="text-on-surface-variant text-base mt-2">Manage and track all your published crop batches here.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
            <input type="text" placeholder="Search crops..." className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-full focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm w-64 text-on-surface" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-full text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 overflow-x-auto pb-px">
        {['All Listings (12)', 'Active (8)', 'Sold (3)', 'Drafts (1)'].map((tab, i) => (
          <button key={i} className={`whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 transition-colors ${i === 1 ? 'border-primary-600 text-primary-600' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Listing Cards */}
        {[
          {
            name: 'Organic Heritage Carrots', qty: '500 kg', price: '₹2.50/kg', status: 'Live',
            progress: 75,
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDADUPKZm82mq0BK-JRDilcM5teN2pGng4pqrSBKvAVioPsvbCESgMip-w5ix-UMw9U24u0-b_mMDdE7cO-XH4mvXYztH2P1FmzOYv_uO5dvV3u-EY0eiqqGuagBnQ1toaFP8tL6AhWMgRa33EwmDgb0ZTSGzAxHoXGQF8gxEP09R2UqXhUcIpbgENUCjQFrR8xcjFB-0-7-0Q6yzc25rvlUAtLa0s4OegRs_edAQQNlR2irwkJb_bX5RS3QL0jrlottbnMbA_29Q',
          },
          {
            name: 'Premium Russet Potatoes', qty: '1.2 Tons', price: '₹1.10/kg', status: 'Live',
            progress: 20,
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYNDT4qNHZ6AoVNVjXiOpPRuzvlwmtzHrChtLVX1G87jdqSrZcMAvYzmHyjqRwmhF0Qf3aWC63_jYLiJ1AHMlveM6lNychkDg2fde4sCmEQxU0FPChkZ_Vt2cdDT2XWSdO83UU6YnytsYp9IHJeTRZ85msrIrXf4Zyl6dmGa0GUTy8AX5_uB0QDIHiFWFtRk7ioHoHmi7fagQHC2jJ0jfiFS2PBbXJtHZBM2eFp8qIZ138a2R_ArRXxMz-uFD_yhjPI9PLZ_iGcA',
          },
          {
            name: 'Sweet Corn - Bulk', qty: '800 kg', price: '₹18/kg', status: 'Live',
            progress: 95,
            img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2670&auto=format&fit=crop',
          },
          {
            name: 'Red Tomatoes', qty: '300 kg', price: '₹35/kg', status: 'Sold',
            progress: 100,
            img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2622&auto=format&fit=crop',
          },
           {
            name: 'Fresh Spinach', qty: '150 kg', price: '₹40/kg', status: 'Live',
            progress: 10,
            img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=2680&auto=format&fit=crop',
          },
           {
            name: 'Green Peas', qty: '250 kg', price: '₹60/kg', status: 'Draft',
            progress: 0,
            img: 'https://images.unsplash.com/photo-1515002246390-7bf7e8f8cece?q=80&w=2680&auto=format&fit=crop',
          }
        ].map((item, i) => (
          <div key={i} className="group flex flex-col bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10">
            <div className="h-40 overflow-hidden relative">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={item.name}
                src={item.img}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              <div className="absolute top-3 right-3">
                 <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                 </button>
              </div>

               <div className="absolute top-3 left-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 text-white shadow-sm
                  ${item.status === 'Live' ? 'bg-green-500' : item.status === 'Sold' ? 'bg-blue-500' : 'bg-zinc-500'}`}
                >
                  {item.status === 'Live' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />}
                  {item.status}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                 <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/10">{item.price}</span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h4 className="font-bold text-lg text-on-surface mb-2 line-clamp-1" title={item.name}>{item.name}</h4>
             
              <div className="flex justify-between items-center text-sm text-on-surface-variant mb-4">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>{item.qty}
                  </span>
                  <span className="text-xs font-medium">Batch #AC-{8000 + i}</span>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-on-surface-variant mb-1.5 font-medium">
                  <span>Sold: {item.progress}%</span>
                  {item.progress === 100 && <span className="text-blue-600">Completed</span>}
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full transition-all ${item.progress === 100 ? 'bg-blue-500' : 'bg-primary-500'}`} 
                    style={{ width: `${item.progress}%` }} 
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                   <button className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-bold transition-colors">
                     <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                     QR
                   </button>
                   {item.status === 'Live' && (
                      <button className="flex-1 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 font-bold text-sm transition-colors">
                        Promote
                      </button>
                   )}
                   {item.status === 'Draft' && (
                     <button className="flex-1 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20 font-bold text-sm transition-colors">
                        Publish
                      </button>
                   )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
