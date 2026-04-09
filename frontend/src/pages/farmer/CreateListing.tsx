import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersistentState } from '../../hooks/usePersistentState';
import { API, authHeaders } from '../../lib/api';
import { useVoice } from '../../context/VoiceContext';

const CROPS = ['Wheat', 'Rice (Paddy)', 'Sweet Corn', 'Potatoes', 'Tomatoes',
               'Onions', 'Spinach', 'Berries', 'Mangoes', 'Tulsi', 'Milk', 'Other'];
const BADGES = ['Organic', 'Pesticide Free', 'Export Quality', 'Grade A', 'Washed'];

export default function CreateListing() {
  const navigate = useNavigate();

  // Form state
  const [crop, setCrop]             = usePersistentState('listing_crop', '');
  const [category, setCategory]     = usePersistentState('listing_cat', 'Vegetables');
  const [quantity, setQuantity]     = usePersistentState('listing_qty', '');
  const [price, setPrice]           = usePersistentState('listing_price', '');
  const [location, setLocation]     = usePersistentState('listing_loc', '');
  const [harvestDate, setHarvest]   = usePersistentState('listing_harvest', '');
  const [expiryDate, setExpiry]     = usePersistentState('listing_expiry', '');
  const [badges, setBadges]         = useState<string[]>([]);

  // Image state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews]     = useState<string[]>([]);
  const [uploading, setUploading]   = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  // Refs for tracking current state during async voice callbacks
  const cropRef = useRef(crop);
  const categoryRef = useRef(category);
  const quantityRef = useRef(quantity);
  const priceRef = useRef(price);
  const locationRef = useRef(location);
  const harvestRef = useRef(harvestDate);

  React.useEffect(() => { cropRef.current = crop; }, [crop]);
  React.useEffect(() => { categoryRef.current = category; }, [category]);
  React.useEffect(() => { quantityRef.current = quantity; }, [quantity]);
  React.useEffect(() => { priceRef.current = price; }, [price]);
  React.useEffect(() => { locationRef.current = location; }, [location]);
  React.useEffect(() => { harvestRef.current = harvestDate; }, [harvestDate]);

  const showVoiceToast = (msg: string) => {
    setVoiceToast(msg);
    setTimeout(() => setVoiceToast(null), 4000);
  };

  // ── Voice Control ──
  const voiceContext = `
PAGE_CONTEXT: Create New Listing
Form State:
- Crop Type (Required): ${crop || 'Not set'}
- Category (Required): ${category || 'Vegetables'}
- Quantity (Required): ${quantity ? quantity + ' kg' : 'Not set'}
- Price (Required): ${price ? '₹' + price : 'Not set'}
- Location: ${location || 'Not set'}
- Harvest Date (Required): ${harvestDate || 'Not set'}

Available Crop Dropdown Options: ${CROPS.join(', ')}
Available Categories: Vegetables, Fruits, Grains, Dairy, Herbs, Other
(Suggest these to the user if they ask what options they have or what they should sell)

Supported actions schema:
{
  "action": "SET_FIELDS" | "SUBMIT_LISTING",
  "fields": {
    "crop": "crop name or null (e.g. Tomatoes)",
    "category": "category or null (e.g. Vegetables)",
    "quantity": "number or null",
    "price": "number or null",
    "location": "location string or null",
    "harvestDate": "YYYY-MM-DD or null"
  }
}

IMPORTANT: Do NOT use "SUBMIT_LISTING" action UNLESS all required fields are filled. If required fields are missing, use "SET_FIELDS" and ask the user for the remaining information first.
  `.trim();

  const handleVoiceIntent = React.useCallback((intent: any) => {
    if (!intent) return;
    const applyFields = (f: any) => {
      if (!f) return;
      if (f.crop) setCrop(f.crop);
      if (f.category) setCategory(f.category);
      if (f.quantity) setQuantity(String(f.quantity));
      if (f.price) setPrice(String(f.price));
      if (f.location) setLocation(f.location);
      if (f.harvestDate) setHarvest(f.harvestDate);
    };

    if (intent.action === 'SET_FIELDS') {
      applyFields(intent.fields);
      showVoiceToast('✅ Form updated via voice');
    } else if (intent.action === 'SUBMIT_LISTING') {
      applyFields(intent.fields);
      showVoiceToast('⏳ Preparing to submit...');
      setTimeout(() => {
        // Trigger the form submit programmatically
        const f = document.getElementById('listing-form');
        if (f) f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 500);
    }
  }, []);

  useVoice(voiceContext, handleVoiceIntent);

  const toggleBadge = (b: string) =>
    setBadges(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4); // max 4 images
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!crop || !quantity || !price || !harvestDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number(quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) { setError('Please log in first.'); return; }

    setSubmitting(true);
    try {
      // 1. Upload images
      setUploading(true);
      const imageUrls = imageFiles.length > 0 ? await uploadImages() : [];
      setUploading(false);

      // 2. Create listing
      const res = await fetch(`${API}/farmers/batches`, {
        method: 'POST',
        headers: authHeaders() as HeadersInit,
        body: JSON.stringify({
          farmer_id:      user.id,
          crop,
          category,
          quantity:       Number(quantity),
          price_per_unit: Number(price),
          harvest_date:   harvestDate,
          expiry_date:    expiryDate || null,
          location,
          badges,
          images:         imageUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Clear persistence
      const keys = ['listing_crop', 'listing_cat', 'listing_qty', 'listing_price', 'listing_loc', 'listing_harvest', 'listing_expiry'];
      keys.forEach(k => localStorage.removeItem(k));

      navigate('/farmer/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setUploading(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary-600">add_circle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface">Create New Listing</h1>
          </div>
          <p className="text-on-surface-variant text-sm sm:text-base">Fill in the details below to list your produce on the AgroChain marketplace.</p>
        </div>
      </div>

      {/* Voice Action Toast */}
      {voiceToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] bg-gray-900/95 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <span className="material-symbols-outlined text-[18px] text-green-400">mic</span>
          {voiceToast}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="h-2 sm:h-3 md:h-4 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

        <div className="p-5 sm:p-8 md:p-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form id="listing-form" onSubmit={handleSubmit} className="space-y-8">

            {/* 1. Basic Info */}
            <section>
              <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary-600 text-[20px]">info</span>
                1. Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/30 p-6 rounded-2xl border border-outline-variant/10">

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Crop Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">grass</span>
                    <select required value={crop} onChange={e => setCrop(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none text-on-surface">
                      <option value="">Select crop</option>
                      {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                      {crop && !CROPS.includes(crop) && <option value={crop}>{crop}</option>}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50">keyboard_arrow_down</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">category</span>
                    <select required value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none text-on-surface">
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Herbs">Herbs</option>
                      <option value="Other">Other</option>
                      {category && !['Vegetables','Fruits','Grains','Dairy','Herbs','Other'].includes(category) && <option value={category}>{category}</option>}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50">keyboard_arrow_down</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Quantity (kg) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">scale</span>
                    <input type="number" required min="1" placeholder="e.g. 500" value={quantity} onChange={e => setQuantity(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Price per kg (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant/50">₹</span>
                    <input type="number" required min="0.01" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Location</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">location_on</span>
                    <input type="text" placeholder="e.g. Nashik, Maharashtra" value={location} onChange={e => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Timeline & Quality */}
            <section>
              <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">calendar_month</span>
                2. Timeline & Quality
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/30 p-6 rounded-2xl border border-outline-variant/10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Harvest Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={harvestDate} onChange={e => setHarvest(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Estimated Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={e => setExpiry(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-outline-variant/30 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-on-surface" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant">Quality Badges</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {BADGES.map(b => (
                      <button key={b} type="button" onClick={() => toggleBadge(b)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                          ${badges.includes(b)
                            ? 'bg-primary-100 border-primary-500 text-primary-800'
                            : 'border-outline-variant/30 text-on-surface-variant hover:bg-primary-50 hover:border-primary-200'}`}>
                        {badges.includes(b) && '✓ '}{b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Images */}
            <section>
              <h2 className="text-lg font-bold font-headline mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">image</span>
                3. Crop Images
              </h2>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant/20 group">
                      <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                  {previews.length < 4 && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary-400 hover:bg-primary-50 transition-all">
                      <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                      <span className="text-xs mt-1">Add more</span>
                    </button>
                  )}
                </div>
              )}

              {previews.length === 0 && (
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant/50 rounded-2xl p-6 sm:p-10 bg-surface-container-low/30 text-center hover:bg-primary-50/50 hover:border-primary-300 transition-all cursor-pointer group">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                    <span className="material-symbols-outlined text-blue-500 text-2xl sm:text-3xl">add_photo_alternate</span>
                  </div>
                  <h3 className="font-bold text-on-surface mb-1 text-sm sm:text-base">Click to upload or drag & drop</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto">PNG, JPG or WEBP (up to 4 images)</p>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => handleFiles(e.target.files)} />
            </section>

            {/* Trust Banner */}
            <div className="bg-secondary-container rounded-2xl p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-white text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <div>
                <h4 className="font-bold text-white text-sm">Escrow Protection Enabled</h4>
                <p className="text-white/80 text-xs mt-0.5">Payments for this listing will be secured by AgroChain smart escrow.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" onClick={() => navigate('/farmer/listings')}
                className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {uploading ? 'Uploading images…' : 'Publishing…'}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">qr_code</span>
                    Generate QR & Publish
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
