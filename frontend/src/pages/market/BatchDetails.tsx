import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API } from '../../lib/api';

interface Batch {
  id: string
  crop: string
  quantity: number
  price_per_unit: number
  harvest_date: string
  expiry_date: string | null
  location: string | null
  qr_code_url: string | null
  status: string
  farmer: { name: string; phone: string | null; email: string }
  images: { image_url: string }[]
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function cropImg(crop: string, fallback?: string) {
  if (fallback) return fallback;
  const c = crop.toLowerCase();
  if (c.includes('tomato'))  return '/product_tomatoes.png';
  if (c.includes('tulsi') || c.includes('spinach')) return '/product_tulsi.png';
  if (c.includes('milk') || c.includes('dairy'))    return '/product_milk.png';
  if (c.includes('berry') || c.includes('mango'))   return '/product_berries.png';
  return '/product_tomatoes.png';
}

export default function BatchDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [batch, setBatch]     = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [qty, setQty]         = useState(100);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetch(`${API}/supermarket/marketplace/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setBatch(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-10 max-w-6xl mx-auto animate-pulse space-y-6">
      <div className="h-8 w-48 bg-gray-100 rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="h-[450px] bg-gray-100 rounded-[2.5rem]" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 bg-gray-100 rounded-full" />
          <div className="h-6 w-1/3 bg-gray-100 rounded-full" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (error || !batch) return (
    <div className="p-10 max-w-6xl mx-auto text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-red-700 mb-2">Batch Not Found</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <Link to="/market/browse" className="text-primary-600 font-bold hover:underline">← Back to Marketplace</Link>
    </div>
  );

  const images = batch.images?.length > 0
    ? batch.images.map(i => i.image_url)
    : [cropImg(batch.crop)];

  const total = (batch.price_per_unit * qty).toLocaleString('en-IN');

  const goCheckout = () => {
    navigate('/market/checkout', {
      state: { batchId: batch.id, quantity: qty, totalAmount: batch.price_per_unit * qty, crop: batch.crop }
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto pb-10 lg:pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 font-bold tracking-wide flex-wrap">
        <Link to="/market/browse" className="hover:text-primary-600 transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          Marketplace
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">{batch.crop}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

        {/* Left: Images */}
        <div className="space-y-4">
          <div className="relative h-[280px] sm:h-[380px] md:h-[450px] bg-gray-100 rounded-[2rem] overflow-hidden group shadow-lg">
            <img src={images[activeImg]} alt={batch.crop}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

            {/* QR badge */}
            {batch.qr_code_url && (
              <a href={`/trace/${batch.id}`} target="_blank" rel="noreferrer"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-transform no-underline"
                title="View Trace">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[28px]">qr_code_2</span>
                </div>
              </a>
            )}

            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold">
              <span className="material-symbols-outlined text-[18px] text-green-400">verified</span>
              Quality Verified
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust panel */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600 text-[22px]">shield</span>
            </div>
            <div>
              <h4 className="text-blue-900 font-bold mb-1">AgroChain Trust Layer</h4>
              <p className="text-blue-700/80 text-sm font-medium leading-relaxed">
                Payment held in escrow and released only upon verified pickup and delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="py-2 lg:py-4">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight leading-tight">{batch.crop}</h1>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-3xl sm:text-4xl font-black text-primary-600">₹{batch.price_per_unit.toLocaleString('en-IN')}</span>
            <span className="text-lg text-gray-400 font-bold pb-1">/kg</span>
            <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${batch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {batch.status === 'ACTIVE' ? 'In Stock' : batch.status}
            </span>
          </div>

          {/* Details grid */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 mb-6 space-y-0">
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Farmer</span>
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-400 text-white text-xs font-bold flex items-center justify-center">
                    {batch.farmer.name[0]}
                  </div>
                  {batch.farmer.name}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Location</span>
                <span className="font-bold text-gray-900">{batch.location || '—'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Harvest Date</span>
                <span className="font-bold text-gray-900">{fmtDate(batch.harvest_date)}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Available Qty</span>
                <span className="font-bold text-gray-900">{batch.quantity} kg</span>
              </div>
              {batch.expiry_date && (
                <div className="col-span-2 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry Date</span>
                  <span className="font-bold text-gray-900">{fmtDate(batch.expiry_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="mb-6">
            <label className="text-sm font-bold text-gray-700 block mb-2">Order Quantity (kg)</label>
            <div className="bg-white border border-gray-200 rounded-2xl flex items-center p-2 shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
              <button onClick={() => setQty(q => Math.max(1, q - 10))}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg transition-colors border-none cursor-pointer">−</button>
              <input type="number" value={qty} min={1} max={batch.quantity}
                onChange={e => setQty(Math.min(batch.quantity, Math.max(1, Number(e.target.value))))}
                className="flex-1 border-none bg-transparent font-bold text-lg text-center focus:outline-none" />
              <button onClick={() => setQty(q => Math.min(batch.quantity, q + 10))}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg transition-colors border-none cursor-pointer">+</button>
              <span className="pr-3 text-gray-400 font-bold">kg</span>
            </div>
          </div>

          {/* Action */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto sm:flex-1 text-left">
              <span className="text-sm text-gray-500 font-bold block">Total Amount</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-900">₹{total}</span>
            </div>
            <button onClick={goCheckout} disabled={batch.status !== 'ACTIVE'}
              className="w-full sm:w-auto flex-1 md:min-w-[220px] group bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-2xl font-black text-lg shadow-xl shadow-primary-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              Checkout
              <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
