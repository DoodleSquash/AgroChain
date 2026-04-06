import { Link } from 'react-router-dom';

const NAV_LINKS = ['How It Works', 'For Farmers', 'For Buyers', 'About'];

const HOW_IT_WORKS = [
  { step: '01', title: 'Farmer Creates Batch', desc: 'List your produce with crop details, quantity, price, and harvest date. A unique QR code is generated for every batch.', icon: '🌾' },
  { step: '02', title: 'Buyer Places Order', desc: 'Supermarkets browse verified listings and pay 100% into escrow — funds are secured before logistics begin.', icon: '🛒' },
  { step: '03', title: 'Link-Based Logistics', desc: 'Transporters and warehouses get token links — no app, no login. They scan the QR and upload proof at each stage.', icon: '🔗' },
  { step: '04', title: 'Verified Settlement', desc: 'Payment releases automatically on pickup and delivery confirmation. Disputes are held in escrow until resolved.', icon: '✅' },
];

const FARMER_FEATURES = [
  { icon: '💰', title: 'Guaranteed Payments', desc: 'Funds locked in escrow before your produce leaves the farm.' },
  { icon: '📦', title: 'QR Batch Identity', desc: 'Every batch gets a scannable digital identity for full traceability.' },
  { icon: '📊', title: 'Earnings Dashboard', desc: 'Track pending, partial, and released payments in one place.' },
  { icon: '📸', title: 'Proof at Every Stage', desc: 'Photo uploads and timestamps protect you from disputes.' },
];

const BUYER_FEATURES = [
  { icon: '🔍', title: 'Verified Listings', desc: 'Browse produce with harvest dates, expiry, and farmer trust scores.' },
  { icon: '🛡️', title: 'Escrow Protection', desc: 'Pay only releases when delivery is confirmed — zero risk.' },
  { icon: '🚚', title: 'Logistics Control', desc: 'Generate transport and warehouse links directly from your dashboard.' },
  { icon: '📍', title: 'Live Trace', desc: 'Track every batch from farm to shelf via public QR trace page.' },
];

const PRODUCTS = [
  { name: 'Fresh Berries', price: '₹500/kg', img: '/product_berries.png', farmer: 'Ravi Kumar', location: 'Nashik, MH' },
  { name: 'Organic Milk', price: '₹70/L', img: '/product_milk.png', farmer: 'Sunita Devi', location: 'Anand, GJ' },
  { name: 'Tomatoes', price: '₹50/kg', img: '/product_tomatoes.png', farmer: 'Arjun Singh', location: 'Pune, MH' },
  { name: 'Tulsi Leaves', price: '₹100/kg', img: '/product_tulsi.png', farmer: 'Meena Bai', location: 'Indore, MP' },
];

export default function Landing() {
  return (
    <div className="font-sans text-gray-900 bg-white overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8 text-sm">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-primary-600 tracking-tight">AgroChain</span>
          </Link>
          <ul className="flex-1 hidden md:flex items-center gap-1 font-medium text-gray-600">
            {NAV_LINKS.map(l => (
              <li key={l}>
                <a href="#" className="px-3 py-1.5 rounded-md hover:text-primary-600 hover:bg-primary-50 transition-colors">{l}</a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/auth" className="px-4 py-2 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors">Login</Link>
            <Link to="/auth" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-primary-500/20">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[85vh]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute w-[500px] h-[500px] bg-primary-600 top-[-100px] left-[-100px] rounded-full blur-[80px] opacity-15"></div>
          <div className="absolute w-[400px] h-[400px] bg-primary-300 bottom-[-80px] right-0 rounded-full blur-[80px] opacity-20"></div>
        </div>
        
        <div className="relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 font-semibold text-sm mb-6 shadow-sm">
            🌾 Trust Infrastructure for Agriculture
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Farm to Shelf,<br />
            <span className="text-primary-600">Guaranteed.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
            AgroChain connects farmers and supermarkets with escrow payments, QR batch traceability, and link-based logistics — no middlemen, no trust issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
            <Link to="/auth" className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-95 text-center">
              I'm a Farmer →
            </Link>
            <Link to="/auth" className="px-8 py-3.5 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold rounded-xl transition-all shadow-sm active:scale-95 text-center">
              I'm a Buyer →
            </Link>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary-600">100%</span>
              <span className="text-xs font-medium text-gray-500 mt-0.5">Escrow Protected</span>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary-600" style={{lineHeight: 1.2}}>QR</span>
              <span className="text-xs font-medium text-gray-500 mt-0.5">Every Batch Traced</span>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-bold text-primary-600">0</span>
              <span className="text-xs font-medium text-gray-500 mt-0.5">Login for Logistics</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-center lg:justify-end hidden sm:flex">
          <div className="relative w-full max-w-md">
            <img src="/farmer_banner.png" alt="Farmer with produce" className="w-full rounded-3xl object-cover shadow-2xl relative z-10" />
            
            {/* Floating Cards */}
            <div className="absolute top-8 -left-8 bg-white border border-gray-100 rounded-2xl p-4 shadow-xl z-20 flex gap-3 items-center w-52 transform -rotate-2 hover:rotate-0 transition-all cursor-default">
              <span className="text-2xl">🔒</span>
              <div>
                <div className="text-sm font-bold text-gray-900">Escrow Funded</div>
                <div className="text-xs text-gray-500">₹24,500 secured</div>
              </div>
            </div>

            <div className="absolute bottom-24 -left-12 bg-white border border-gray-100 rounded-2xl p-4 shadow-xl z-20 flex gap-3 items-center w-52 transform rotate-2 hover:rotate-0 transition-all cursor-default animate-bounce relative" style={{animationDuration: '3s'}}>
              <span className="text-2xl">📦</span>
              <div>
                <div className="text-sm font-bold text-gray-900">Batch #AG-2041</div>
                <div className="text-xs text-gray-500">QR Generated</div>
              </div>
            </div>

            <div className="absolute top-16 -right-6 bg-white border border-gray-100 rounded-2xl p-4 shadow-xl z-20 flex gap-3 items-center w-56 transform rotate-3 hover:rotate-0 transition-all cursor-default">
              <span className="text-2xl">✅</span>
              <div>
                <div className="text-sm font-bold text-gray-900">Delivered</div>
                <div className="text-xs text-primary-600 font-medium">Payment Released</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-24 px-6 border-y border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-primary-50 text-primary-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-16">
            From listing to settlement<br className="hidden sm:block" /> in four steps
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-primary-600/5 transition-all text-left group">
                <div className="text-sm font-bold text-primary-600 tracking-widest mb-4">{s.step}</div>
                <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform origin-left">{s.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACE OVERVIEW */}
      <section className="py-24 px-6 mx-auto max-w-7xl text-center">
        <Link to="/market/browse" className="inline-block px-4 py-1 bg-primary-50 text-primary-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6 hover:bg-primary-100 transition-colors">Marketplace</Link>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-12">Fresh produce, verified at source</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map(p => (
            <div key={p.name} className="bg-white rounded-3xl border border-gray-200 overflow-hidden text-left hover:shadow-2xl hover:shadow-gray-200/50 transition-all hover:-translate-y-1">
              <div className="relative">
                <img src={p.img} alt={p.name} className="w-full h-48 object-cover" />
                <div className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Verified ✓
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h3>
                <div className="text-xl font-extrabold text-primary-600 mb-2">{p.price}</div>
                <div className="flex items-center gap-1.5 text-sm py-2">
                  <span>🧑‍🌾</span>
                  <span className="text-gray-600 font-medium">{p.farmer}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-gray-500">{p.location}</span>
                </div>
                <Link to="/auth" className="block w-full text-center mt-3 bg-gray-50 hover:bg-primary-600 hover:text-white text-gray-700 font-semibold py-2.5 rounded-xl transition-colors border border-gray-200 hover:border-transparent">
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FARMER SECTION */}
      <section className="bg-white py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-block px-4 py-1 bg-primary-50 text-primary-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6">For Farmers</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Sell with confidence,<br />get paid on time
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              No more payment delays or middlemen eating your margins. AgroChain locks buyer funds in escrow before your produce moves — you get paid automatically when delivery is confirmed.
            </p>
            <Link to="/auth" className="inline-block px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95 mb-10">
              Join as Farmer →
            </Link>

            <div className="space-y-6">
              {FARMER_FEATURES.map(f => (
                <div key={f.title} className="flex gap-4 items-start">
                  <div className="text-2xl mt-1">{f.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{f.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-1 lg:order-2 flex justify-center">
            {/* Dashboard Mockup */}
            <div className="w-full max-w-sm bg-white rounded-[2rem] border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden relative">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Farmer Dashboard</div>
              </div>
              <div className="p-6 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-500 mb-1">Total Earnings</div>
                <div className="text-4xl font-extrabold text-primary-600">₹1,24,500</div>
                <div className="text-sm font-bold text-green-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  +₹18,200 this week
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { crop: 'Tomatoes', qty: '200 kg', status: 'Delivered', color: 'text-primary-600', bg: 'bg-primary-50' },
                  { crop: 'Berries', qty: '50 kg', status: 'In Transit', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { crop: 'Tulsi', qty: '30 kg', status: 'Pending', color: 'text-gray-500', bg: 'bg-gray-100' },
                ].map(o => (
                  <div key={o.crop} className="flex justify-between items-center">
                    <div className="font-semibold text-gray-800 text-sm">🌿 {o.crop} <span className="text-gray-400 font-normal mx-1">·</span> {o.qty}</div>
                    <div className={`${o.bg} ${o.color} text-xs font-bold px-3 py-1 rounded-full`}>{o.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUYER SECTION */}
      <section className="bg-gray-50 py-24 px-6 border-y border-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="flex justify-center">
            {/* Buyer Mockup */}
            <div className="w-full max-w-sm bg-white rounded-[2rem] border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden relative">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Buyer Dashboard</div>
              </div>
              <div className="p-6 border-b border-gray-100">
                <div className="text-sm font-bold text-gray-800 mb-4">Batch #AG-2041 · Tomatoes</div>
                <div className="relative border-l-2 border-gray-100 ml-2 space-y-6">
                  {['Created', 'Picked Up', 'In Warehouse', 'Delivered'].map((e, i) => (
                    <div key={e} className="relative pl-6">
                      <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${i < 3 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                      <div className={`text-sm font-semibold ${i < 3 ? 'text-gray-800' : 'text-gray-400'}`}>{e}</div>
                      {i === 2 && <div className="text-xs text-primary-600 mt-1 font-medium bg-primary-50 inline-block px-2 py-0.5 rounded">Current Status</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-bold text-gray-500 uppercase">Escrow Progress</div>
                  <div className="text-xs font-bold text-primary-600">65%</div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="w-[65%] h-full bg-gradient-to-r from-primary-600 to-green-400 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-400 font-medium">₹15,925 remaining to release</div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="inline-block px-4 py-1 bg-primary-50 text-primary-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6">For Buyers</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Source verified produce,<br />track every batch
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Browse fresh listings from verified farmers, pay securely into escrow, and track your order from farm to shelf — all from one dashboard.
            </p>
            <Link to="/auth" className="inline-block px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95 mb-10">
              Join as Buyer →
            </Link>

            <div className="space-y-6">
              {BUYER_FEATURES.map(f => (
                <div key={f.title} className="flex gap-4 items-start">
                  <div className="text-2xl mt-1">{f.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{f.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QR TRACE CALLOUT */}
      <section className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block px-4 py-1 bg-white/10 text-primary-200 border border-white/10 text-xs font-bold tracking-widest uppercase rounded-full mb-6">Public QR Trace</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-6">
              Scan any batch.<br />See the full journey.
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Every AgroChain batch has a public trace page — farmer info, pickup proof, warehouse logs, and delivery confirmation. No login needed.
            </p>
            <button className="px-7 py-3 bg-white text-primary-900 hover:bg-gray-100 font-bold rounded-xl transition-all shadow-lg active:scale-95">
              Try a Live Trace →
            </button>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-white text-gray-900 rounded-[2rem] p-8 shadow-2xl w-full max-w-xs transform rotate-3">
              <div className="flex justify-center mb-6">
                <div className="grid grid-cols-5 gap-1.5 w-32 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
              <div className="text-center mb-6 border-b border-gray-100 pb-4">
                <div className="font-bold text-gray-900 text-lg">Batch #AG-2041</div>
                <div className="text-sm font-medium text-gray-500">🍅 Tomatoes · 200 kg</div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs font-bold bg-primary-50 text-primary-700 px-3 py-1 rounded-full border border-primary-100">✓ Created</span>
                <span className="text-xs font-bold bg-primary-50 text-primary-700 px-3 py-1 rounded-full border border-primary-100">✓ Picked Up</span>
                <span className="text-xs font-bold bg-primary-50 text-primary-700 px-3 py-1 rounded-full border border-primary-100">✓ Stored</span>
                <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">⏳ Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Ready to build trust in agriculture?</h2>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">Join farmers and supermarkets already using AgroChain to trade with confidence.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/auth" className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95">
            Start as Farmer
          </Link>
          <Link to="/auth" className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-600 hover:text-primary-600 font-bold rounded-xl transition-all active:scale-95">
            Start as Buyer
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-bold text-white tracking-tight">AgroChain</span>
            </div>
            <p className="text-sm leading-relaxed">Trust infrastructure for agriculture. Bridging the gap between farmers and buyers with secure escrow and logistics tracking.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Marketplace</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Escrow</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">QR Trace</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Logistics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Users</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/auth" className="hover:text-primary-400 transition-colors">Farmers</Link></li>
              <li><Link to="/auth" className="hover:text-primary-400 transition-colors">Supermarkets</Link></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Transporters</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AgroChain. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
