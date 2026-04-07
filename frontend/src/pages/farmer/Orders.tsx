import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API } from '../../lib/api';
import BuyerRiskModal from '../../components/farmer/BuyerRiskModal';

interface Order {
  id: string;
  buyer_id: string;
  buyer: { name: string; phone: string | null };
  batch: { crop: string; quantity: number };
  status: string;
  total_amount: number;
  created_at: string;
  escrow_account?: { status: string; total_amount: number; released_amount: number };
  jobs?: { id: string; type: string; status: string; token: string }[];
}

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [riskModal, setRiskModal] = useState<{ id: string; name: string } | null>(null);
  const [qrModal, setQrModal] = useState<{ token: string; crop: string } | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API}/farmers/orders?farmer_id=${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) fetchOrders();
  }, [user.id, API]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-200';
      case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT': return 'route';
      case 'PENDING': return 'inventory';
      case 'DELIVERED': return 'verified';
      case 'COMPLETED': return 'done_all';
      case 'CANCELLED': return 'cancel';
      default: return 'help';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1400px] mx-auto space-y-6 md:space-y-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface">{t('nav.orders')}</h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-2">{t('nav.management')}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

       {/* Quick Stats Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Active Orders', val: orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length.toString(), icon: 'shopping_cart', c: 'blue' },
            { label: 'Pending Pickup', val: orders.filter(o => o.status === 'PENDING').length.toString(), icon: 'local_shipping', c: 'amber' },
            { label: 'In Transit', val: orders.filter(o => o.status === 'IN_TRANSIT').length.toString(), icon: 'route', c: 'violet' },
            { label: 'Wallet Balance', val: '₹62,400', icon: 'account_balance_wallet', c: 'emerald' },
          ].map((s, i) => (
             <div key={i} className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/10 shadow-sm flex items-center gap-3 sm:gap-4 group hover:border-primary-200 transition-all">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform flex-shrink-0`}>
                   <span className="material-symbols-outlined text-[20px] sm:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div className="min-w-0">
                   <p className="text-[11px] sm:text-sm font-medium text-on-surface-variant truncate">{s.label}</p>
                   <p className="text-lg sm:text-2xl font-extrabold font-headline text-on-surface truncate">{s.val}</p>
                </div>
             </div>
          ))}
       </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col">
          
        {/* Table Toolbar */}
        <div className="p-4 border-b border-outline-variant/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-low/50">
           <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0">
             <span className="material-symbols-outlined text-on-surface-variant text-[20px]">filter_alt</span>
             <span className="text-sm font-bold text-on-surface-variant">Filter:</span>
             <select className="bg-white border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm font-medium outline-none text-on-surface">
                <option>All Orders</option>
                <option>Pending Pickup</option>
                <option>In Transit</option>
                <option>Completed</option>
             </select>
           </div>
           
           <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[18px]">search</span>
              <input type="text" placeholder="Search Order ID or Buyer..." className="w-full sm:w-64 pl-9 pr-4 py-1.5 bg-white border border-outline-variant/30 rounded-lg outline-none focus:border-primary-500 text-sm text-on-surface" />
           </div>
                {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center animate-pulse">
               <span className="material-symbols-outlined text-[48px] text-primary-200">orders</span>
               <p className="text-on-surface-variant font-bold mt-2">Loading Orders...</p>
            </div>
          ) : error ? (
            <div className="p-20 text-center">
               <span className="material-symbols-outlined text-[48px] text-red-200">error</span>
               <p className="text-red-600 font-bold mt-2">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center">
               <span className="material-symbols-outlined text-[48px] text-surface-container-high">inbox</span>
               <p className="text-on-surface-variant font-bold mt-2">No orders found yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-bright border-b border-outline-variant/20">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('nav.orders')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('nav.listings')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('nav.overview')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('ai.trust_shield')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('nav.payments')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">{t('nav.activity')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {orders.map((order) => {
                  const transportJob = order.jobs?.find(j => j.type === 'TRANSPORT' && j.status === 'PENDING');
                  
                  return (
                    <tr key={order.id} className="hover:bg-primary-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                             #ORD-{order.id.slice(0, 8)}
                           </span>
                           <span className="text-xs text-on-surface-variant font-medium">{order.buyer.name}</span>
                           <span className="text-[11px] text-on-surface-variant mt-1 opacity-70 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">schedule</span> {new Date(order.created_at).toLocaleDateString()}
                           </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-on-surface-variant">grass</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-on-surface">{order.batch.crop}</span>
                             <span className="text-xs font-medium text-gray-500">{order.quantity} kg</span>
                           </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold capitalize ${getStatusStyle(order.status)}`}>
                           <span className="material-symbols-outlined text-[14px]">{getStatusIcon(order.status)}</span>
                           {order.status.replace('_', ' ')}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                         <button 
                          onClick={() => setRiskModal({ id: order.buyer_id, name: order.buyer.name })}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 rounded-xl text-[11px] font-black text-white hover:bg-primary-700 transition-all shadow-md active:scale-95"
                         >
                           <span className="material-symbols-outlined text-[14px]">security</span>
                           {t('ai.trust_shield')}
                         </button>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-sm font-extrabold text-on-surface">₹{order.total_amount.toLocaleString('en-IN')}</span>
                           <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight">
                             {order.escrow_account?.status || 'Escrow Pending'}
                           </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                         <div className="flex flex-col items-end gap-2">
                           {transportJob && (
                             <button 
                               onClick={() => setQrModal({ token: transportJob.token, crop: order.batch.crop })}
                               className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                             >
                                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                                View Pickup QR
                             </button>
                           )}
                           <button className="w-9 h-9 rounded-full bg-white hover:bg-surface-container-low border border-outline-variant/30 text-on-surface flex items-center justify-center transition-colors shadow-sm">
                              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                           </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-outline-variant/10">
           {!loading && orders.length > 0 && orders.map((order) => {
              const transportJob = order.jobs?.find(j => j.type === 'TRANSPORT' && j.status === 'PENDING');
              return (
                <div key={order.id} className="p-4 space-y-4 hover:bg-primary-50/20 transition-colors">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-primary-700 uppercase tracking-tighter">#ORD-{order.id.slice(0, 8)}</span>
                         <h4 className="font-bold text-on-surface">{order.batch.crop}</h4>
                         <p className="text-xs text-on-surface-variant">{order.quantity} kg · {order.buyer.name}</p>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase ${getStatusStyle(order.status)}`}>
                         <span className="material-symbols-outlined text-[12px]">{getStatusIcon(order.status)}</span>
                         {order.status.replace('_', ' ')}
                      </div>
                   </div>

                   <div className="flex items-center justify-between py-2 border-y border-outline-variant/5">
                      <div className="flex flex-col">
                         <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-none mb-1">Payment</span>
                         <span className="text-base font-black text-on-surface leading-none">₹{order.total_amount.toLocaleString('en-IN')}</span>
                      </div>
                      <button 
                        onClick={() => setRiskModal({ id: order.buyer_id, name: order.buyer.name })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 rounded-lg text-[10px] font-black text-white shadow-md transition-all active:scale-95"
                      >
                         <span className="material-symbols-outlined text-[12px]">security</span>
                         Risk Check
                      </button>
                   </div>

                   <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        {transportJob && (
                          <button 
                            onClick={() => setQrModal({ token: transportJob.token, crop: order.batch.crop })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 rounded-lg text-[10px] font-bold text-white shadow-sm transition-all active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
                            Pickup QR
                          </button>
                        )}
                        <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface shadow-sm transition-colors hover:bg-surface-container-high active:scale-95">
                           <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>
                   </div>
                </div>
              );
           })}
           {!loading && orders.length === 0 && (
              <div className="p-10 text-center text-on-surface-variant">
                 <span className="material-symbols-outlined text-4xl opacity-20">inventory</span>
                 <p className="font-bold mt-2">No orders found.</p>
              </div>
           )}
        </div>      </div>
      </div>

      {/* Trust Shield Modal */}
      {riskModal && (
        <BuyerRiskModal 
          buyerId={riskModal.id} 
          buyerName={riskModal.name} 
          onClose={() => setRiskModal(null)} 
        />
      )}

      {/* Billing QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">local_shipping</span>
              </div>
              <h3 className="text-xl font-black">{t('logistics.picked_up')}</h3>
              <p className="text-emerald-100 text-xs mt-1 font-medium italic">Security Handover for {qrModal.crop}</p>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl mb-6 relative">
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrModal.token}`} 
                   alt="Pickup QR Code"
                   className="w-48 h-48"
                 />
                 <div className="absolute -top-2 -right-2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                 </div>
              </div>
              
              <div className="w-full space-y-4">
                 <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                   <p className="text-[11px] text-amber-800 font-bold leading-tight flex items-start gap-2">
                     <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0 text-amber-600">info</span>
                     Show this QR to the transporter. Once scanned, 50% of the funds will be released to your wallet instantly.
                   </p>
                 </div>
                 
                 <button 
                  onClick={() => setQrModal(null)}
                  className="w-full py-3 bg-gray-900 rounded-xl text-white text-sm font-black hover:bg-black transition-all active:scale-[0.98]"
                 >
                   Got it
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
