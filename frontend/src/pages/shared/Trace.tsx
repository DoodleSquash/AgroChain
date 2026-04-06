import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API } from '../../lib/api';

interface TrackingLog { event_type: string; timestamp: string; image_url: string | null; metadata: Record<string, string> | null }
interface BatchData {
  id: string; crop: string; quantity: number; price_per_unit: number
  harvest_date: string; expiry_date: string | null; location: string | null
  farmer: { name: string; created_at: string }
  images: { image_url: string }[]
  tracking_logs: TrackingLog[]
}

const EVENT_ICONS: Record<string, string>  = { 
  CREATED: '💰', 
  OUT_FOR_DELIVERY: '📤', 
  PICKED_UP: '🚚', 
  STORED: '🏭', 
  DELIVERED: '✅' 
}

const TIMELINE_EVENTS = ['CREATED', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'STORED', 'DELIVERED']

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function freshnessPct(harvest: string, expiry: string | null): number {
  if (!expiry) return 80
  const total = new Date(expiry).getTime() - new Date(harvest).getTime()
  const remaining = new Date(expiry).getTime() - Date.now()
  return Math.max(0, Math.min(100, Math.round((remaining / total) * 100)))
}

function Stars() {
  return (
    <span className="flex items-center gap-px">
      {[1,2,3,4,5].map(i => <span key={i} className="text-[13px] text-amber-400">★</span>)}
    </span>
  )
}

export default function Trace() {
  const { batchId } = useParams<{ batchId: string }>();
  const { t } = useTranslation();
  const [batch, setBatch]     = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${API}/public/trace/${batchId}`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setBatch(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading) return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#006b2c] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !batch) return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-red-700 mb-2">Batch Not Found</h1>
        <p className="text-gray-500 text-sm">{error || 'This batch does not exist.'}</p>
      </div>
    </div>
  );

  const imgSrc = batch.images?.[0]?.image_url || '/product_tomatoes.png';
  const pct = freshnessPct(batch.harvest_date, batch.expiry_date);
  const completedEvents = new Set(batch.tracking_logs.map(l => l.event_type));
  // Progress is based on the 4 key stages shown in the bar: Created, Out for Delivery, Picked Up, Stored
  const stages = ['CREATED', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'STORED'];
  const completedStages = stages.filter(s => completedEvents.has(s)).length;
  const progressPct = Math.min(100, Math.round((completedStages / stages.length) * 100));
  const warehouseLog = batch.tracking_logs.find(l => l.event_type === 'STORED');
  const meta = warehouseLog?.metadata;

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e]">
      <nav className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🌿</span>
          <span className="text-lg font-extrabold text-[#006b2c] tracking-tight">AgroChain</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Public Trace</span>
          <span className="text-xs font-bold text-[#006b2c] bg-green-50 border border-green-200 px-3 py-1 rounded-full">#{batch.id.slice(0,8).toUpperCase()}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* PRODUCT OVERVIEW */}
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="relative h-52 overflow-hidden">
            <img src={imgSrc} alt={batch.crop} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <h1 className="text-2xl font-extrabold text-white leading-tight">{batch.crop}</h1>
            </div>
            <div className="absolute top-4 right-4 bg-[#006b2c] text-white text-xs font-bold px-3 py-1 rounded-full">Verified ✓</div>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Batch ID', value: batch.id.slice(0,8).toUpperCase() },
              { label: 'Quantity', value: `${batch.quantity} kg` },
              { label: 'Harvest',  value: fmtDate(batch.harvest_date) },
              { label: 'Expiry',   value: fmtDate(batch.expiry_date) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#f2f4f6] rounded-2xl px-4 py-3">
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</span>
                <span className="text-[13px] font-bold text-[#191c1e]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FARMER INFO */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-wrap items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-400 text-white text-2xl font-extrabold flex items-center justify-center shrink-0">
            {batch.farmer.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-extrabold text-gray-900">{batch.farmer.name}</span>
              <span className="text-[10px] font-extrabold text-[#006b2c] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">VERIFIED</span>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-gray-500 mt-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
              {batch.location || 'Location not specified'}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Stars />
              <span className="text-[12px] font-bold text-gray-700">4.8</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Member since</div>
            <div className="text-sm font-bold text-gray-700">{new Date(batch.farmer.created_at).getFullYear()}</div>
          </div>
        </div>

        {/* DELIVERY PROGRESS */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-extrabold text-gray-900">{t('logistics.delivery_progress')}</span>
            <span className="text-sm font-bold text-[#006b2c]">{progressPct}%</span>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full mb-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#006b2c] to-green-400 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">
            <span>{t('logistics.created')}</span>
            <span>{t('logistics.out_for_delivery')}</span>
            <span>{t('logistics.picked_up')}</span>
            <span>{t('logistics.stored')}</span>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-extrabold text-gray-900 mb-6">{t('logistics.batch_timeline')}</h2>
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-100" />
            <div className="space-y-6">
              {TIMELINE_EVENTS.map((evt, i) => {
                const log = batch.tracking_logs.find(l => l.event_type === evt);
                const done = !!log;
                const labelKey = `logistics.${evt.toLowerCase()}`;
                
                return (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 z-10 border-4 border-white shadow-sm ${done ? 'bg-[#006b2c]' : 'bg-gray-100'}`}>
                      <span className={done ? 'text-white' : 'text-gray-400'}>{EVENT_ICONS[evt]}</span>
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-extrabold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{t(labelKey)}</span>
                        {done
                          ? <span className="text-[10px] font-bold text-[#006b2c] bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Done</span>
                          : <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Pending</span>}
                      </div>
                      {log && <div className="text-[11px] text-gray-400 font-medium mt-0.5">{new Date(log.timestamp).toLocaleString('en-IN')}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* QUALITY LOGS */}
        {meta && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-5">{t('logistics.quality_logs')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Weight',  value: `${meta.weight} kg`,       ok: true },
                { label: 'Grade',   value: meta.quality_grade,         ok: meta.quality_grade !== 'Rejected' },
                { label: 'Storage', value: meta.storage_condition,     ok: true },
              ].map(q => (
                <div key={q.label} className={`rounded-2xl px-4 py-4 border ${q.ok ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <span className="block text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-400">{q.label}</span>
                  <span className={`text-base font-extrabold ${q.ok ? 'text-[#006b2c]' : 'text-red-600'}`}>{q.value}</span>
                  <span className={`block text-[10px] font-bold mt-0.5 ${q.ok ? 'text-green-600' : 'text-red-500'}`}>{q.ok ? '✓ Pass' : '⚠ Flag'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FRESHNESS INDICATOR */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-gray-900">{t('logistics.freshness')}</h2>
            <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${pct >= 70 ? 'text-[#006b2c] bg-green-50 border border-green-200' : pct >= 40 ? 'text-amber-600 bg-amber-50 border border-amber-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>
              {pct}% Fresh
            </span>
          </div>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${pct >= 70 ? 'bg-gradient-to-r from-[#006b2c] to-green-400' : pct >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
              style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[12px] text-gray-500 mt-3 leading-relaxed">
            Consume or process before <span className="font-bold text-gray-700">{fmtDate(batch.expiry_date)}</span>.
          </p>
        </div>

        <div className="text-center text-[11px] text-gray-400 pb-6">
          This trace page is publicly accessible. Powered by <span className="font-bold text-[#006b2c]">AgroChain</span>.
        </div>
      </div>
    </div>
  );
}
