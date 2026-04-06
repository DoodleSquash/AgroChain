import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useVoice } from '../../context/VoiceContext';

interface BuyerProfile {
  location: string | null;
  company_name: string | null;
  purchasing_prefs: string | null;
  rating: number;
  review_count: number;
  buyer_type: string | null;
  price_range: string | null;
}

interface Buyer {
  id: string;
  name: string;
  is_verified: boolean;
  created_at: string;
  profile: BuyerProfile | null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-px">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-[13px] ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
      ))}
      <span className="text-[12px] font-bold text-gray-700 ml-1">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function ExploreBuyers() {
  const { t } = useTranslation();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [buyerType, setBuyerType] = useState('All Types');
  const [priceRange, setPriceRange] = useState('Any Price');
  const [purchasingFilter, setPurchasingFilter] = useState('');
  const [verifiedOnly, setVerified] = useState(false);

  // Reusable predefined options to match SetupProfile
  const PRICE_RANGES = ['Any Price', 'Under ₹500', '₹500–₹1,500', '₹1,500+'];
  const BUYER_TYPES = ['All Types', 'Retailer', 'Wholesaler', 'Supermarket', 'Restaurant', 'Processor', 'Other'];

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<Buyer[]>('/farmers/buyers');
        setBuyers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyers();
  }, []);

  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  const showVoiceToast = (msg: string) => {
    setVoiceToast(msg);
    setTimeout(() => setVoiceToast(null), 4000);
  };

  // ── Voice Control ──
  const voiceContext = `
PAGE_CONTEXT: Network / Buyes / Corporate Connections
Data:
- Total Buyers available: ${buyers.length}

Recent Buyers:
${buyers.slice(0, 8).map(b => `- ${b.name} (${b.profile?.company_name || 'No company'}) - Looking for: ${b.profile?.purchasing_prefs || 'Anything'}`).join('\n')}

Supported actions schema:
{
  "action": "FILTER_BUYERS",
  "fields": {
    "search": "buyer company or name to search or null",
    "location": "city or null",
    "type": "All Types" | "Retailer" | "Wholesaler" | "Supermarket" | "Restaurant" | "Processor" | "Other" or null,
    "product": "crop or product they are looking for or null"
  }
}
  `.trim();

  const handleVoiceIntent = (intent: any) => {
    if (!intent) return;
    if (intent.action === 'FILTER_BUYERS') {
      const f = intent.fields;
      if (typeof f.search === 'string') setSearch(f.search);
      if (typeof f.location === 'string') setLocation(f.location);
      if (typeof f.type === 'string' && BUYER_TYPES.includes(f.type)) setBuyerType(f.type);
      if (typeof f.product === 'string') setPurchasingFilter(f.product);
      showVoiceToast('✅ Filtering network');
    }
  };

  useVoice(voiceContext, handleVoiceIntent);

  const filtered = buyers.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !(b.profile?.company_name || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (location && !(b.profile?.location || '').toLowerCase().includes(location.toLowerCase())) return false;
    if (buyerType !== 'All Types' && b.profile?.buyer_type !== buyerType) return false;
    if (priceRange !== 'Any Price' && b.profile?.price_range !== priceRange) return false;
    if (purchasingFilter && !(b.profile?.purchasing_prefs || '').toLowerCase().includes(purchasingFilter.toLowerCase())) return false;
    if (verifiedOnly && !b.is_verified) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-svh text-[#191c1e]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Voice Action Toast */}
      {voiceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] bg-gray-900/95 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <span className="material-symbols-outlined text-[18px] text-green-400">mic</span>
          {voiceToast}
        </div>
      )}
      <main className="flex-1 min-w-0 px-6 py-8 lg:px-10 pb-28">
        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-7">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-1.5">Network</h1>
            <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
              Find and connect with verified buyers and retail chains looking for fresh produce.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2.5 shadow-sm">
              <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 18 }}>search</span>
              <input
                className="bg-transparent border-none outline-none text-sm w-48 text-[#191c1e]"
                placeholder="Search buyers or companies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Buyer Type</label>
            <select
              className="w-full bg-transparent border-none outline-none text-sm font-semibold text-[#191c1e] cursor-pointer"
              value={buyerType}
              onChange={e => setBuyerType(e.target.value)}
            >
              {BUYER_TYPES.map(o => <option key={o} value={o === 'Supermarket' ? 'Supermarket Chain' : o === 'Restaurant' ? 'Restaurant/Hotel' : o === 'Processor' ? 'Food Processor' : o}>{o}</option>)}
            </select>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</label>
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none text-sm font-semibold text-[#191c1e] placeholder:text-gray-400"
              placeholder="e.g. Mumbai..."
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Looking For</label>
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none text-sm font-semibold text-[#191c1e] placeholder:text-gray-400"
              placeholder="e.g. Tomatoes..."
              value={purchasingFilter}
              onChange={e => setPurchasingFilter(e.target.value)}
            />
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price Range</label>
            <select
              className="w-full bg-transparent border-none outline-none text-sm font-semibold text-[#191c1e] cursor-pointer"
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
            >
              {PRICE_RANGES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Verified Only Toggle */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('dashboard.verified')}</label>
              <span className="text-sm font-semibold text-[#191c1e]">{t('market.verified_only')}</span>
            </div>
            <button
              onClick={() => setVerified(v => !v)}
              aria-pressed={verifiedOnly}
              className={`relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors shrink-0 ${verifiedOnly ? 'bg-[#006b2c]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Results row */}
        <div className="flex justify-between items-center mb-5">
          <span className="text-[13px] text-gray-500">
            {loading ? 'Loading…' : `${filtered.length} buyers found`}
          </span>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            Failed to load buyers: {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-[28px] overflow-hidden border border-gray-100 animate-pulse p-6">
                <div className="h-16 w-16 bg-gray-100 rounded-full mb-4" />
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-gray-100 rounded-full" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                  <div className="h-8 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <span className="material-symbols-outlined block text-5xl mb-3">search_off</span>
                <p className="font-semibold mb-1">
                  No buyers match your search.
                </p>
              </div>
            ) : filtered.map(b => (
              <div key={b.id} className="group bg-white rounded-[28px] p-6 flex flex-col border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                
                <Link to={`/profile/${b.id}`} className="flex items-start gap-4 mb-4 no-underline group/link">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white text-[22px] font-bold flex items-center justify-center shrink-0 group-hover/link:scale-110 transition-transform">
                    {b.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-extrabold text-gray-900 leading-tight truncate group-hover/link:text-blue-700 transition-colors">{b.profile?.company_name || b.name}</h3>
                      {b.is_verified && (
                        <span className="material-symbols-outlined text-[#006b2c]" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>verified</span>
                      )}
                    </div>
                    {b.profile?.company_name && <div className="text-[13px] text-gray-600 font-medium">{b.name}</div>}
                    <div className="flex items-center gap-1 text-[12px] text-gray-400 mt-0.5">
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>location_on</span>
                      {b.profile?.location || 'Location not set'}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 mb-4">
                  <Stars rating={b.profile?.rating || 4.2} />
                  <span className="text-[12px] font-medium text-gray-400">({b.profile?.review_count || 12} Reviews)</span>
                </div>

                {b.profile?.purchasing_prefs && (
                  <div className="bg-[#f7f9fb] rounded-xl p-3 mb-5 border border-gray-100">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Purchasing Request</span>
                    <p className="text-[12px] font-semibold text-[#191c1e] line-clamp-2">
                      {b.profile.purchasing_prefs}
                    </p>
                  </div>
                )}

                <div className="mt-auto flex justify-between gap-2.5">
                  <Link
                    to={`/profile/${b.id}`}
                    className="flex-1 text-center bg-white border border-gray-200 text-gray-800 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-50 transition-all no-underline"
                  >
                    View Profile
                  </Link>
                  <button className="flex-1 bg-blue-700 text-white py-2.5 rounded-full text-[13px] font-bold hover:bg-blue-800 transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(0,81,213,0.2)]">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
                    Connect
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
