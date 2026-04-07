import { useEffect, useState } from 'react';
import { API, authHeaders } from '../../lib/api';

interface Order {
  id: string
  quantity: number
  status: string
  batch: { crop: string; location: string | null }
}

interface GeneratedLink {
  type: 'TRANSPORT' | 'WAREHOUSE'
  url: string
  token: string
}

function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

export default function Logistics() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Transport form
  const [tOrderId, setTOrderId]   = useState('');
  const [driverName, setDriver]   = useState('');
  const [vehicle, setVehicle]     = useState('');
  const [tGenerating, setTGen]    = useState(false);
  const [tLink, setTLink]         = useState<GeneratedLink | null>(null);
  const [tError, setTError]       = useState('');
  const [tCopied, setTCopied]     = useState(false);

  // Warehouse form
  const [wOrderId, setWOrderId]   = useState('');
  const [facility, setFacility]   = useState('');
  const [wGenerating, setWGen]    = useState(false);
  const [wLink, setWLink]         = useState<GeneratedLink | null>(null);
  const [wError, setWError]       = useState('');
  const [wCopied, setWCopied]     = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) { setLoading(false); return; }
    fetch(`${API}/supermarket/orders?buyer_id=${user.id}`, { headers: authHeaders() as HeadersInit })
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          const active = d.filter((o: Order) => o.status === 'IN_TRANSIT' || o.status === 'PENDING');
          setOrders(active);
          if (active.length > 0) { setTOrderId(active[0].id); setWOrderId(active[0].id); }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const generateTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    setTError(''); setTGen(true);
    try {
      const res = await fetch(`${API}/supermarket/orders/${tOrderId}/logistics`, {
        method: 'POST',
        headers: authHeaders() as HeadersInit,
        body: JSON.stringify({
          type: 'TRANSPORT',
          details: { driver_name: driverName, vehicle_number: vehicle },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const token = data.job.token;
      const url = `${window.location.origin}/delivery/${token}`;
      setTLink({ type: 'TRANSPORT', url, token });
    } catch (e: unknown) {
      setTError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setTGen(false);
    }
  };

  const generateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setWError(''); setWGen(true);
    try {
      const res = await fetch(`${API}/supermarket/orders/${wOrderId}/logistics`, {
        method: 'POST',
        headers: authHeaders() as HeadersInit,
        body: JSON.stringify({
          type: 'WAREHOUSE',
          details: { facility_name: facility },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const token = data.job.token;
      const url = `${window.location.origin}/warehouse/${token}`;
      setWLink({ type: 'WAREHOUSE', url, token });
    } catch (e: unknown) {
      setWError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setWGen(false);
    }
  };

  const orderLabel = (o: Order) => `${o.id.slice(0,8).toUpperCase()} — ${o.batch.crop} (${o.quantity}kg)`;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto pb-10 lg:pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Logistics Control Tower</h1>
        <p className="text-sm sm:text-lg text-gray-500 font-medium max-w-2xl">
          Generate magic links for transporters and warehouses — no app or login required.
        </p>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your orders…
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-5 py-4 text-sm font-medium mb-8">
          No active orders found. Place an order first before generating logistics links.
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

          {/* ── TRANSPORT ── */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden flex flex-col">
            <div className="hidden sm:flex absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-bl-[100px] items-start justify-end p-6 -z-0">
              <span className="material-symbols-outlined text-5xl text-blue-200">local_shipping</span>
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              <h2 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 sm:hidden">local_shipping</span>
                Transport Links
              </h2>
              <p className="text-gray-500 text-sm mb-6 sm:pr-12 leading-relaxed">
                Assign jobs to truck drivers. The link lets them scan the QR and mark pickup.
              </p>

              {tError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{tError}</div>}

              <form onSubmit={generateTransport} className="space-y-4 mb-6 flex-1">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Select Active Order</label>
                  <select required value={tOrderId} onChange={e => setTOrderId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer">
                    {orders.length === 0
                      ? <option value="">No active orders</option>
                      : orders.map(o => <option key={o.id} value={o.id}>{orderLabel(o)}</option>)
                    }
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Driver Name</label>
                    <input type="text" required placeholder="e.g. Ramesh K." value={driverName} onChange={e => setDriver(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder-gray-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Vehicle No.</label>
                    <input type="text" required placeholder="MH-12-AB-3456" value={vehicle} onChange={e => setVehicle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder-gray-400 uppercase" />
                  </div>
                </div>

                <button type="submit" disabled={tGenerating || orders.length === 0}
                  className="w-full py-3.5 bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98]">
                  {tGenerating ? 'Generating…' : 'Generate Link'}
                </button>
              </form>

              {/* Generated link */}
              <div className={`mt-auto rounded-2xl p-4 border ${tLink ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-blue-800 tracking-wide uppercase">Active Link</span>
                  {tLink && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Expires in 24h</span>}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 truncate bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono">
                    {tLink ? tLink.url : 'No link generated yet'}
                  </div>
                  {tLink && (
                    <button onClick={() => copyToClipboard(tLink.url, setTCopied)}
                      className="flex items-center justify-center w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{tCopied ? 'check' : 'content_copy'}</span>
                    </button>
                  )}
                </div>
                {tLink && (
                  <a href={`https://wa.me/?text=${encodeURIComponent('Your transport job link: ' + tLink.url)}`}
                    target="_blank" rel="noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 no-underline">
                    <span className="material-symbols-outlined text-[14px]">share</span>
                    Share via WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── WAREHOUSE ── */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden flex flex-col">
            <div className="hidden sm:flex absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-bl-[100px] items-start justify-end p-6 -z-0">
              <span className="material-symbols-outlined text-5xl text-amber-200">apartment</span>
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              <h2 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 sm:hidden">apartment</span>
                Warehouse Links
              </h2>
              <p className="text-gray-500 text-sm mb-6 sm:pr-12 leading-relaxed">
                Provide warehouse managers access to log quality checks and storage conditions.
              </p>

              {wError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{wError}</div>}

              <form onSubmit={generateWarehouse} className="space-y-4 mb-6 flex-1">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Select Active Order</label>
                  <select required value={wOrderId} onChange={e => setWOrderId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none appearance-none cursor-pointer">
                    {orders.length === 0
                      ? <option value="">No active orders</option>
                      : orders.map(o => <option key={o.id} value={o.id}>{orderLabel(o)}</option>)
                    }
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Warehouse Facility / Handler</label>
                  <input type="text" required placeholder="e.g. Pune Central Storage" value={facility} onChange={e => setFacility(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none placeholder-gray-400" />
                </div>

                <button type="submit" disabled={wGenerating || orders.length === 0}
                  className="w-full py-3.5 bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] mt-[1.6rem]">
                  {wGenerating ? 'Generating…' : 'Generate Link'}
                </button>
              </form>

              {/* Generated link */}
              <div className={`mt-auto rounded-2xl p-4 border ${wLink ? 'bg-amber-50/50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-800 tracking-wide uppercase">Active Link</span>
                  {wLink && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded">Expires in 48h</span>}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 truncate bg-white border border-amber-100 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono">
                    {wLink ? wLink.url : 'No link generated yet'}
                  </div>
                  {wLink && (
                    <button onClick={() => copyToClipboard(wLink.url, setWCopied)}
                      className="flex items-center justify-center w-10 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{wCopied ? 'check' : 'content_copy'}</span>
                    </button>
                  )}
                </div>
                {wLink && (
                  <a href={`https://wa.me/?text=${encodeURIComponent('Your warehouse job link: ' + wLink.url)}`}
                    target="_blank" rel="noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 no-underline">
                    <span className="material-symbols-outlined text-[14px]">share</span>
                    Share via WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
