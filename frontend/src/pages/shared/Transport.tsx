import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../../lib/api';

interface Job {
  id: string
  type: string
  status: string
  order: {
    id: string
    quantity: number
    batch: { crop: string; location: string | null; qr_code_url: string | null; farmer: { name: string; phone: string | null } }
    buyer: { name: string; phone: string | null }
  }
}

export default function Transport() {
  const { token } = useParams<{ token: string }>();
  const [job, setJob]         = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [imgUrl, setImgUrl]   = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API}/logistics/jobs/${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setJob(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const markPickup = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/logistics/jobs/${token}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: job.order.batch.qr_code_url, image_url: imgUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setJob(prev => prev ? { ...prev, status: 'IN_PROGRESS' } : prev);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error && !job) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-red-700 mb-2">Invalid Link</h1>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-4xl mb-4 text-center">🚚</div>
        <h1 className="text-2xl font-bold mb-1 text-center">Transport Job</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Token: {token?.slice(0, 12)}…</p>

        {job && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Crop</span><span className="font-bold">{job.order.batch.crop}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-bold">{job.order.quantity} kg</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pickup From</span><span className="font-bold">{job.order.batch.location || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Farmer</span><span className="font-bold">{job.order.batch.farmer.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span>
              <span className={`font-bold ${job.status === 'COMPLETED' ? 'text-green-600' : job.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-amber-600'}`}>{job.status}</span>
            </div>
          </div>
        )}

        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">{success}</div>}
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">{error}</div>}

        {job?.status === 'PENDING' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Proof Image URL (optional)</label>
              <input type="url" value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary-500 text-sm" />
            </div>
            <button onClick={markPickup} disabled={submitting}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
              {submitting ? 'Processing…' : '✅ Confirm Pickup'}
            </button>
          </div>
        )}

        {job?.status === 'IN_PROGRESS' && (
          <div className="text-center py-4 text-green-600 font-bold">Pickup confirmed. Batch is in transit.</div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">No app download required. Just scan and upload proof.</p>
      </div>
    </div>
  );
}
