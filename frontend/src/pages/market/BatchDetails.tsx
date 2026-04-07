import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function BatchDetails() {
  const { id } = useParams();
  
  const batchId = id || 'AG-2041';

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto animate-fade-in pb-10 lg:pb-20">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 font-bold tracking-wide">
        <Link to="/market/browse" className="hover:text-primary-600 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">storefront</span>
            Marketplace
        </Link>
        <span className="material-symbols-outlined text-[14px] sm:text-[16px]">chevron_right</span>
        <span className="text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md truncate max-w-[120px] sm:max-w-none">Batch #{batchId}</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Visuals & Identity */}
        <div className="space-y-4 sm:space-y-6">
            {/* Main Image */}
            <div className="relative h-[250px] sm:h-[350px] md:h-[450px] bg-gray-100 rounded-2xl sm:rounded-[2.5rem] overflow-hidden group shadow-lg">
                <img 
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80" 
                    alt="Produce" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* QR Overlay Badge */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/90 backdrop-blur-md p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center border border-white/50 cursor-pointer hover:scale-105 transition-transform" title="Traceability QR Code">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gray-900 rounded-lg sm:rounded-xl flex items-center justify-center p-1">
                        <span className="material-symbols-outlined text-white text-[24px] sm:text-[32px]">qr_code_2</span>
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-1 sm:gap-2 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold">
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-green-400">verified</span>
                    Quality Verified
                </div>
            </div>

            {/* Thumbnail Gallery (Mock) */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
                <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-primary-500 opacity-100">
                    <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="thumb1" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                     <img src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="thumb2" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="thumb3" />
                </div>
                <div className="aspect-square bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 font-bold hover:bg-gray-200 cursor-pointer transition-colors text-sm sm:text-base">
                    +2
                </div>
            </div>

            {/* Trust Panel */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] sm:text-[24px]">shield</span>
                </div>
                <div>
                    <h4 className="text-blue-900 font-bold mb-1 text-sm sm:text-base">AgroChain Trust Layer</h4>
                    <p className="text-blue-700/80 text-xs sm:text-sm font-medium leading-relaxed">
                        This batch is cryptographically tracked from farm to warehouse. Your payment will be securely held in escrow and released only upon verified pickup and delivery.
                    </p>
                </div>
            </div>
        </div>

        {/* Right Column: Details & Action */}
        <div className="py-2 lg:py-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4 tracking-tight leading-none">Premium Organic Tomatoes</h1>
            <div className="flex items-end gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
              <span className="text-3xl sm:text-4xl font-black text-primary-600">₹45</span>
              <span className="text-lg sm:text-xl text-gray-400 font-bold pb-1">/kg</span>
              <div className="absolute top-0 right-0 lg:hidden flex gap-2">
                 <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded">In Stock</span>
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm p-5 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-4">
                 <div>
                     <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Farmer</span>
                     <div className="font-bold flex items-center gap-2 text-sm sm:text-base">
                         <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=11" alt="Farmer" /></div>
                         Arjun Singh
                     </div>
                 </div>
                 <div>
                     <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Location</span>
                     <span className="font-bold text-gray-900 text-sm sm:text-base">Pune, Maharashtra</span>
                 </div>
                 <div>
                     <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Harvest Date</span>
                     <span className="font-bold text-gray-900 text-sm sm:text-base">Oct 20, 2026</span>
                 </div>
                 <div>
                     <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Available Qty</span>
                     <span className="font-bold text-gray-900 text-sm sm:text-base">500 kg</span>
                 </div>
                 <div className="sm:col-span-2 pt-3 sm:pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Quality Grade</span>
                      <span className="bg-green-100 text-green-800 text-[10px] sm:text-sm font-black px-2 py-1 sm:px-3 sm:py-1 rounded-lg border border-green-200">Grade A (Export)</span>
                 </div>
              </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
              <label className="text-xs sm:text-sm font-bold text-gray-700 block ml-1 sm:ml-2">Order Quantity (kg)</label>
              <div className="flex gap-4">
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl sm:rounded-2xl flex items-center p-1.5 sm:p-2 shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                      <span className="material-symbols-outlined text-gray-400 ml-2 sm:ml-3 text-[20px] sm:text-[24px]">scale</span>
                      <input type="number" defaultValue="100" className="w-full border-none bg-transparent font-bold text-base sm:text-lg text-center focus:outline-none" />
                      <span className="pr-3 sm:pr-4 text-gray-400 font-bold text-sm sm:text-base">kg</span>
                  </div>
              </div>
          </div>

          {/* Action Area */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
             <div className="w-full flex justify-between sm:block sm:w-auto sm:flex-1 text-left">
                 <span className="text-xs sm:text-sm text-gray-500 font-bold block">Total Amount</span>
                 <span className="text-2xl sm:text-3xl font-black text-gray-900">₹4,500</span>
             </div>
             
             <Link to="/market/checkout" className="w-full sm:w-auto flex-1 md:flex-none md:min-w-[250px]">
                <button className="w-full group bg-primary-600 hover:bg-primary-700 text-white py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-xl shadow-primary-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    Checkout
                    <span className="material-symbols-outlined text-[18px] sm:text-[24px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
