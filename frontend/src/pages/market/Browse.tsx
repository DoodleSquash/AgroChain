import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// ── Data ──────────────────────────────────────────────────────────────────────
const LISTINGS = [
  {
    id: 1, name: 'Premium Roma Tomatoes', crop: 'Vegetables',
    price: '₹1,200', unit: 'ton', qty: '500 kg available',
    farmer: 'Arjun Singh', location: 'Pune, Maharashtra',
    harvest: 'Apr 12, 2025', expiry: 'Apr 28, 2025', expiryWarn: true,
    img: '/product_tomatoes.png', rating: 4.8, reviews: 124,
    verified: true, batchId: 'AG-2041',
  },
  {
    id: 2, name: 'Fresh Tulsi Leaves', crop: 'Herbs',
    price: '₹850', unit: 'ton', qty: '200 kg available',
    farmer: 'Meena Bai', location: 'Indore, MP',
    harvest: 'Apr 14, 2025', expiry: 'May 02, 2025', expiryWarn: false,
    img: '/product_tulsi.png', rating: 4.9, reviews: 89,
    verified: true, batchId: 'AG-2042',
  },
  {
    id: 3, name: 'Organic Berries Mix', crop: 'Fruits',
    price: '₹2,400', unit: 'ton', qty: '150 kg available',
    farmer: 'Ravi Kumar', location: 'Nashik, Maharashtra',
    harvest: 'Apr 10, 2025', expiry: 'Apr 22, 2025', expiryWarn: true,
    img: '/product_berries.png', rating: 4.7, reviews: 210,
    verified: true, batchId: 'AG-2043',
  },
  {
    id: 4, name: 'Farm Fresh Milk', crop: 'Dairy',
    price: '₹70', unit: 'litre', qty: '1,000 L available',
    farmer: 'Sunita Devi', location: 'Anand, Gujarat',
    harvest: 'Apr 10, 2025', expiry: 'Apr 14, 2025', expiryWarn: true,
    img: '/product_milk.png', rating: 4.9, reviews: 340,
    verified: true, batchId: 'AG-2044',
  },
  {
    id: 5, name: 'Alphonso Mangoes', crop: 'Fruits',
    price: '₹3,200', unit: 'ton', qty: '800 kg available',
    farmer: 'Prakash Naik', location: 'Ratnagiri, MH',
    harvest: 'Apr 08, 2025', expiry: 'Apr 25, 2025', expiryWarn: false,
    img: '/product_berries.png', rating: 5.0, reviews: 56,
    verified: true, batchId: 'AG-2045',
  },
  {
    id: 6, name: 'Baby Spinach Leaves', crop: 'Vegetables',
    price: '₹600', unit: 'ton', qty: '300 kg available',
    farmer: 'Kavita Sharma', location: 'Jaipur, Rajasthan',
    harvest: 'Apr 11, 2025', expiry: 'May 10, 2025', expiryWarn: false,
    img: '/product_tulsi.png', rating: 4.6, reviews: 78,
    verified: false, batchId: 'AG-2046',
  },
]

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

export default function Browse() {
  const [search, setSearch]         = useState('')
  const [cropType, setCropType]     = useState('All Produce')
  const [location, setLocation]     = useState('All Locations')
  const [priceRange, setPriceRange] = useState('Any Price')
  const [verifiedOnly, setVerified] = useState(false)
  const [wishlist, setWishlist]     = useState<number[]>([])

  useEffect(() => {
    document.body.style.background = '#f7f9fb'
    return () => { document.body.style.background = '' }
  }, [])

  const filtered = LISTINGS.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) &&
        !l.farmer.toLowerCase().includes(search.toLowerCase())) return false
    if (cropType !== 'All Produce' && l.crop !== cropType) return false
    if (location !== 'All Locations' && !l.location.includes(location.split(',')[0])) return false
    if (verifiedOnly && !l.verified) return false
    return true
  })

  const toggleWish = (id: number) =>
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])

  return (
    <div className="flex flex-col min-h-svh bg-[#f7f9fb] text-[#191c1e]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* TOP BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/85 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 gap-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
            <span className="text-xl">🌿</span>
            <span className="text-lg font-extrabold text-[#006b2c] tracking-tight">AgroChain</span>
          </Link>
          <nav className="hidden md:flex gap-1">
            {['Dashboard', 'Marketplace', 'Orders'].map(n => (
              <a key={n} href="#"
                className={`no-underline text-sm font-medium px-3 py-1.5 transition-all
                  ${n === 'Marketplace'
                    ? 'text-[#006b2c] font-bold border-b-2 border-[#006b2c]'
                    : 'text-gray-500 rounded-lg hover:bg-green-50 hover:text-green-600'}`}>
                {n}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 bg-[#f2f4f6] rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 18 }}>search</span>
            <input
              className="bg-transparent border-none outline-none text-sm w-48 text-[#191c1e]"
              placeholder="Search crops, farmers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-600 border-2 border-white" />
          </button>
          <button className="p-2 rounded-full text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
          </button>
          <span className="text-xs font-bold text-[#006b2c] bg-green-50 border border-green-200 px-3 py-1 rounded-full whitespace-nowrap">
            Supermarket
          </span>
        </div>
      </header>

      <div className="flex flex-1 pt-16">

        {/* MAIN */}
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
              <button className="flex items-center gap-1.5 bg-[#e0e3e5] text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-300 transition-colors cursor-pointer border-none">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
                Filters
              </button>
              <button className="flex items-center gap-1.5 bg-[#006b2c] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#005320] transition-colors cursor-pointer border-none shadow-lg shadow-green-900/20">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                New Request
              </button>
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
            <span className="text-[13px] text-gray-500">{filtered.length} listings found</span>
            <span className="text-[13px] text-gray-500">Sort by: <strong className="text-[#191c1e]">Freshest first</strong></span>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <span className="material-symbols-outlined block text-5xl mb-3">search_off</span>
                <p>No listings match your filters.</p>
              </div>
            ) : filtered.map(l => (
              <div key={l.id}
                className="group bg-white rounded-[28px] overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.09)]">

                {/* Image */}
                <div className="relative h-[220px] overflow-hidden">
                  <img src={l.img} alt={l.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  {l.verified && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#006b2c] text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide">
                      <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>verified</span>
                      VERIFIED
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-[#006b2c] text-white text-base font-extrabold px-3.5 py-1 rounded-full">
                    {l.price} <span className="text-[10px] font-normal opacity-80">/ {l.unit}</span>
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
                      <h3 className="text-[17px] font-extrabold text-gray-900 leading-tight mb-1">{l.name}</h3>
                      <div className="flex items-center gap-0.5 text-[12px] text-gray-500">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                        {l.location}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      {l.crop}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Stars rating={l.rating} />
                    <span className="text-[12px] text-gray-400">({l.reviews})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#f2f4f6] rounded-xl px-3 py-2.5">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Harvest</span>
                      <span className="text-[13px] font-semibold text-[#191c1e]">{l.harvest}</span>
                    </div>
                    <div className="bg-[#f2f4f6] rounded-xl px-3 py-2.5">
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Expiry</span>
                      <span className={`text-[13px] font-semibold ${l.expiryWarn ? 'text-red-600' : 'text-[#191c1e]'}`}>{l.expiry}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>inventory_2</span>
                    {l.qty}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-400 text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                        {l.farmer[0]}
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#191c1e]">{l.farmer}</div>
                        <div className="text-[10px] text-gray-400">#{l.batchId}</div>
                      </div>
                    </div>
                    <button className="bg-blue-700 text-white px-4 py-2 rounded-full text-[12px] font-bold hover:bg-blue-900 transition-all cursor-pointer whitespace-nowrap border-none">
                      Secure Asset
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

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

      {/* BOTTOM NAV (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white/90 backdrop-blur-xl border-t border-gray-200 rounded-t-3xl px-4 pt-3 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {[
          { icon: 'home',         label: 'Home',   active: false },
          { icon: 'storefront',   label: 'Market', active: true  },
          { icon: 'receipt_long', label: 'Orders', active: false },
          { icon: 'payments',     label: 'Wallet', active: false },
        ].map(({ icon, label, active }) => (
          <a key={label} href="#"
            className={`flex flex-col items-center gap-0.5 no-underline text-[10px] font-semibold px-3 py-1.5 rounded-2xl transition-all
              ${active ? 'bg-[#006b2c] text-white shadow-lg scale-110' : 'text-gray-400'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
          </a>
        ))}
      </nav>

    </div>
  )
}
