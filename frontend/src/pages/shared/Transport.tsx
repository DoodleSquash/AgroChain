import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../../lib/api';

type Step = 'loading' | 'error' | 'accept' | 'verify' | 'delivery' | 'done';

interface Job {
  id: string; type: string; status: string; token: string;
  order: {
    id: string; quantity: number;
    batch: { crop: string; location: string | null; qr_code_url: string | null; farmer: { name: string; phone: string | null } }
    buyer: { name: string }
  }
}

export default function Transport() {
  const { token } = useParams<{ token: string }>();
  const [job, setJob]       = useState<Job | null>(null);
  const [step, setStep]     = useState<Step>('loading');
  const [error, setError]   = useState('');

  // Verify step state
  const [method, setMethod]   = useState<'qr' | 'otp' | null>(null);
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState('');
  const [submitting, setSub]  = useState(false);
  const [msg, setMsg]         = useState('');

  // Delivery step state
  const [wEmail, setWEmail]     = useState('');
  const [wOtp, setWOtp]         = useState('');
  const [wOtpSent, setWOtpSent] = useState(false);

  useEffect(() => {
    fetch(`${API}/logistics/jobs/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setJob(d);
        // If already in progress or completed, skip to verify/done
        if (d.status === 'COMPLETED') setStep('done');
        else if (d.status === 'IN_PROGRESS') setStep('delivery');
        else setStep('accept');
      })
      .catch(e => { setError(e.message); setStep('error'); });
  }, [token]);

  const acceptJob = () => setStep('verify');

  const sendOtp = async () => {
    setSub(true); setMsg('');
    try {
      const res = await fetch(`${API}/logistics/jobs/${token}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setOtpSent(true);
      setMsg(d.debug_otp ? `OTP sent. (Dev: ${d.debug_otp})` : 'OTP sent to farmer email.');
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setSub(false); }
  };

  const verifyOtp = async () => {
    setSub(true); setMsg('');
    try {
      const res = await fetch(`${API}/logistics/jobs/${token}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg(d.message);
      setStep('done');
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setSub(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const markPickupQR = async () => {
    setSub(true); setMsg('');
    try {
      let uploadedUrl: string | null = null;

      // Upload image if selected
      if (imgFile) {
        const form = new FormData();
        form.append('file', imgFile);
        const upRes = await fetch(`${API}/upload?folder=pickups`, {
          method: 'POST',
          body: form,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || 'Image upload failed');
        uploadedUrl = upData.url;
      }

      const res = await fetch(`${API}/logistics/jobs/${token}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: token, image_url: uploadedUrl }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg(d.message);
      setStep('delivery');
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setSub(false); }
  };

  const sendDeliveryOtp = async () => {
    setSub(true); setMsg('');
    try {
      const res = await fetch(`${API}/logistics/jobs/${token}/verify-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouse_email: wEmail }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setWOtpSent(true);
      setMsg(d.debug_otp ? `OTP sent. (Dev: ${d.debug_otp})` : 'OTP sent to warehouse collector email.');
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setSub(false); }
  };

  const verifyDeliveryOtp = async () => {
    setSub(true); setMsg('');
    try {
      const res = await fetch(`${API}/logistics/jobs/${token}/verify-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouse_email: wEmail, otp: wOtp }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg(d.message);
      setStep('done');
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setSub(false); }
  };

  // ── LOADING ──
  if (step === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── ERROR ──
  if (step === 'error') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-red-700 mb-2">Invalid Link</h1>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  // ── DONE ──
  if (step === 'done') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-green-100">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Pickup Confirmed!</h1>
        <p className="text-gray-500 text-sm mb-4">{msg || 'The batch has been marked as picked up. 40% escrow released to farmer.'}</p>
        <div className="bg-green-50 rounded-2xl p-4 text-left text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Crop</span><span className="font-bold">{job?.order.batch.crop}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-bold">{job?.order.quantity} kg</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-bold text-green-600">In Transit</span></div>
        </div>
      </div>
    </div>
  );

  // ── ACCEPT JOB ──
  if (step === 'accept' && job) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Transport Job</p>
              <h1 className="text-xl font-extrabold">Delivery Assignment</h1>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-blue-200">Crop</span><span className="font-bold">{job.order.batch.crop}</span></div>
            <div className="flex justify-between"><span className="text-blue-200">Quantity</span><span className="font-bold">{job.order.quantity} kg</span></div>
            <div className="flex justify-between"><span className="text-blue-200">Pickup From</span><span className="font-bold">{job.order.batch.location || '—'}</span></div>
            <div className="flex justify-between"><span className="text-blue-200">Farmer</span><span className="font-bold">{job.order.batch.farmer.name}</span></div>
            <div className="flex justify-between"><span className="text-blue-200">Buyer</span><span className="font-bold">{job.order.buyer.name}</span></div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            By accepting this job, you confirm you will pick up the batch and deliver it to the buyer. Pickup must be verified via QR scan or OTP.
          </p>

          <button onClick={acceptJob}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            Accept & Start Job
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Token: {token?.slice(0, 16)}…
          </p>
        </div>
      </div>
    </div>
  );

  // ── VERIFY PICKUP ──
  if (step === 'verify' && job) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Step 2 of 2</p>
              <h1 className="text-lg font-extrabold">Verify Pickup</h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-sm mb-6">Choose how to verify you've picked up the batch:</p>

          {/* Method selector */}
          {!method && (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setMethod('qr')}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-4xl text-blue-600">qr_code_scanner</span>
                <span className="font-bold text-sm text-gray-900">Scan QR Code</span>
                <span className="text-xs text-gray-400 text-center">Use the batch QR code</span>
              </button>
              <button onClick={() => setMethod('otp')}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-4xl text-green-600">sms</span>
                <span className="font-bold text-sm text-gray-900">Verify via OTP</span>
                <span className="text-xs text-gray-400 text-center">Enter farmer's email</span>
              </button>
            </div>
          )}

          {/* QR method */}
          {method === 'qr' && (
            <div className="space-y-4">
              <button onClick={() => setMethod(null)} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
              </button>
              <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 font-medium">
                Scan or photograph the QR code on the batch package to confirm pickup.
              </div>

              {/* File picker */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Proof Photo</label>
                <label className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                  ${imgPreview ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                  {imgPreview
                    ? <img src={imgPreview} alt="preview" className="w-full max-h-48 object-cover rounded-xl" />
                    : <>
                        <span className="material-symbols-outlined text-4xl text-blue-400">add_a_photo</span>
                        <span className="text-sm font-bold text-gray-600">Take Photo or Select from Gallery</span>
                        <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
                      </>
                  }
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                </label>
                {imgPreview && (
                  <button onClick={() => { setImgFile(null); setImgPreview(''); }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium">
                    Remove photo
                  </button>
                )}
              </div>

              {msg && <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('pending') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
              <button onClick={markPickupQR} disabled={submitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
                {submitting ? 'Verifying…' : '✅ Confirm Pickup via QR'}
              </button>
            </div>
          )}

          {/* OTP method */}
          {method === 'otp' && (
            <div className="space-y-4">
              <button onClick={() => { setMethod(null); setOtpSent(false); setOtp(''); setMsg(''); }}
                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
              </button>

              {!otpSent ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Farmer's Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. farmer@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-500 text-sm" />
                    <p className="text-xs text-gray-400 mt-1">Enter the email address registered by the farmer</p>
                  </div>
                  {msg && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">{msg}</div>}
                  <button onClick={sendOtp} disabled={submitting || !email}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
                    {submitting ? 'Sending…' : 'Send OTP to Farmer Email'}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 rounded-2xl p-4 text-sm text-green-700 font-medium">
                    OTP sent to <span className="font-bold">{email}</span>. Ask the farmer to share the 6-digit code.
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Enter OTP</label>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                      placeholder="6-digit OTP" maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-500 text-sm text-center text-2xl font-bold tracking-widest" />
                  </div>
                  {msg && <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('pending') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
                  <button onClick={verifyOtp} disabled={submitting || otp.length < 6}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
                    {submitting ? 'Verifying…' : '✅ Verify & Confirm Pickup'}
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtp(''); setMsg(''); }}
                    className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── CONFIRM DELIVERY ──
  if (step === 'delivery' && job) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="bg-blue-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Job In Transit</p>
              <h1 className="text-lg font-extrabold">Confirm Delivery</h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 -mx-6 -mt-6 p-6 mb-6 border-b border-blue-100">
             <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Batch Successfully Picked Up</h3>
             <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Currently Holding:</span><span className="font-bold text-gray-900">{job.order.batch.crop} ({job.order.quantity} kg)</span></div>
             </div>
          </div>

          <p className="text-gray-500 text-sm mb-6">Enter the warehouse collector's email to initiate delivery verification:</p>

          <div className="space-y-4">
            {!wOtpSent ? (
               <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Warehouse Person's Email</label>
                    <input type="email" value={wEmail} onChange={e => setWEmail(e.target.value)}
                      placeholder="e.g. collector@warehouse.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 text-sm" />
                    <p className="text-xs text-gray-400 mt-1">Must be an authorized warehouse member email.</p>
                  </div>
                  {msg && <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('invalid') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{msg}</div>}
                  <button onClick={sendDeliveryOtp} disabled={submitting || !wEmail}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
                    {submitting ? 'Verifying Member...' : 'Send OTP to Collector'}
                  </button>
               </>
            ) : (
               <>
                  <div className="bg-green-50 rounded-2xl p-4 text-sm text-green-700 font-medium">
                    OTP sent to <span className="font-bold">{wEmail}</span>. Ask the collector for the 6-digit code.
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Enter Delivery OTP</label>
                    <input type="text" value={wOtp} onChange={e => setWOtp(e.target.value)}
                      placeholder="6-digit OTP" maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-500 text-sm text-center text-2xl font-bold tracking-widest" />
                  </div>
                  {msg && <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('pending') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
                  <button onClick={verifyDeliveryOtp} disabled={submitting || wOtp.length < 6}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
                    {submitting ? 'Verifying...' : '✅ Complete Delivery'}
                  </button>
                  <button onClick={() => { setWOtpSent(false); setWOtp(''); setMsg(''); }}
                    className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">
                    Change Email / Resend
                  </button>
               </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}
