import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

function cropImg(crop: string) {
  const c = (crop || '').toLowerCase();
  if (c.includes('tomato'))  return '/product_tomatoes.png';
  if (c.includes('tulsi') || c.includes('spinach')) return '/product_tulsi.png';
  if (c.includes('milk') || c.includes('dairy'))    return '/product_milk.png';
  if (c.includes('berry') || c.includes('mango'))   return '/product_berries.png';
  return '/product_tomatoes.png';
}

export default function Checkout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWH, setSelectedWH] = useState('');
  const [loadingWH, setLoadingWH] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useState(() => {
    apiFetch<any[]>(`/supermarket/warehouses?buyer_id=${user.id}`)
      .then(setWarehouses)
      .finally(() => setLoadingWH(false));
  });

  const state = location.state as { batchId?: string; quantity?: number; totalAmount?: number; crop?: string; imageUrl?: string } | null;

  const crop        = state?.crop        || 'Produce';
  const quantity    = state?.quantity    || 0;
  const totalAmount = state?.totalAmount || 0;
  const batchId     = state?.batchId;
  const imageUrl    = state?.imageUrl    || cropImg(crop);

  const escrowFee   = Math.round(totalAmount * 0.02);
  const discount    = Math.round(escrowFee * 0.5);
  const payable     = totalAmount + escrowFee - discount;

  const handlePayment = async () => {
    if (!selectedWH) {
      setError('Please select a destination warehouse.');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      const buyer_id = user.id;
      if (!buyer_id) throw new Error('Please log in to place an order.');
      if (!batchId)  throw new Error('No batch selected. Go back and select a listing.');

      const order = await apiFetch<{ id: string }>('/supermarket/orders', {
        method: 'POST',
        body: JSON.stringify({ buyer_id, batch_id: batchId, quantity, warehouse_id: selectedWH }),
      });

      await apiFetch(`/supermarket/orders/${order.id}/pay`, { method: 'POST' });

      navigate('/market/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-4xl mx-auto animate-fade-in pb-10 lg:pb-20">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-center justify-between border-b border-gray-100 pb-4 sm:pb-6">
        <div>
           <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-900 transition-colors mb-1 sm:mb-2 flex items-center gap-1 bg-transparent border-none cursor-pointer">
               <span className="material-symbols-outlined text-[18px] sm:text-[24px]">arrow_back</span>
               <span className="text-xs sm:text-sm font-bold">Back to Listing</span>
           </button>
           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Secure Checkout</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span className="text-sm font-bold">256-bit Encrypted</span>
        </div>
      </div>

      {!batchId && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-5 py-4 text-sm font-medium">
          No batch selected. <Link to="/market/browse" className="font-bold underline">Go back to marketplace</Link>.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">

        {/* Left Col: Order Details */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Warehouse Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-primary-100 shadow-xl shadow-primary-900/5">
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-600">warehouse</span>
                    Delivery Destination
                </h3>
                {loadingWH ? (
                    <div className="h-12 bg-gray-50 animate-pulse rounded-xl"></div>
                ) : (
                    <div className="space-y-3">
                        {warehouses.length > 0 ? (
                            <select 
                                value={selectedWH}
                                onChange={e => setSelectedWH(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold text-sm focus:ring-4 focus:ring-primary-500/10 outline-none appearance-none"
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses.map(wh => (
                                    <option key={wh.id} value={wh.id}>{wh.name} ({wh.location})</option>
                                ))}
                            </select>
                        ) : (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-xs font-bold leading-relaxed">
                                You haven't added any warehouses yet. <Link to="/market/warehouses" className="underline">Add one now</Link> to proceed with checkout.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                <div className="w-full h-32 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl sm:rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                    <img src={imageUrl} alt={crop} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-1">{crop}</h3>
                    <p className="text-xs sm:text-sm font-bold text-gray-500 mb-3">
                      Batch #{batchId?.slice(0,8).toUpperCase() || '—'} • Escrow Protected
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded">
                           <span className="material-symbols-outlined text-[12px] sm:text-[14px]">scale</span> {quantity} kg
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            <span className="material-symbols-outlined text-[12px] sm:text-[14px]">water_drop</span> Escrow Covered
                        </span>
                    </div>
                </div>
            </div>

            {/* Escrow Banner */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur border border-white/20">
                        <span className="material-symbols-outlined text-[20px] sm:text-[28px] text-blue-100">shield_locked</span>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black mb-1.5 sm:mb-2 text-white">Guaranteed Trust via Escrow</h3>
                        <p className="text-blue-100/80 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 font-medium">
                            Your payment is held safely in our smart contract escrow. Funds are <b>only released</b> after you verify the physical delivery of the produce at your warehouse.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[10px] sm:text-xs font-bold text-blue-200">
                             <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px] sm:text-[14px]">check_circle</span> 100% Refundable</div>
                             <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px] sm:text-[14px]">check_circle</span> Automated Disputes</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: Payment Summary */}
        <div className="lg:col-span-5">
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 relative mt-6 lg:mt-0">
                
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Payment Summary</h3>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 text-xs sm:text-sm font-medium">
                    <div className="flex justify-between items-center text-gray-600">
                        <span>Produce Cost ({quantity} kg)</span>
                        <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                        <span>Platform Escrow Fee (2%)</span>
                        <span className="font-bold text-gray-900">₹{escrowFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                        <span>Verification Discount</span>
                        <span className="font-bold">-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="border-t border-gray-100 border-dashed pt-4 sm:pt-6 mb-6 sm:mb-8">
                    <div className="flex justify-between items-end">
                        <span className="text-base sm:text-lg font-bold text-gray-900">Total Payable</span>
                        <span className="text-3xl sm:text-4xl font-black text-primary-600 leading-none">₹{payable.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">{error}</div>}

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="relative w-full overflow-hidden bg-primary-600 text-white rounded-xl sm:rounded-2xl py-3.5 sm:py-4 lg:py-5 font-black text-base sm:text-lg shadow-xl shadow-primary-600/30 hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-wait group"
                >                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                    {isProcessing ? (
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                             <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Processing...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-[18px] sm:text-[20px]">account_balance</span>
                             Initialize Escrow Event
                        </div>
                    )}
                </button>
                <p className="text-center text-[10px] sm:text-xs text-gray-400 font-medium mt-3 sm:mt-4">
                     By clicking above, you agree to our Escrow Terms of Service.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}
