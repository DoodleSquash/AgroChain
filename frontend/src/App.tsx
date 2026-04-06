import './App.css'

const NAV_LINKS = ['How It Works', 'For Farmers', 'For Buyers', 'About']

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Farmer Creates Batch',
    desc: 'List your produce with crop details, quantity, price, and harvest date. A unique QR code is generated for every batch.',
    icon: '🌾',
  },
  {
    step: '02',
    title: 'Buyer Places Order',
    desc: 'Supermarkets browse verified listings and pay 100% into escrow — funds are secured before logistics begin.',
    icon: '🛒',
  },
  {
    step: '03',
    title: 'Link-Based Logistics',
    desc: 'Transporters and warehouses get token links — no app, no login. They scan the QR and upload proof at each stage.',
    icon: '🔗',
  },
  {
    step: '04',
    title: 'Verified Settlement',
    desc: 'Payment releases automatically on pickup and delivery confirmation. Disputes are held in escrow until resolved.',
    icon: '✅',
  },
]

const FARMER_FEATURES = [
  { icon: '💰', title: 'Guaranteed Payments', desc: 'Funds locked in escrow before your produce leaves the farm.' },
  { icon: '📦', title: 'QR Batch Identity', desc: 'Every batch gets a scannable digital identity for full traceability.' },
  { icon: '📊', title: 'Earnings Dashboard', desc: 'Track pending, partial, and released payments in one place.' },
  { icon: '📸', title: 'Proof at Every Stage', desc: 'Photo uploads and timestamps protect you from disputes.' },
]

const BUYER_FEATURES = [
  { icon: '🔍', title: 'Verified Listings', desc: 'Browse produce with harvest dates, expiry, and farmer trust scores.' },
  { icon: '🛡️', title: 'Escrow Protection', desc: 'Pay only releases when delivery is confirmed — zero risk.' },
  { icon: '🚚', title: 'Logistics Control', desc: 'Generate transport and warehouse links directly from your dashboard.' },
  { icon: '📍', title: 'Live Trace', desc: 'Track every batch from farm to shelf via public QR trace page.' },
]

const PRODUCTS = [
  { name: 'Fresh Berries', price: '₹500/kg', img: '/product_berries.png', farmer: 'Ravi Kumar', location: 'Nashik, MH' },
  { name: 'Organic Milk', price: '₹70/L', img: '/product_milk.png', farmer: 'Sunita Devi', location: 'Anand, GJ' },
  { name: 'Tomatoes', price: '₹50/kg', img: '/product_tomatoes.png', farmer: 'Arjun Singh', location: 'Pune, MH' },
  { name: 'Tulsi Leaves', price: '₹100/kg', img: '/product_tulsi.png', farmer: 'Meena Bai', location: 'Indore, MP' },
]

export default function App() {
  return (
    <div className="agrochain-root">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="logo-leaf">🌿</span>
            <span className="logo-text">AgroChain</span>
          </div>
          <ul className="nav-links">
            {NAV_LINKS.map(l => <li key={l}><a href="#">{l}</a></li>)}
          </ul>
          <div className="nav-cta">
            <button className="btn-ghost">Login</button>
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🌾 Trust Infrastructure for Agriculture</div>
          <h1 className="hero-title">
            Farm to Shelf,<br />
            <span className="hero-accent">Guaranteed.</span>
          </h1>
          <p className="hero-sub">
            AgroChain connects farmers and supermarkets with escrow payments, QR batch traceability, and link-based logistics — no middlemen, no trust issues.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-lg">I'm a Farmer →</button>
            <button className="btn-outline btn-lg">I'm a Buyer →</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">100%</span><span className="stat-label">Escrow Protected</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">QR</span><span className="stat-label">Every Batch Traced</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">0</span><span className="stat-label">Login for Logistics</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/farmer_banner.png" alt="Farmer with produce" className="hero-img" />
          <div className="hero-card card-escrow">
            <span className="card-icon">🔒</span>
            <div>
              <div className="card-title">Escrow Funded</div>
              <div className="card-sub">₹24,500 secured</div>
            </div>
          </div>
          <div className="hero-card card-qr">
            <span className="card-icon">📦</span>
            <div>
              <div className="card-title">Batch #AG-2041</div>
              <div className="card-sub">QR Generated</div>
            </div>
          </div>
          <div className="hero-card card-delivery">
            <span className="card-icon">✅</span>
            <div>
              <div className="card-title">Delivered</div>
              <div className="card-sub">Payment Released</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">From listing to settlement<br />in four steps</h2>
        <div className="steps-grid">
          {HOW_IT_WORKS.map(s => (
            <div className="step-card" key={s.step}>
              <div className="step-num">{s.step}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE PREVIEW */}
      <section className="section market-section">
        <div className="section-label">Marketplace</div>
        <h2 className="section-title">Fresh produce, verified at source</h2>
        <div className="products-grid">
          {PRODUCTS.map(p => (
            <div className="product-card" key={p.name}>
              <div className="product-img-wrap">
                <img src={p.img} alt={p.name} className="product-img" />
                <div className="product-badge">Verified ✓</div>
              </div>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-price">{p.price}</div>
                <div className="product-farmer">🧑‍🌾 {p.farmer} · {p.location}</div>
                <button className="btn-primary product-btn">Order Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR FARMERS */}
      <section className="section split-section farmer-split">
        <div className="split-text">
          <div className="section-label">For Farmers</div>
          <h2 className="section-title">Sell with confidence,<br />get paid on time</h2>
          <p className="split-desc">No more payment delays or middlemen eating your margins. AgroChain locks buyer funds in escrow before your produce moves — you get paid automatically when delivery is confirmed.</p>
          <button className="btn-primary btn-lg">Join as Farmer →</button>
          <div className="feature-list">
            {FARMER_FEATURES.map(f => (
              <div className="feature-item" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="split-visual farmer-visual">
          <div className="mock-dashboard">
            <div className="mock-header">
              <span className="mock-dot green" /><span className="mock-dot yellow" /><span className="mock-dot red" />
              <span className="mock-title">Farmer Dashboard</span>
            </div>
            <div className="mock-earnings">
              <div className="mock-earn-label">Total Earnings</div>
              <div className="mock-earn-val">₹1,24,500</div>
              <div className="mock-earn-sub">+₹18,200 this week</div>
            </div>
            <div className="mock-orders">
              {[
                { crop: 'Tomatoes', qty: '200 kg', status: 'Delivered', color: '#16A34A' },
                { crop: 'Berries', qty: '50 kg', status: 'In Transit', color: '#D97706' },
                { crop: 'Tulsi', qty: '30 kg', status: 'Pending', color: '#6B7280' },
              ].map(o => (
                <div className="mock-order-row" key={o.crop}>
                  <span className="mock-crop">🌿 {o.crop} · {o.qty}</span>
                  <span className="mock-status" style={{ color: o.color }}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOR BUYERS */}
      <section className="section split-section buyer-split">
        <div className="split-visual buyer-visual">
          <div className="mock-dashboard">
            <div className="mock-header">
              <span className="mock-dot green" /><span className="mock-dot yellow" /><span className="mock-dot red" />
              <span className="mock-title">Buyer Dashboard</span>
            </div>
            <div className="mock-trace">
              <div className="trace-label">Batch #AG-2041 · Tomatoes</div>
              <div className="trace-timeline">
                {['Created', 'Picked Up', 'In Warehouse', 'Delivered'].map((e, i) => (
                  <div className="trace-event" key={e}>
                    <div className={`trace-dot ${i < 3 ? 'done' : ''}`} />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mock-escrow-bar">
              <div className="escrow-label">Escrow Status</div>
              <div className="escrow-track">
                <div className="escrow-fill" style={{ width: '65%' }} />
              </div>
              <div className="escrow-sub">65% released · ₹15,925 remaining</div>
            </div>
          </div>
        </div>
        <div className="split-text">
          <div className="section-label">For Buyers</div>
          <h2 className="section-title">Source verified produce,<br />track every batch</h2>
          <p className="split-desc">Browse fresh listings from verified farmers, pay securely into escrow, and track your order from farm to shelf — all from one dashboard.</p>
          <button className="btn-primary btn-lg">Join as Buyer →</button>
          <div className="feature-list">
            {BUYER_FEATURES.map(f => (
              <div className="feature-item" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR TRACE CALLOUT */}
      <section className="section qr-section">
        <div className="qr-inner">
          <div className="qr-text">
            <div className="section-label">Public QR Trace</div>
            <h2 className="section-title" style={{ color: '#fff' }}>Scan any batch.<br />See the full journey.</h2>
            <p className="qr-desc">Every AgroChain batch has a public trace page — farmer info, pickup proof, warehouse logs, and delivery confirmation. No login needed.</p>
            <button className="btn-white btn-lg">Try a Live Trace →</button>
          </div>
          <div className="qr-visual">
            <div className="qr-mock">
              <div className="qr-mock-code">
                <div className="qr-grid">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`qr-cell ${Math.random() > 0.5 ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>
              <div className="qr-mock-info">
                <div className="qr-batch">Batch #AG-2041</div>
                <div className="qr-crop">🍅 Tomatoes · 200 kg</div>
                <div className="qr-events">
                  <span className="qr-event done">✓ Created</span>
                  <span className="qr-event done">✓ Picked Up</span>
                  <span className="qr-event done">✓ Stored</span>
                  <span className="qr-event pending">⏳ Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to build trust in agriculture?</h2>
          <p className="cta-sub">Join farmers and supermarkets already using AgroChain to trade with confidence.</p>
          <div className="cta-actions">
            <button className="btn-primary btn-lg">Start as Farmer</button>
            <button className="btn-outline btn-lg">Start as Buyer</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-leaf">🌿</span>
            <span className="logo-text">AgroChain</span>
            <p className="footer-tagline">Trust infrastructure for agriculture.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <div className="footer-col-title">Platform</div>
              <a href="#">Marketplace</a>
              <a href="#">Escrow</a>
              <a href="#">QR Trace</a>
              <a href="#">Logistics</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Users</div>
              <a href="#">Farmers</a>
              <a href="#">Supermarkets</a>
              <a href="#">Transporters</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Company</div>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2025 AgroChain. All rights reserved.</div>
      </footer>
    </div>
  )
}
