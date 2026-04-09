import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../lib/api';
import { usePersistentState } from '../../hooks/usePersistentState';

interface Worker {
  id: string;
  name: string;
  email: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  workers: Worker[];
}

export default function Warehouses() {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWHModal, setShowWHModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [selectedWH, setSelectedWH] = useState<string | null>(null);
  
  const [whForm, setWHForm] = usePersistentState('wh_form', { name: '', location: '' });
  const [workerForm, setWorkerForm] = usePersistentState('wh_worker_form', { name: '', email: '' });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const fetchWarehouses = async () => {
    if (!user?.id) return;
    try {
      const data = await apiFetch<Warehouse[]>(`/supermarket/warehouses?buyer_id=${user.id}`);
      setWarehouses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [user?.id]);

  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const addr = data.address;
          const display = [
            addr.suburb || addr.neighbourhood || addr.city_district || '',
            addr.city || addr.town || addr.village || '',
            addr.state || ''
          ].filter(Boolean).join(', ');
          
          setWHForm(prev => ({ ...prev, location: display || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        } catch (err) {
          console.error(err);
          setWHForm(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        alert('Unable to retrieve your location. Please ensure site permissions are granted.');
      }
    );
  };

  const handleCreateWH = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { alert('Session invalid. Please login again.'); return; }
    try {
      await apiFetch('/supermarket/warehouses', {
        method: 'POST',
        body: JSON.stringify({ ...whForm, buyer_id: user.id })
      });
      setWHForm({ name: '', location: '' });
      localStorage.removeItem('wh_form');
      setShowWHModal(false);
      fetchWarehouses();
    } catch (err) { alert('Failed to create warehouse. Please try again.'); }
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWH) return;
    try {
      await apiFetch('/supermarket/warehouses/workers', {
        method: 'POST',
        body: JSON.stringify({ ...workerForm, warehouse_id: selectedWH })
      });
      setWorkerForm({ name: '', email: '' });
      localStorage.removeItem('wh_worker_form');
      setShowWorkerModal(false);
      fetchWarehouses();
    } catch (err) { alert('Failed to add worker'); }
  };

  const handleDeleteWH = async (id: string) => {
    if (!window.confirm('Delete this warehouse?')) return;
    try {
      await apiFetch(`/supermarket/warehouses/${id}`, { method: 'DELETE' });
      fetchWarehouses();
    } catch (err) { alert('Delete failed'); }
  };

  const handleRemoveWorker = async (id: string) => {
    try {
      await apiFetch(`/supermarket/warehouses/workers/${id}`, { method: 'DELETE' });
      fetchWarehouses();
    } catch (err) { alert('Remove failed'); }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>, whId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const workers = lines.slice(1).map(line => {
        const [name, email] = line.split(',');
        return { name: name?.trim(), email: email?.trim() };
      }).filter(w => w.name && w.email);

      if (workers.length === 0) { alert('Invalid CSV format. Use Name,Email'); return; }

      try {
        await apiFetch('/supermarket/warehouses/workers/csv', {
          method: 'POST',
          body: JSON.stringify({ warehouse_id: whId, workers })
        });
        fetchWarehouses();
        alert(`Imported ${workers.length} workers successfully!`);
      } catch (err) { alert('CSV Import failed'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto pb-24">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-[22px] sm:text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>warehouse</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none mb-1.5">{t('nav.buyer_portal')}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface leading-none">
                Warehouse Network
              </h1>
            </div>
          </div>
          <p className="text-on-surface-variant text-sm sm:text-base">
            Global storage management and personnel authorization.
          </p>
        </div>
        <button 
          onClick={() => setShowWHModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-br from-primary-500 to-primary-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-primary-600/30 hover:from-primary-400 hover:to-primary-600 transition-all active:scale-95 text-sm sm:text-base"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add_home</span>
          Add Warehouse
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
           <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
           <p className="text-on-surface-variant font-medium text-sm animate-pulse">Scanning infrastructure...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {warehouses.map(wh => (
            <div key={wh.id} className="bg-surface-container-lowest border border-outline-variant/10 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500">
              <div className="p-6 sm:p-8 bg-surface-container-low/30 border-b border-outline-variant/10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                  <h3 className="text-2xl font-bold font-headline text-on-surface mb-1.5">{wh.name}</h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px] text-primary-600">location_on</span>
                    {wh.location}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer bg-surface-container-lowest border border-outline-variant/20 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-primary-50 hover:text-primary-700 hover:border-primary-100 transition-all shadow-sm">
                    Import CSV
                    <input type="file" accept=".csv" className="hidden" onChange={e => handleCSVImport(e, wh.id)} />
                  </label>
                  <button 
                    onClick={() => { setSelectedWH(wh.id); setShowWorkerModal(true); }}
                    className="bg-primary-50 text-primary-700 border border-primary-100 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary-100 transition-all shadow-sm"
                  >
                    Add Staff
                  </button>
                  <button 
                    onClick={() => handleDeleteWH(wh.id)}
                    className="bg-error/5 text-error border border-error/10 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-error/10 transition-all shadow-sm ml-auto lg:ml-0"
                  >
                    Delete HUB
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary-100/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                  </div>
                  <span className="font-bold uppercase tracking-widest text-[11px] text-on-surface-variant">Authorized Personnel ({wh.workers.length})</span>
                </div>
                
                {wh.workers.length === 0 ? (
                  <div className="text-center py-12 bg-surface-container-low/20 rounded-[2rem] border-2 border-dashed border-outline-variant/10">
                    <p className="text-on-surface-variant font-medium text-sm">No personnel authorized for this location.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wh.workers.map(w => (
                      <div key={w.id} className="flex items-center justify-between p-4 bg-surface-container-low/30 border border-outline-variant/5 rounded-2xl hover:border-primary-200 transition-all group group-hover:bg-white shadow-sm">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-on-surface text-sm truncate">{w.name}</p>
                          <p className="text-xs text-on-surface-variant font-medium truncate">{w.email}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveWorker(w.id)}
                          className="w-9 h-9 rounded-xl text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all lg:opacity-0 lg:group-hover:opacity-100 flex items-center justify-center flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {warehouses.length === 0 && (
            <div className="text-center py-24 bg-surface-container-low/20 rounded-[3rem] border-2 border-dashed border-outline-variant/10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-6xl">warehouse</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Initialize Your Network</h3>
              <p className="text-on-surface-variant font-medium max-w-sm px-6">
                No storage facilities registered under your account yet. Add a warehouse to begin logistics flow.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Warehouse Modal ── */}
      {showWHModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-600" style={{ fontVariationSettings: "'FILL' 1" }}>add_home</span>
              </div>
              <h2 className="text-2xl font-bold font-headline text-on-surface">Add Warehouse</h2>
            </div>
            
            <form onSubmit={handleCreateWH} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Warehouse Name</label>
                <input 
                  required 
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-4 py-3.5 font-medium text-on-surface focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 text-sm" 
                  value={whForm.name} 
                  onChange={e => setWHForm({...whForm, name: e.target.value})} 
                  placeholder="e.g. Pune Central Hub"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Location</label>
                <div className="relative">
                  <input 
                    required 
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-4 py-3.5 pr-14 font-medium text-on-surface focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 text-sm" 
                    value={whForm.location} 
                    onChange={e => setWHForm({...whForm, location: e.target.value})} 
                    placeholder="Enter locality or use GPS"
                  />
                  <button 
                    type="button" 
                    onClick={handleGetCurrentLocation}
                    disabled={gpsLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-on-surface text-surface rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg"
                    title="Fetch GPS Location"
                  >
                    <span className={`material-symbols-outlined text-[20px] ${gpsLoading ? 'animate-spin' : ''}`}>
                      {gpsLoading ? 'sync' : 'my_location'}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowWHModal(false)} className="flex-1 py-3 px-6 font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-gradient-to-br from-primary-600 to-primary-800 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-primary-900/10 hover:shadow-primary-600/30 transition-all active:scale-95">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Worker Modal ── */}
      {showWorkerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-600" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
              </div>
              <h2 className="text-2xl font-bold font-headline text-on-surface">Authorize Staff</h2>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Staff Name</label>
                <input required className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-4 py-3.5 font-medium text-on-surface focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 text-sm" value={workerForm.name} onChange={e => setWorkerForm({...workerForm, name: e.target.value})} placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email (for Authorization)</label>
                <input type="email" required className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-4 py-3.5 font-medium text-on-surface focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 text-sm" value={workerForm.email} onChange={e => setWorkerForm({...workerForm, email: e.target.value})} placeholder="staff@company.com" />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowWorkerModal(false)} className="flex-1 py-3 px-6 font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-2xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-gradient-to-br from-primary-600 to-primary-800 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-primary-900/10 hover:shadow-primary-600/30 transition-all active:scale-95 text-sm">Authorize</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

