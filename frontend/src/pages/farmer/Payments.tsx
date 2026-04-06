import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useVoice } from '../../context/VoiceContext';

interface PaymentData {
  totalEarnings: number;
  pendingPayments: number;
  releasedPayments: number;
  accounts: any[];
}

export default function Payments() {
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiFetch<PaymentData>(`/farmers/payments?farmer_id=${user.id}`);
        setData(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user.id) {
      fetchPayments();
    } else {
      setLoading(false);
      setError('User session not found. Please log in again.');
    }
  }, [user.id]);

  // ── Voice Control ──
  const voiceContext = `
PAGE_CONTEXT: Payments & Yield (Escrow)
Data:
- Wallet Balance (Released): ₹${data?.releasedPayments || 0}
- Pending in Escrow: ₹${data?.pendingPayments || 0}
- Total Contract Value: ₹${data?.totalEarnings || 0}

Transactions (${data?.accounts?.length || 0}):
${(data?.accounts || []).slice(0, 5).map((a: any) => `- Escrow for ${a.order?.batch?.crop}: ₹${a.total_amount} (Status: ${a.status})`).join('\n')}

No interactable actions available. Just answer questions based on this data.
  `.trim();

  useVoice(voiceContext, () => {});

  if (loading) return (
    <div className="p-10 text-center animate-pulse">
       <span className="material-symbols-outlined text-[48px] text-primary-200">payments</span>
       <p className="text-on-surface-variant font-bold mt-2">Loading Financial Data...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface">Payments & Yield</h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-2">Manage your earnings, escrow settlements, and financial history.</p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-3">
          <button className="bg-surface-container-lowest border border-outline-variant/30 font-bold px-4 sm:px-5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm">
             <span className="material-symbols-outlined text-[18px]">receipt_long</span> Statement
          </button>
          <button className="bg-primary-600 text-white font-bold px-5 sm:px-6 py-2.5 rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/20 active:scale-95 transition-all text-xs sm:text-sm">
            Withdraw
          </button>
        </div>
      </div>
      
      {/* ── Highlight KPI Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Balance Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-primary-600 to-primary-800 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[160px] sm:min-h-0">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div>
            <div className="flex items-center gap-2 text-primary-100 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Available Balance
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline tracking-tight leading-none">₹{data?.releasedPayments.toLocaleString('en-IN') || '0'}</div>
          </div>
          
          <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-primary-400/30 flex justify-between items-center text-[10px] sm:text-sm">
            <span className="text-primary-100 italic">Available for withdrawal</span>
            <span className="font-bold flex items-center gap-1">Net Earnings</span>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-6">
           <div className="bg-surface-container-lowest p-5 sm:p-6 flex flex-col justify-center rounded-3xl border border-outline-variant/10 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="absolute right-0 top-0 w-12 sm:w-16 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
              <div className="text-on-surface-variant text-[11px] sm:text-sm font-bold flex items-center gap-2 mb-1.5 sm:mb-2 text-balance">
                 <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]">lock_clock</span>
                 </div>
                 Pending in Escrow
              </div>
              <div className="text-xl sm:text-3xl font-extrabold font-headline text-on-surface leading-none">₹{data?.pendingPayments.toLocaleString('en-IN') || '0'}</div>
              <p className="text-[9px] sm:text-xs text-on-surface-variant mt-2 font-medium opacity-70">Auto-release on delivery</p>
           </div>
           
           <div className="bg-surface-container-lowest p-5 sm:p-6 flex flex-col justify-center rounded-3xl border border-outline-variant/10 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
              <div className="absolute right-0 top-0 w-12 sm:w-16 h-full bg-gradient-to-l from-amber-50 to-transparent"></div>
              <div className="text-on-surface-variant text-[11px] sm:text-sm font-bold flex items-center gap-2 mb-1.5 sm:mb-2">
                 <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]">payments</span>
                 </div>
                 Total Contract Value
              </div>
              <div className="text-xl sm:text-3xl font-extrabold font-headline text-on-surface leading-none">₹{data?.totalEarnings.toLocaleString('en-IN') || '0'}</div>
              <p className="text-[9px] sm:text-xs font-bold text-amber-600 mt-2 truncate">Cumulative order value</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* ── Transaction History ── */}
         <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-outline-variant/10 flex justify-between items-center">
               <h3 className="text-base sm:text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-600 text-[20px] sm:text-[24px]">list_alt</span>
                  History & Transactions
               </h3>
               <button className="text-xs sm:text-sm font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">View All</button>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left hidden sm:table">
                  <thead className="text-[10px] font-black tracking-wider uppercase text-on-surface-variant/70 border-b border-outline-variant/5">
                     <tr>
                        <th className="px-5 py-3">Transaction</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                     {data?.accounts.length === 0 && (
                        <tr><td colSpan={3} className="p-10 text-center text-on-surface-variant italic">No escrow records found.</td></tr>
                     )}
                     {data?.accounts.map((acc, i) => (
                        <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                           <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600`}>
                                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                       lock
                                    </span>
                                 </div>
                                 <div>
                                    <p className="font-bold text-sm text-on-surface">Escrow for {acc.order?.batch?.crop || 'Crop'}</p>
                                    <p className="text-xs text-on-surface-variant truncate w-40 sm:w-auto">Order ID: {acc.order?.id.slice(0, 8)}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide inline-block ${acc.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
                                 {acc.status === 'COMPLETED' ? 'Transferred' : acc.status}
                              </span>
                           </td>
                           <td className={`px-5 py-3.5 text-right font-extrabold text-sm text-on-surface`}>
                              ₹{acc.total_amount.toLocaleString('en-IN')}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>

               <div className="sm:hidden divide-y divide-outline-variant/5">
                  {data?.accounts.map((acc, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors">
                       <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600`}>
                             <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                lock
                             </span>
                          </div>
                          <div className="min-w-0">
                             <p className="font-bold text-xs text-on-surface truncate">Escrow: {acc.order?.batch?.crop}</p>
                             <p className="text-[10px] text-on-surface-variant truncate">Order: #{acc.order?.id.slice(0, 8)}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-xs text-on-surface">₹{acc.total_amount.toLocaleString('en-IN')}</p>
                          <span className={`text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded ${acc.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>{acc.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* ── Small Widgets Right Col ── */}
         <div className="space-y-6">
            
            {/* Payment Methods */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm p-6">
               <h3 className="text-base font-bold font-headline text-on-surface mb-4">Payout Method</h3>
               
               <div className="bg-surface-bright rounded-2xl p-4 border border-outline-variant/20 flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-blue-800 text-xl font-headline border border-outline-variant/10">
                     🏦
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-on-surface flex items-center gap-1">Primary Account <span className="material-symbols-outlined text-green-600 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span></p>
                     <p className="text-xs text-on-surface-variant font-mono">Linked Bank Details</p>
                  </div>
               </div>
               
               <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">add</span> Update Account
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
