import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API, authHeaders, apiFetch } from '../../lib/api';
import { useVoice } from '../../context/VoiceContext';
interface Batch {
  id: string
  crop: string
  quantity: number
  price_per_unit: number
  status: string
  harvest_date: string
  expiry_date: string | null
  location: string | null
  qr_code_url: string | null
  images: { image_url: string }[]
}

function statusColor(s: string) {
  if (s === 'ACTIVE')  return 'bg-green-500';
  if (s === 'SOLD')    return 'bg-blue-500';
  if (s === 'EXPIRED') return 'bg-red-500';
  return 'bg-zinc-500';
}

function statusLabel(s: string) {
  if (s === 'ACTIVE')  return 'Live';
  if (s === 'SOLD')    return 'Sold';
  if (s === 'EXPIRED') return 'Expired';
  if (s === 'PAUSED')  return 'Paused';
  return s;
}

function cropImg(crop: string, fallback?: string) {
  if (fallback) return fallback;
  const c = crop.toLowerCase();
  if (c.includes('tomato'))  return '/product_tomatoes.png';
  if (c.includes('tulsi') || c.includes('spinach') || c.includes('herb')) return '/product_tulsi.png';
  if (c.includes('milk') || c.includes('dairy'))  return '/product_milk.png';
  if (c.includes('berry') || c.includes('mango')) return '/product_berries.png';
  return '/product_tomatoes.png';
}

// ── QR Modal ─────────────────────────────────────────────────────────────────
function QRModal({ batch, onClose }: { batch: Batch; onClose: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [traceUrl, setTraceUrl]   = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const d = await apiFetch<any>(`/farmers/batches/${batch.id}/qr`);
        setQrDataUrl(d.qr_data_url);
        setTraceUrl(`${window.location.origin}/trace/${batch.id}`);
      } catch (err) {
        console.error('QR Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [batch.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-5 sm:p-8 text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Batch QR Code</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center justify-center min-h-[200px]">
          {loading
            ? <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            : <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
          }
        </div>

        <p className="text-sm font-bold text-gray-900 mb-1">{batch.crop}</p>
        <p className="text-xs text-gray-400 mb-6 font-mono break-all">{traceUrl}</p>

        <div className="flex gap-3">
          {qrDataUrl && (
            <a href={qrDataUrl} download={`qr-${batch.id}.png`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-colors no-underline">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download
            </a>
          )}
          {traceUrl && (
            <a href={traceUrl} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors no-underline">
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Trace
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ batch, onClose, onSaved }: {
  batch: Batch;
  onClose: () => void;
  onSaved: (updated: Batch) => void;
}) {
  const [price, setPrice]       = useState(String(batch.price_per_unit));
  const [quantity, setQty]      = useState(String(batch.quantity));
  const [location, setLocation] = useState(batch.location || '');
  const [status, setStatus]     = useState(batch.status);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews]     = useState<string[]>([]);
  const [uploading, setUploading]   = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4);
    setImageFiles(prev => [...prev, ...arr].slice(0, 4));
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string].slice(0, 4));
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const form = new FormData();
      form.append('file', file);
      const headers = authHeaders() as any;
      const res = await fetch(`${API}/upload?folder=batches`, {
        method: 'POST',
        headers: { 'Authorization': headers['Authorization'] || headers['authorization'] },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');
      urls.push(data.url);
    }
    return urls;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    if (Number(quantity) <= 0) {
      setErr('Quantity must be greater than zero.');
      setSaving(false);
      return;
    }

    try {
      setUploading(true);
      const new_images = imageFiles.length > 0 ? await uploadImages() : [];
      setUploading(false);

      const data = await apiFetch<any>(`/farmers/batches/${batch.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          price_per_unit: Number(price),
          quantity: Number(quantity),
          location,
          status,
          new_images: new_images,
        }),
      });
      onSaved({ ...batch, price_per_unit: Number(price), quantity: Number(quantity), location, status, images: data.images || batch.images });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to save');
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-5 sm:p-8 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Edit Listing</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {err && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{err}</div>}

        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Price per kg (₹)</label>
              <input type="number" required min="0.01" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Quantity (kg)</label>
              <input type="number" required min="1" value={quantity} onChange={e => setQty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none text-sm bg-white">
              <option value="ACTIVE">Active (Live)</option>
              <option value="PAUSED">Paused</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Replace Images (Old images will be deleted)</label>
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold text-sm hover:bg-gray-50 hover:border-primary-400 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
              Select Images
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading}
              className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              {saving ? (uploading ? 'Uploading…' : 'Saving…') : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Listings() {
  const [batches, setBatches]   = useState<Batch[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('ALL');
  const [editing, setEditing]   = useState<Batch | null>(null);
  const [qrBatch, setQrBatch]   = useState<Batch | null>(null);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const showVoiceToast = (msg: string) => {
    setVoiceToast(msg);
    setTimeout(() => setVoiceToast(null), 4000);
  };

  // ── Voice Control ──
  const voiceContext = `
PAGE_CONTEXT: My Listings
Data:
- Total Listings: ${batches.length}
- Live/Active: ${batches.filter(b => b.status === 'ACTIVE').length}
- Sold: ${batches.filter(b => b.status === 'SOLD').length}

Listings available:
${batches.map(b => `- ${b.crop} (Qty: ${b.quantity}kg, Status: ${b.status}, Price: ₹${b.price_per_unit})`).join('\n')}

Supported actions schema:
{
  "action": "FILTER_LISTINGS",
  "fields": {
    "search": "crop name to search or null",
    "tab": "ALL" | "ACTIVE" | "SOLD" | "EXPIRED" or null
  }
}
  `.trim();

  const handleVoiceIntent = (intent: any) => {
    if (!intent) return;
    if (intent.action === 'FILTER_LISTINGS') {
      const { search: newSearch, tab: newTab } = intent.fields;
      if (typeof newSearch === 'string') setSearch(newSearch);
      if (newTab) setTab(newTab);
      showVoiceToast('✅ Applied filters');
    }
  };

  useVoice(voiceContext, handleVoiceIntent);

  useEffect(() => {
    if (!user.id) { setError('Not logged in'); setLoading(false); return; }
    apiFetch<Batch[]>(`/farmers/batches?farmer_id=${user.id}`)
      .then(d => setBatches(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  const deleteBatch = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await apiFetch(`/farmers/batches/${id}`, { method: 'DELETE' });
      setBatches(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const filtered = batches.filter(b => {
    const matchSearch = b.crop.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === 'ALL'     ? true :
      tab === 'ACTIVE'  ? b.status === 'ACTIVE' :
      tab === 'SOLD'    ? b.status === 'SOLD' :
      tab === 'EXPIRED' ? b.status === 'EXPIRED' : true;
    return matchSearch && matchTab;
  });

  const counts = {
    ALL:     batches.length,
    ACTIVE:  batches.filter(b => b.status === 'ACTIVE').length,
    SOLD:    batches.filter(b => b.status === 'SOLD').length,
    EXPIRED: batches.filter(b => b.status === 'EXPIRED').length,
  };

  const TABS = [
    { key: 'ALL',     label: `All Listings (${counts.ALL})` },
    { key: 'ACTIVE',  label: `Active (${counts.ACTIVE})` },
    { key: 'SOLD',    label: `Sold (${counts.SOLD})` },
    { key: 'EXPIRED', label: `Expired (${counts.EXPIRED})` },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1400px] mx-auto space-y-6 md:space-y-8">

      {editing && (
        <EditModal
          batch={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => {
            setBatches(prev => prev.map(b => b.id === updated.id ? updated : b));
            setEditing(null);
          }}
        />
      )}

      {qrBatch && <QRModal batch={qrBatch} onClose={() => setQrBatch(null)} />}

      {/* Voice Action Toast */}
      {voiceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] bg-gray-900/95 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <span className="material-symbols-outlined text-[18px] text-green-400">mic</span>
          {voiceToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface">My Listings</h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-2">Manage and track all your published crop batches here.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
            <input type="text" placeholder="Search crops..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-full focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm sm:w-64 text-on-surface" />
          </div>
          <Link to="/farmer/listings/new"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-sm font-bold transition-colors shadow-sm no-underline">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Listing
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 overflow-x-auto pb-px">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 transition-colors
              ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium">{error}</div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-3xl overflow-hidden border border-outline-variant/10 animate-pulse">
              <div className="h-40 bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 bg-gray-100 rounded-full" />
                <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                <div className="h-8 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined block text-5xl mb-3">inventory_2</span>
          <p className="font-bold text-lg mb-2">No listings found</p>
          <p className="text-sm mb-6">Create your first listing to start selling on AgroChain.</p>
          <Link to="/farmer/listings/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors no-underline">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Listing
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item, i) => {
            const img = cropImg(item.crop, item.images?.[0]?.image_url);
            const soldPct = item.status === 'SOLD' ? 100 : 0;
            return (
              <div key={item.id} className="group flex flex-col bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10">
                <div className="h-40 overflow-hidden relative">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.crop} src={img} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  <div className="absolute top-3 right-3">
                    <button onClick={() => deleteBatch(item.id)}
                      className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 text-white shadow-sm ${statusColor(item.status)}`}>
                      {item.status === 'ACTIVE' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />}
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/10">
                      ₹{item.price_per_unit}/kg
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="font-bold text-lg text-on-surface mb-2 line-clamp-1">{item.crop}</h4>

                  <div className="flex justify-between items-center text-sm text-on-surface-variant mb-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                      {item.quantity} kg
                    </span>
                    <span className="text-xs font-medium truncate max-w-[100px]">{item.location || '—'}</span>
                  </div>

                  <div className="text-xs text-on-surface-variant mb-4">
                    Harvest: {new Date(item.harvest_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1.5 font-medium">
                      <span>Batch #{item.id.slice(0,6).toUpperCase()}</span>
                      {item.status === 'SOLD' && <span className="text-blue-600">Completed</span>}
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mb-4">
                      <div className={`h-full rounded-full transition-all ${soldPct === 100 ? 'bg-blue-500' : 'bg-primary-500'}`}
                        style={{ width: `${soldPct}%` }} />
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setQrBatch(item)}
                        className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-bold transition-colors">
                        <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        QR
                      </button>
                      <button onClick={() => setEditing(item)}
                        className="flex-1 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 font-bold text-sm transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
