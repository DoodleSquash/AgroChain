import React, { useState } from 'react';

export default function Logistics() {
  const [copiedTransport, setCopiedTransport] = useState(false);
  const [copiedWarehouse, setCopiedWarehouse] = useState(false);

  const handleCopy = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto animate-fade-in pb-10 lg:pb-20">
      <div className="mb-6 md:mb-12 text-left md:text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1 sm:mb-2">Logistics Control Tower</h1>
        <p className="text-sm sm:text-lg text-gray-500 font-medium leading-relaxed max-w-2xl">Generate magic links that allow transporters and warehouses to interact with the system without needing an app or login.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
        
        {/* Transport Links Panel */}
        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden flex flex-col h-full">
          {/* Header Graphic */}
          <div className="hidden sm:flex absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-blue-50 rounded-bl-[80px] sm:rounded-bl-[100px] items-start justify-end p-4 sm:p-6 -z-0">
             <span className="material-symbols-outlined text-4xl sm:text-5xl text-blue-200">local_shipping</span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                 <span className="material-symbols-outlined text-blue-500 sm:hidden">local_shipping</span>
                 Transport Links
              </h2>
              <p className="text-gray-500 font-medium text-xs sm:text-sm mb-6 sm:mb-8 sm:pr-12 leading-relaxed">
                 Assign jobs to truck drivers. The link authorizes them to scan the batch QR and mark pickup events.
              </p>

              <form className="space-y-4 sm:space-y-5 mb-6 sm:mb-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select Active Order</label>
                      <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-bold text-sm sm:text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                          <option>ORD-7721 - Premium Tomatoes (100kg)</option>
                          <option>ORD-7719 - Red Onions (500kg)</option>
                      </select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Driver Name</label>
                          <input type="text" placeholder="e.g. Ramesh K." className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-sm sm:text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Vehicle No.</label>
                          <input type="text" placeholder="MH-12-AB-3456" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-sm sm:text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 uppercase" />
                      </div>
                  </div>

                  <button className="w-full py-3 sm:py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md active:scale-[0.98] mt-2 sm:mt-0">
                      Generate Link
                  </button>
              </form>

              {/* Mock Generated Link Result */}
              <div className="mt-auto bg-blue-50/50 border border-blue-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                       <span className="text-[10px] sm:text-xs font-bold text-blue-800 tracking-wide uppercase">Active Link</span>
                       <span className="text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded">Expires in 24h</span>
                  </div>
                  <div className="flex gap-2">
                      <div className="flex-1 truncate bg-white border border-blue-100 rounded-lg p-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-500 font-mono">
                          https://agrochain.app/delivery/tk_9f8a...
                      </div>
                      <button 
                         onClick={() => handleCopy(setCopiedTransport)}
                         className="flex items-center justify-center w-8 sm:w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                      >
                         <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                             {copiedTransport ? 'check' : 'content_copy'}
                         </span>
                      </button>
                  </div>
              </div>
          </div>
        </div>

        {/* Warehouse Links Panel */}
        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden flex flex-col h-full">
           {/* Header Graphic */}
           <div className="hidden sm:flex absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-amber-50 rounded-bl-[80px] sm:rounded-bl-[100px] items-start justify-end p-4 sm:p-6 -z-0">
             <span className="material-symbols-outlined text-4xl sm:text-5xl text-amber-200">apartment</span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
                 <span className="material-symbols-outlined text-amber-500 sm:hidden">apartment</span>
                 Warehouse Links
              </h2>
              <p className="text-gray-500 font-medium text-xs sm:text-sm mb-6 sm:mb-8 sm:pr-12 leading-relaxed">
                 Provide warehouse managers access to log quality checks, weight, and storage conditions.
              </p>

              <form className="space-y-4 sm:space-y-5 mb-6 sm:mb-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select Active Batch</label>
                      <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-bold text-sm sm:text-base focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer">
                          <option>Batch #AG-2041 (In Transit)</option>
                      </select>
                  </div>
                  
                  <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Warehouse Facility / Handler</label>
                      <input type="text" placeholder="e.g. Pune Central Storage" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-sm sm:text-base focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder-gray-400" />
                  </div>

                   <button className="w-full py-3 sm:py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md active:scale-[0.98] mt-2 sm:mt-[1.6rem]">
                      Generate Link
                  </button>
              </form>

               {/* Mock Generated Link Result */}
               <div className="mt-auto bg-amber-50/50 border border-amber-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                       <span className="text-[10px] sm:text-xs font-bold text-amber-800 tracking-wide uppercase">Active Link</span>
                       <span className="text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded">Expires in 48h</span>
                  </div>
                  <div className="flex gap-2">
                      <div className="flex-1 truncate bg-white border border-amber-100 rounded-lg p-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-500 font-mono">
                          https://agrochain.app/warehouse/tk_2a7b...
                      </div>
                      <button 
                         onClick={() => handleCopy(setCopiedWarehouse)}
                         className="flex items-center justify-center w-8 sm:w-10 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-sm"
                      >
                         <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                             {copiedWarehouse ? 'check' : 'content_copy'}
                         </span>
                      </button>
                  </div>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
