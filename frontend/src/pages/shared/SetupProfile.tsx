import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { usePersistentState } from '../../hooks/usePersistentState';
import { useVoice } from '../../context/VoiceContext';

interface ProfileData {
  phone: string;
  location: string;
  bio: string;
  farmer_type: string;
  company_name: string;
  purchasing_prefs: string;
  buyer_type: string;
  price_range: string;
}

export default function SetupProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [data, setData] = usePersistentState<ProfileData>('setup_profile', {
    phone: '', location: '', bio: '', farmer_type: '', company_name: '', purchasing_prefs: '', buyer_type: '', price_range: ''
  });
  const [locating, setLocating] = useState(false);
  const [farmerTypes, setFarmerTypes] = useState<string[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [typeSearch, setTypeSearch] = useState('');


  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isFarmer = user.role === 'FARMER';
  const prefix = isFarmer ? '/farmers' : '/supermarket';

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const res = await apiFetch<any>(`/public/profile/${user.id}`);
        setData({
          phone: res.phone || '',
          location: res.profile?.location || '',
          bio: res.profile?.bio || '',
          farmer_type: res.profile?.farmer_type || '',
          company_name: res.profile?.company_name || '',
          purchasing_prefs: res.profile?.purchasing_prefs || '',
          buyer_type: res.profile?.buyer_type || '',
          price_range: res.profile?.price_range || ''
        });
        setTypeSearch(res.profile?.farmer_type || '');
      } catch (err) { }
    };

    const fetchTypes = async () => {
       try {
         const types = await apiFetch<any[]>('/public/farmer-types');
         setFarmerTypes(types.map(t => t.name));
       } catch (err) { }
    };

    if (user && user.id) {
      fetchCurrent();
      if (isFarmer) fetchTypes();
    }
  }, [user.id, isFarmer]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Simple reverse geocoding via OSM (Nominatim)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          const simplified = parts.slice(0, 3).join(',').trim();
          setData(prev => ({ ...prev, location: simplified }));
        } else {
          setData(prev => ({ ...prev, location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }));
        }
      } catch (err) {
        setData(prev => ({ ...prev, location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }));
      } finally {
        setLocating(false);
      }
    }, () => {
      alert("Unable to retrieve your location");
      setLocating(false);
    });
  };

  const filteredTypes = farmerTypes.filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await apiFetch(`${prefix}/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          phone: data.phone || null,
          location: data.location || null,
          bio: data.bio || null,
          farmer_type: isFarmer ? (data.farmer_type || null) : null,
          company_name: !isFarmer ? (data.company_name || null) : null,
          purchasing_prefs: !isFarmer ? (data.purchasing_prefs || null) : null,
          buyer_type: !isFarmer ? (data.buyer_type || null) : null,
          price_range: !isFarmer ? (data.price_range || null) : null,
        })
      });

      localStorage.removeItem('setup_profile');
      setSuccess(true);
      setTimeout(() => {
        navigate(isFarmer ? '/farmer/dashboard' : '/market/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  const showVoiceToast = (msg: string) => {
    setVoiceToast(msg);
    setTimeout(() => setVoiceToast(null), 4000);
  };

  const dataRef = React.useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // ── Voice Control ──
  const voiceContext = `
PAGE_CONTEXT: Edit Profile
Form State:
- Location: ${data.location || 'Not set'}
- Bio: ${data.bio || 'Not set'}
${isFarmer ? `- Farmer Type: ${data.farmer_type || 'Not set'}

Available Farmer Types (Suggest these if user asks):
${farmerTypes.join(', ')}
` : `- Company Name: ${data.company_name || 'Not set'}
- Buyer Type: ${data.buyer_type || 'Not set'}
- Request: ${data.purchasing_prefs || 'Not set'}
- Price Range: ${data.price_range || 'Not set'}

Available Buyer Types: Retailer, Wholesaler, Supermarket Chain, Restaurant/Hotel, Food Processor, Other
Available Price Ranges: Any Price, Under ₹500, ₹500–₹1,500, ₹1,500+
(Suggest these to the user if they ask what options they have)`}

Supported actions schema:
{
  "action": "SET_FIELDS" | "SUBMIT_PROFILE" | "USE_GPS",
  "fields": {
    "location": "city or null",
    "bio": "bio text or null",
    "farmer_type": "crop / farmer type or null",
    "company_name": "company name or null",
    "buyer_type": "buyer type or null",
    "purchasing_prefs": "request or null"
  }
}
  `.trim();

  const handleVoiceIntent = (intent: any) => {
    if (!intent) return;
    if (intent.action === 'SET_FIELDS') {
      const fields = intent.fields || {};
      const updates = { ...dataRef.current };
      let updated = false;
      
      if (fields.location) { updates.location = fields.location; updated = true; }
      if (fields.bio) { updates.bio = fields.bio; updated = true; }
      if (fields.farmer_type && isFarmer) { updates.farmer_type = fields.farmer_type; updated = true; setTypeSearch(fields.farmer_type); }
      if (fields.company_name && !isFarmer) { updates.company_name = fields.company_name; updated = true; }
      if (fields.buyer_type && !isFarmer) { updates.buyer_type = fields.buyer_type; updated = true; }
      if (fields.purchasing_prefs && !isFarmer) { updates.purchasing_prefs = fields.purchasing_prefs; updated = true; }
      
      if (updated) {
        setData(updates);
        showVoiceToast('✅ Form updated');
      }
    } else if (intent.action === 'SUBMIT_PROFILE') {
      showVoiceToast('🚀 Saving profile...');
      const dummyEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSave(dummyEvent);
    } else if (intent.action === 'USE_GPS') {
      showVoiceToast('📍 Fetching GPS location...');
      handleLocate();
    }
  };

  useVoice(voiceContext, handleVoiceIntent);

  return (
    <div className="flex flex-col min-h-svh text-[#191c1e]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Voice Action Toast */}
      {voiceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] bg-gray-900/95 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <span className="material-symbols-outlined text-[18px] text-green-400">mic</span>
          {voiceToast}
        </div>
      )}
      <main className="flex-1 min-w-0 px-6 py-8 lg:px-10 pb-28 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Edit Profile</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-lg leading-relaxed">
          Update your public profile details. This information will be visible to other users on the platform.
        </p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            Profile updated successfully
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-900 px-1">Mobile Number</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">call</span>
              <input
                type="tel"
                value={data.phone}
                onChange={e => setData({...data, phone: e.target.value})}
                placeholder="e.g. +91 98765 43210"
                className="bg-[#f7f9fb] border border-gray-100 placeholder:text-gray-400 font-medium text-sm pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-sm font-bold text-gray-900 px-1">Location</label>
            <div className="relative">
              <input 
                value={data.location}
                onChange={e => setData({...data, location: e.target.value})}
                placeholder="e.g. Nashik, Maharashtra"
                className="bg-[#f7f9fb] border border-gray-100 placeholder:text-gray-400 font-medium text-sm px-4 py-3.5 pr-12 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all w-full"
              />
              <button 
                type="button"
                onClick={handleLocate}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                title="Use current location"
              >
                {locating ? <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[18px]">my_location</span>}
              </button>
            </div>
          </div>

          {isFarmer ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-900 px-1">Farmer Type</label>
              <div className="relative">
                {/* Input with chevron icon */}
                <div className={`flex items-center bg-[#f7f9fb] border rounded-2xl transition-all ${showTypeDropdown ? 'bg-white border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-100'}`}>
                  <input
                    value={typeSearch}
                    onFocus={() => setShowTypeDropdown(true)}
                    onChange={e => {
                      setTypeSearch(e.target.value);
                      setData({ ...data, farmer_type: e.target.value });
                      if (!showTypeDropdown) setShowTypeDropdown(true);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = typeSearch.trim();
                        if (val) {
                          setData({ ...data, farmer_type: val });
                          setShowTypeDropdown(false);
                        }
                      }
                      if (e.key === 'Escape') setShowTypeDropdown(false);
                    }}
                    placeholder="Search or type a new farmer type..."
                    className="flex-1 bg-transparent border-none placeholder:text-gray-400 font-medium text-sm px-4 py-3.5 rounded-2xl outline-none"
                  />
                  {typeSearch ? (
                    <button
                      type="button"
                      onClick={() => { setTypeSearch(''); setData({ ...data, farmer_type: '' }); setShowTypeDropdown(true); }}
                      className="mr-3 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent p-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(v => !v)}
                      className="mr-3 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent p-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">{showTypeDropdown ? 'expand_less' : 'expand_more'}</span>
                    </button>
                  )}
                </div>

                {showTypeDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowTypeDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden max-h-64 overflow-y-auto">
                      {/* Label */}
                      {!typeSearch && farmerTypes.length > 0 && (
                        <div className="px-4 pt-3 pb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Most Popular</span>
                        </div>
                      )}
                      {/* Filtered existing types */}
                      {(typeSearch
                        ? farmerTypes.filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()))
                        : farmerTypes
                      ).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setData({ ...data, farmer_type: t });
                            setTypeSearch(t);
                            setShowTypeDropdown(false);
                          }}
                          className={`w-full text-left px-5 py-3 hover:bg-blue-50 text-sm transition-colors border-none bg-transparent cursor-pointer flex items-center justify-between group ${data.farmer_type === t ? 'text-blue-700 font-bold' : 'font-medium text-gray-800'}`}
                        >
                          <span>{t}</span>
                          {data.farmer_type === t && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                      ))}
                      {/* Add new custom type */}
                      {typeSearch.trim() && !farmerTypes.map(t => t.toLowerCase()).includes(typeSearch.trim().toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => {
                            const val = typeSearch.trim();
                            setData({ ...data, farmer_type: val });
                            setShowTypeDropdown(false);
                          }}
                          className="w-full text-left px-5 py-3.5 hover:bg-green-50 text-sm font-bold text-green-700 transition-colors border-none bg-transparent cursor-pointer border-t border-gray-100 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          Use "{typeSearch.trim()}" as new type
                        </button>
                      )}
                      {/* Empty state */}
                      {typeSearch && farmerTypes.filter(t => t.toLowerCase().includes(typeSearch.toLowerCase())).length === 0 && !typeSearch.trim() && (
                        <div className="px-5 py-4 text-sm text-gray-400 text-center">No matching types</div>
                      )}
                    </div>
                  </>
                )}
              </div>
              {/* Helper hint */}
              <p className="text-[11px] text-gray-400 px-1">
                Choose from the list or type a custom type and press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">Enter</kbd> — it'll be saved globally for all farmers.
              </p>
            </div>

          ) : (
             <>
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-bold text-gray-900 px-1">Company / Store Name</label>
                 <input 
                   value={data.company_name}
                   onChange={e => setData({...data, company_name: e.target.value})}
                   placeholder="e.g. FreshMart Groceries"
                   className="bg-[#f7f9fb] border border-gray-100 placeholder:text-gray-400 font-medium text-sm px-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all w-full"
                 />
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-bold text-gray-900 px-1">Buyer Type</label>
                 <select 
                   value={data.buyer_type}
                   onChange={e => setData({...data, buyer_type: e.target.value})}
                   className="bg-[#f7f9fb] border border-gray-100 font-medium text-sm px-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all w-full cursor-pointer"
                 >
                   <option value="" disabled>Select Type</option>
                   <option value="Retailer">Retailer</option>
                   <option value="Wholesaler">Wholesaler</option>
                   <option value="Supermarket">Supermarket Chain</option>
                   <option value="Restaurant">Restaurant/Hotel</option>
                   <option value="Processor">Food Processor</option>
                   <option value="Other">Other</option>
                 </select>
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-bold text-gray-900 px-1">Purchasing Request</label>
                 <textarea 
                   value={data.purchasing_prefs}
                   onChange={e => setData({...data, purchasing_prefs: e.target.value})}
                   placeholder="e.g. Looking to buy 500kg of tomatoes weekly..."
                   rows={3}
                   className="bg-[#f7f9fb] border border-gray-100 placeholder:text-gray-400 font-medium text-sm px-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all w-full resize-none"
                 />
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-bold text-gray-900 px-1">Price Range</label>
                 <select 
                   value={data.price_range}
                   onChange={e => setData({...data, price_range: e.target.value})}
                   className="bg-[#f7f9fb] border border-gray-100 font-medium text-sm px-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all w-full cursor-pointer"
                 >
                   <option value="" disabled>Select Preferred Price Range</option>
                   <option value="Any Price">Any Price</option>
                   <option value="Under ₹500">Under ₹500</option>
                   <option value="₹500–₹1,500">₹500–₹1,500</option>
                   <option value="₹1,500+">₹1,500+</option>
                 </select>
               </div>
             </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-900 px-1">Bio / About</label>
            <textarea 
              value={data.bio}
              onChange={e => setData({...data, bio: e.target.value})}
              placeholder="Tell others about yourself or your business..."
              rows={4}
              className="bg-[#f7f9fb] border border-gray-100 placeholder:text-gray-400 font-medium text-sm px-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all w-full resize-none"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate(isFarmer ? '/farmer/dashboard' : '/market/dashboard')}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors border-none cursor-pointer"
            >
               Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`bg-blue-700 text-white font-bold px-8 py-2.5 rounded-full hover:bg-blue-800 transition-colors cursor-pointer border-none shadow-[0_4px_12px_rgba(0,81,213,0.3)] flex items-center justify-center min-w-[120px] ${loading && 'opacity-60'}`}
            >
              {loading ? <span className="w-5 h-5 border-2 border-blue-200 border-t-white rounded-full animate-spin" /> : 'Save Profile'}
            </button>
          </div>
        </form>

      </main>
    </div>
  );
}
