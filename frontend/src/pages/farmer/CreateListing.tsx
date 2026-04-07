import React from 'react';

export default function CreateListing() {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1000px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-600">add_circle</span>
            </div>
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Create New Listing</h1>
          </div>
          <p className="text-on-surface-variant text-base ml-13">Fill in the details below to list your produce on the AgroChain marketplace.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        
        {/* Top Gradient Banner */}
        <div className="h-4 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>

        <div className="p-8 md:p-10">
          <form className="space-y-8">
            
            {/* 1. Basic Info */}
            <section>
              <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary-600 text-[20px]">info</span>
                1. Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/30 p-6 rounded-2xl border border-outline-variant/10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Crop Type</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">grass</span>
                    <select className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none text-on-surface">
                      <option value="">Select crop</option>
                      <option value="wheat">Wheat</option>
                      <option value="rice">Rice (Paddy)</option>
                      <option value="corn">Sweet Corn</option>
                      <option value="potato">Potatoes</option>
                      <option value="tomato">Tomatoes</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50">keyboard_arrow_down</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Quantity & Unit</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">scale</span>
                      <input type="number" placeholder="e.g. 500" className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                    </div>
                    <select className="w-32 px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none text-on-surface font-medium">
                      <option value="kg">kg</option>
                      <option value="tons">Tons</option>
                      <option value="quintal">Quintal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Price per Unit (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant/50">₹</span>
                    <input type="number" placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                  </div>
                  <p className="text-xs text-primary-600 font-medium mt-1">Suggested market price: ₹20 - ₹25 / kg</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Location (Farm/Warehouse)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">location_on</span>
                    <input type="text" placeholder="e.g. Nashik, Maharashtra" className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Timeline & Quality */}
            <section>
              <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">calendar_month</span>
                2. Timeline & Quality
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/30 p-6 rounded-2xl border border-outline-variant/10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Harvest Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Estimated Expiry Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Description & Quality Badges</label>
                  <textarea rows={3} placeholder="Describe the quality, grade, farming methods, etc." className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface resize-none" />
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['Organic', 'Pesticide Free', 'Export Quality', 'Grade A', 'Washed'].map((badge) => (
                      <label key={badge} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-colors has-[:checked]:bg-primary-100 has-[:checked]:border-primary-500 has-[:checked]:text-primary-800 font-medium text-sm text-on-surface-variant">
                        <input type="checkbox" className="hidden" />
                        <span className="material-symbols-outlined text-[16px] text-primary-600 hidden checkbox-icon">check</span>
                        {badge}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Media */}
            <section>
              <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">image</span>
                3. Crop Images
              </h2>
              
              <div className="border-2 border-dashed border-outline-variant/50 rounded-2xl p-10 bg-surface-container-low/30 text-center hover:bg-primary-50/50 hover:border-primary-300 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                  <span className="material-symbols-outlined text-blue-500 text-3xl">add_photo_alternate</span>
                </div>
                <h3 className="font-bold text-on-surface mb-1">Click to upload or drag & drop</h3>
                <p className="text-sm text-on-surface-variant max-w-sm mx-auto">SVG, PNG, JPG or GIF (max. 5MB) High quality images increase trust and sales.</p>
              </div>
            </section>

            {/* Trust Banner */}
            <div className="bg-secondary-container rounded-2xl p-4 flex items-center gap-4 border border-secondary-container/50">
              <span className="material-symbols-outlined text-white text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <div>
                <h4 className="font-bold text-white text-sm">Escrow Protection Enabled</h4>
                <p className="text-white/80 text-xs mt-0.5">Payments for this listing will be secured by AgroChain smart escrow. You are guaranteed 100% payment upon delivery verification.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                Save Draft
              </button>
              <button type="button" className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">qr_code</span>
                Generate QR & Publish
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
