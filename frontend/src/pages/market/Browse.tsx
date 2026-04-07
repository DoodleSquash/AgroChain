import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API } from '../../lib/api'

// Shape returned by the backend
interface Batch {
  id: string
  crop: string
  quantity: number
  price_per_unit: number
  harvest_date: string
  expiry_date: string | null
  location: string | null
  status: string
  farmer: { name: string }
  images: { image_url: string }[]
}

const CROP_TYPES   = ['All Produce', 'Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Grains']
const LOCATIONS    = ['All Locations', 'Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Rajasthan']
const PRICE_RANGES = ['Any Price', 'Under ₹500', '₹500–₹1,500', '₹1,500+']

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

function isExpiringSoon(expiry: string | null): boolean {
  if (!expiry) return false
  const diff = new Date(expiry).getTime() - Date.now()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function priceInRange(price: number, range: string): boolean {
  if (range === 'Any Price') return true
  if (range === 'Under ₹500') return price < 500
  if (range === '₹500–₹1,500') return price >= 500 && price <= 1500
  if (range === '₹1,500+') return price > 1500
  return true
}

export default function Browse() {
  const [batches, setBatches]       = useState<Batch[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [search, setSearch]         = useState('')
  const [cropType, setCropType]     = useState('All Produce')
  const [location, setLocation]     = useState('All Locations')
  const [priceRange, setPriceRange] = useState('Any Price')
  const [verifiedOnly, setVerified] = useState(false)
  const [wishlist, setWishlist]     = useState<string[]>([])

  useEffect(() => {
    document.body.style.background = '#f7f9fb'
    return () => { document.body.style.background = '' }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    setLoading(true)
    setError('')
    fetch(`${API}/supermarket/marketplace`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => {
        if (!r.ok) throw new Error(`Server error ${r.status}`)
        return r.json()
      })
      .then((data: Batch[]) => {
        setBatches(data)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const filtered = batches.filter(l => {
    if (search && !l.crop.toLowerCase().includes(search.toLowerCase()) &&
        !l.farmer.name.toLowerCase().includes(search.toLowerCase())) return false
    if (cropType !== 'All Produce' && l.crop.toLowerCase() !== cropType.toLowerCase()) return false
    if (location !== 'All Locations' && !(l.location || '').includes(location.split(',')[0])) return false
    if (!priceInRange(l.price_per_unit, priceRange)) return false
    return true
  })

  const toggleWish = (id: string) =>
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])

  return (
    <div className="flex flex-col min-h-svh bg-[#f7f9fb] text-[#191c1e]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div className="flex flex-1">
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-10 pb-28">

          {/* Page header */}
          <div className="flex flex-wrap items-end justify-between gap-6 mb-7">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-1.5">Marketplace</h1>
              <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
                Direct access to verified produce. All contracts secured via escrow for guaranteed delivery.
              </p>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2.5">
                <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 18 }}>search</span>
                <input
                  className="bg-transparent border-none outline-none text-sm w-40 text-[#191c1e]"
                  placeholder="Search crops, farmers…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Crop Type',   value: cropType,   set: setCropType,   opts: CROP_TYPES },
              { label: 'Location',    value: location,   set: setLocation,   opts: LOCATIONS },
              { label: 'Price Range', value: priceRange, set: setPriceRange, opts: PRICE_RANGES },
            ].map(f => (
              <div key={f.label} className="bg-[#e0e3e5] rounded-2xl px-4 py-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{f.label}</label>
                <select
                  className="w-full bg-transparent border-none outline-none text-sm font-semibold text-[#191c1e] cursor-pointer"
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                >
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="bg-[#e0e3e5] rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</label>
                <span className="text-sm font-semibold text-[#191c1e]">Verified Only</span>
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
              {loading ? 'Loading…' : `${filtered.length} listings found`}
            </span>
            <span className="text-[13px] text-gray-500">Sort by: <strong className="text-[#191c1e]">Freshest first</strong></span>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              Failed to load listings: {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-[28px] overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-[220px] bg-gray-100" />
                  <div className="p-5 space-y-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <span className="material-symbols-outlined block text-5xl mb-3">search_off</span>
                  <p className="font-semibold mb-1">
                    {batches.length === 0 ? 'No listings available yet.' : 'No listings match your filters.'}
                  </p>
                  {batches.length === 0 && (
                    <p className="text-sm text-gray-400">Farmers haven't listed any produce yet. Check back soon.</p>
                  )}
                </div>
              ) : filtered.map(l => {
                const cropLower = l.crop.toLowerCase()
                const imgSrc = l.images?.[0]?.image_url ||
                  (cropLower.includes('tomato') ? '/product_tomatoes.png' :
                   cropLower.includes('tulsi') || cropLower.includes('spinach') || cropLower.includes('herb') || cropLower.includes('leaf') || cropLower.includes('leaves') ? '/product_tulsi.png' :
                   cropLower.includes('milk') || cropLower.includes('dairy') ? '/product_milk.png' :
                   cropLower.includes('berry') || cropLower.includes('berr') || cropLower.includes('mango') || cropLower.includes('fruit') ? '/product_berries.png' :
                   '/product_tomatoes.png')
                const expiryWarn = isExpiringSoon(l.expiry_date)
                return (
                  <div key={l.id}
                    className="group bg-white rounded-[28px] overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.09)]">

                    {/* Image */}
                    <div className="relative h-[220px] overflow-hidden">
                      <img src={imgSrc} alt={l.crop}                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#006b2c] text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide">
                        <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>verified</span>
                        VERIFIED
                      </div>
                      <div className="absolute bottom-3 left-3 bg-[#006b2c] text-white text-base font-extrabold px-3.5 py-1 rounded-full">
                        ₹{l.price_per_unit.toLocaleString('en-IN')} <span className="text-[10px] font-normal opacity-80">/ unit</span>
                      </div>
                      <button
                        onClick={() => toggleWish(l.id)}
                        aria-label="Wishlist"
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer transition-all
                          ${wishlist.includes(l.id) ? 'bg-white text-red-600' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: wishlist.includes(l.id) ? "'FILL' 1" : "'FILL' 0" }}>
                          favorite
                        </span>
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-[17px] font-extrabold text-gray-900 leading-tight mb-1">{l.crop}</h3>
                          <div className="flex items-center gap-0.5 text-[12px] text-gray-500">
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                            {l.location || 'Location not specified'}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                          {l.crop}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Stars rating={4.5} />
                        <span className="text-[12px] text-gray-400">(verified)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#f2f4f6] rounded-xl px-3 py-2.5">
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Harvest</span>
                          <span className="text-[13px] font-semibold text-[#191c1e]">{fmtDate(l.harvest_date)}</span>
                        </div>
                        <div className="bg-[#f2f4f6] rounded-xl px-3 py-2.5">
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Expiry</span>
                          <span className={`text-[13px] font-semibold ${expiryWarn ? 'text-red-600' : 'text-[#191c1e]'}`}>
                            {fmtDate(l.expiry_date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>inventory_2</span>
                        {l.quantity} kg available
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-400 text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                            {l.farmer.name[0]}
                          </div>
                          <div>
                            <div className="text-[12px] font-bold text-[#191c1e]">{l.farmer.name}</div>
                            <div className="text-[10px] text-gray-400">{l.id.slice(0, 8).toUpperCase()}</div>
                          </div>
                        </div>
                        <Link
                          to={`/market/batch/${l.id}`}
                          className="bg-blue-700 text-white px-4 py-2 rounded-full text-[12px] font-bold hover:bg-blue-900 transition-all cursor-pointer whitespace-nowrap border-none no-underline">
                          Secure Asset
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Escrow trust bar */}
          <div className="bg-white rounded-3xl px-8 py-7 flex flex-wrap items-center gap-10 shadow-sm">
            <div className="flex items-start gap-4 max-w-sm">
              <span className="text-3xl shrink-0">🔒</span>
              <div>
                <h4 className="text-lg font-extrabold text-gray-900 mb-1.5">Escrow Protection Active</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Funds are held in a secure vault and only released upon your digital quality verification at delivery.
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-blue-700 mb-2">
                <span>Contract Commitment</span>
                <span>Quality Verification</span>
                <span>Final Settlement</span>
              </div>
              <div className="relative h-3 bg-blue-200 rounded-full">
                <div className="h-full w-[65%] bg-blue-700 rounded-full" />
                <div className="absolute top-1/2 left-[65%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-700 shadow-[0_0_16px_rgba(0,81,213,0.6)]" />
              </div>
            </div>
          </div>

        </main>
      </div>

    </div>
  )
}