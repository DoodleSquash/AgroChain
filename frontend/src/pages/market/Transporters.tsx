import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../lib/api';

interface Transporter {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function Transporters() {
  const { t } = useTranslation();
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const fetchTransporters = async () => {
    if (!user?.id) return;
    try {
      const data = await apiFetch<Transporter[]>(`/supermarket/transporters?buyer_id=${user.id}`);
      setTransporters(data);
    } catch (err) {
      console.error('[Transporters] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { alert('Session expired. Please login again.'); return; }
    try {
      await apiFetch('/supermarket/transporters', {
        method: 'POST',
        body: JSON.stringify({ ...form, buyer_id: user.id })
      });
      setForm({ name: '', email: '', phone: '' });
      setShowModal(false);
      fetchTransporters();
    } catch (err: any) {
      alert(err.message || 'Failed to add transporter. Please check your connection.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transporter?')) return;
    try {
      await apiFetch(`/supermarket/transporters/${id}`, { method: 'DELETE' });
      fetchTransporters();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto pb-24">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-[22px] sm:text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none mb-1.5">{t('nav.buyer_portal')}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface leading-none">
                Transporter Directory
              </h1>
            </div>
          </div>
          <p className="text-on-surface-variant text-sm sm:text-base">
            Manage your network of trusted logistics and delivery partners.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-br from-primary-500 to-primary-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-primary-600/30 hover:from-primary-400 hover:to-primary-600 transition-all active:scale-95 text-sm sm:text-base"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add_circle</span>
          Add Partner
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
           <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
           <p className="text-on-surface-variant font-medium text-sm animate-pulse">Loading partners...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transporters.map(t => (
            <div key={t.id} className="group bg-surface-container-lowest border border-outline-variant/10 p-6 sm:p-7 rounded-[2rem] shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300 relative overflow-hidden">
              {/* Decorative Background Icon */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-[3rem] flex items-center justify-center translate-x-4 -translate-y-4 opacity-40 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-500">
                <span className="material-symbols-outlined text-primary-300 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              </div>
              
              <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-xl font-bold font-headline text-on-surface mb-5">{t.name}</h3>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant bg-surface-container-low/50 p-2.5 rounded-xl border border-outline-variant/5">
                    <span className="material-symbols-outlined text-[20px] text-primary-600">mail</span>
                    <span className="truncate">{t.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant bg-surface-container-low/50 p-2.5 rounded-xl border border-outline-variant/5">
                    <span className="material-symbols-outlined text-[20px] text-primary-600">call</span>
                    {t.phone}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-600/60 bg-primary-50 px-2 py-0.5 rounded-md">Verified</span>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="text-error hover:text-red-700 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors opacity-60 hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {transporters.length === 0 && (
             <div className="col-span-full border-2 border-dashed border-outline-variant/20 rounded-[3rem] py-20 flex flex-col items-center justify-center text-center bg-surface-container-low/30">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl">person_search</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">No Partners Found</h3>
                <p className="text-on-surface-variant text-sm max-w-md px-6">
                  You haven't added any transporters yet. Add your trusted partners to start managing deliveries.
                </p>
             </div>
          )}
        </div>
      )}

      {/* ── Add Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-600" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
              </div>
              <h2 className="text-2xl font-bold font-headline text-on-surface">New Transporter</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Company / Name</label>
                <input 
                  required 
                  placeholder="Enter logistics name"
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-4 py-3.5 font-medium text-on-surface focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 text-sm"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                <input 
                  type="email" required 
                  placeholder="contact@logistics.com"
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-4 py-3.5 font-medium text-on-surface focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 text-sm"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Contact Number</label>
                <input 
                  required 
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-4 py-3.5 font-medium text-on-surface focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 text-sm"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
              
              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-6 font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-2xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-br from-primary-600 to-primary-800 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-primary-900/10 hover:shadow-primary-600/30 hover:from-primary-500 hover:to-primary-700 transition-all active:scale-95 text-sm"
                >
                  Add Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

