import React from 'react';

export default function Payments() {
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Payments & Yield</h1>
          <p className="text-on-surface-variant text-base mt-2">Manage your earnings, escrow settlements, and financial history.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-lowest border border-outline-variant/30 font-bold px-5 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-2 text-sm">
             <span className="material-symbols-outlined text-[18px]">receipt_long</span> Download Statement
          </button>
          <button className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-700 shadow-md shadow-primary-600/20 active:scale-95 transition-all text-sm">
            Withdraw Funds
          </button>
        </div>
      </div>
      
      {/* ── Highlight KPI Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div>
            <div className="flex items-center gap-2 text-primary-100 font-medium mb-2">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Available Balance
            </div>
            <div className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">₹1,24,500</div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-primary-400/30 flex justify-between items-center text-sm">
            <span className="text-primary-100">Last withdrawal: 2 days ago</span>
            <span className="font-bold flex items-center gap-1">₹45,000 <span className="material-symbols-outlined text-[14px]">arrow_upward</span></span>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="bg-surface-container-lowest p-6 flex flex-col justify-center rounded-3xl border border-outline-variant/10 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
              <div className="text-on-surface-variant text-sm font-bold flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                 </div>
                 Pending in Escrow
              </div>
              <div className="text-3xl font-extrabold font-headline text-on-surface">₹45,200</div>
              <p className="text-xs text-on-surface-variant mt-2 font-medium">Auto-releases upon delivery confirmations</p>
           </div>
           
           <div className="bg-surface-container-lowest p-6 flex flex-col justify-center rounded-3xl border border-outline-variant/10 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-amber-50 to-transparent"></div>
              <div className="text-on-surface-variant text-sm font-bold flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined text-[16px]">upcoming</span>
                 </div>
                 Next Expected Payout
              </div>
              <div className="text-3xl font-extrabold font-headline text-on-surface">12 Apr 2026</div>
              <p className="text-xs font-bold text-amber-600 mt-2">Estimated: ₹14,200 (1 batch)</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* ── Transaction History ── */}
         <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
               <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-600">list_alt</span>
                  Escrow & Transactions
               </h3>
               <button className="text-sm font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">View All</button>
            </div>
            
            <div className="p-2 overflow-x-auto">
               <table className="w-full text-left min-w-[500px]">
                  <thead className="text-[11px] font-black tracking-wider uppercase text-on-surface-variant/70 border-b border-outline-variant/5">
                     <tr>
                        <th className="px-4 py-3">Transaction</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                     {[
                        { title: 'Escrow Release', desc: 'Order #ORD-8799 Delivered', date: 'Today, 10:45 AM', type: 'credit', amount: '+ ₹9,600', status: 'Completed', sColor: 'text-green-600 bg-green-50' },
                        { title: 'Bank Withdrawal', desc: 'To HDFC Bank ****1234', date: '08 Apr 2026', type: 'debit', amount: '- ₹45,000', status: 'Completed', sColor: 'text-green-600 bg-green-50' },
                        { title: 'Escrow Locked', desc: 'New Order #ORD-8821', date: '07 Apr 2026', type: 'hold', amount: '₹14,200', status: 'In Escrow', sColor: 'text-blue-600 bg-blue-50' },
                        { title: 'Escrow Release', desc: 'Order #ORD-8750 Delivered', date: '05 Apr 2026', type: 'credit', amount: '+ ₹22,000', status: 'Completed', sColor: 'text-green-600 bg-green-50' },
                        { title: 'Escrow Locked', desc: 'New Order #ORD-8845', date: '04 Apr 2026', type: 'hold', amount: '₹3,800', status: 'In Escrow', sColor: 'text-blue-600 bg-blue-50' },
                     ].map((t, i) => (
                        <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                           <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                    ${t.type === 'credit' ? 'bg-green-100 text-green-600' : t.type === 'debit' ? 'bg-zinc-100 text-zinc-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                       {t.type === 'credit' ? 'arrow_downward' : t.type === 'debit' ? 'arrow_upward' : 'lock'}
                                    </span>
                                 </div>
                                 <div>
                                    <p className="font-bold text-sm text-on-surface">{t.title}</p>
                                    <p className="text-xs text-on-surface-variant truncate w-40 sm:w-auto">{t.desc}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-3.5 text-xs font-medium text-on-surface-variant flex items-center"><span className="material-symbols-outlined text-[14px] mr-1 opacity-50">calendar_today</span> {t.date}</td>
                           <td className="px-4 py-3.5">
                              <span className={`px-2 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide inline-block ${t.sColor}`}>{t.status}</span>
                           </td>
                           <td className={`px-4 py-3.5 text-right font-extrabold text-sm ${t.type === 'credit' ? 'text-green-600' : t.type === 'debit' ? 'text-on-surface' : 'text-blue-600'}`}>
                              {t.amount}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
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
                     <p className="text-sm font-bold text-on-surface flex items-center gap-1">HDFC Bank <span className="material-symbols-outlined text-green-600 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span></p>
                     <p className="text-xs text-on-surface-variant font-mono">**** **** 1234</p>
                  </div>
                  <button className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors flex items-center justify-center">
                     <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
               </div>
               
               <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">add</span> Add New Account
               </button>
            </div>

            {/* Income breakdown (Placeholder chart) */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm p-6">
               <h3 className="text-base font-bold font-headline text-on-surface mb-4">Earnings Breakdown</h3>
               
               <div className="h-40 flex items-end justify-between gap-2 border-b border-outline-variant/10 pb-2">
                  {/* Mock bar chart bars */}
                  {[30, 45, 25, 60, 80, 50, 100].map((h, i) => (
                     <div key={i} className="w-full bg-primary-100 rounded-t-lg relative group transition-all hover:bg-primary-200" style={{ height: `${h}%` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                           ₹{h * 100}
                        </div>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between mt-2 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
                  <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
               </div>
               
            </div>
         </div>
      </div>
      
    </div>
  );
}
