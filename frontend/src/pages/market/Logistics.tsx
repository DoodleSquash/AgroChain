import { useEffect, useState, useCallback, useMemo } from 'react';
import { apiFetch } from '../../lib/api';

interface Job {
  id: string
  type: string
  token: string
  link_url: string
  status: string
  details: any
}

interface Order {
  id: string
  quantity: number
  status: string
  batch: { crop: string; location: string | null }
  jobs?: Job[]
}

export default function Logistics() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Lists for dropdowns
  const [savedTransporters, setSavedTransporters] = useState<any[]>([]);
  const [savedWarehouses, setSavedWarehouses] = useState<any[]>([]);

  // Transport form
  const [tOrderId, setTOrderId]   = useState('');
  const [driverName, setDriver]   = useState('');
  const [vehicle, setVehicle]     = useState('');
  const [driverEmail, setEmail]   = useState('');
  const [targetWH, setTargetWH]   = useState(''); 
  const [tGenerating, setTGen]    = useState(false);
  const [tError, setTError]       = useState('');

  // Filtering for list
  const [filterStatus, setFilterStatus] = useState('All');

  // Edit State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ driver_name: '', vehicle_number: '', driver_email: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Memoize user to avoid dependency changes unless localStorage changes
  const user = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u;
    } catch {
      return {};
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const [orderData, transData, whData] = await Promise.all([
        apiFetch<Order[]>(`/supermarket/orders?buyer_id=${user.id}`),
        apiFetch<any[]>(`/supermarket/transporters?buyer_id=${user.id}`),
        apiFetch<any[]>(`/supermarket/warehouses?buyer_id=${user.id}`)
      ]);

      setOrders(orderData);
      setSavedTransporters(transData);
      setSavedWarehouses(whData);
      
      const active = orderData.filter(o => ['PENDING', 'IN_TRANSIT'].includes(o.status));
      if (active.length > 0 && !tOrderId) {
        setTOrderId(active[0].id);
        const whId = (active[0] as any).warehouse_id;
        if (whId) setTargetWH(whId);
      }
    } catch (err: any) {
      console.error('[Logistics] API Error:', err);
      setTError('Connectivity error. Unable to link with logistics server.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, tOrderId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTransporterSelect = (id: string) => {
    const selected = savedTransporters.find(t => t.id === id);
    if (selected) {
      setDriver(selected.name);
      setEmail(selected.email);
      // Phone is also available if needed
    } else {
      setDriver('');
      setEmail('');
    }
  };

  const handleOrderChange = (id: string) => {
    setTOrderId(id);
    const order = orders.find(o => o.id === id);
    const whId = (order as any)?.warehouse_id;
    if (whId) setTargetWH(whId);
  };

  const generateTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tOrderId) return;
    setTError(''); setTGen(true);
    try {
      await apiFetch<any>(`/supermarket/orders/${tOrderId}/logistics`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'TRANSPORT',
          details: { 
            driver_name: driverName, 
            vehicle_number: vehicle, 
            driver_email: driverEmail,
            warehouse_id: targetWH // Inform transporter of target
          },
        }),
      });
      
      setDriver(''); setVehicle(''); setEmail('');
      await fetchOrders();
    } catch (err: any) {
      setTError(err.message || 'Transmission failed.');
    } finally {
      setTGen(false);
    }
  };

  const startEditing = (job: Job) => {
    setEditingJobId(job.id);
    setEditForm({
      driver_name: job.details?.driver_name || '',
      vehicle_number: job.details?.vehicle_number || '',
      driver_email: job.details?.driver_email || ''
    });
  };

  const clearEdit = () => {
    setEditingJobId(null);
    setEditForm({ driver_name: '', vehicle_number: '', driver_email: '' });
  };

  const handleUpdateJob = async () => {
    if (!editingJobId) return;
    setEditLoading(true);
    try {
      await apiFetch(`/supermarket/logistics/${editingJobId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      await fetchOrders();
      clearEdit();
    } catch (err: any) {
      alert(err.message || 'Failed to update job');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to completely remove this logistics link?')) return;
    try {
      await apiFetch(`/supermarket/logistics/${jobId}`, {
         method: 'DELETE'
      });
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailErrorStatus, setEmailErrorStatus] = useState('');

  const handleSendEmail = async (jobId: string) => {
    setEmailErrorStatus('');
    setEmailSuccess('');
    try {
      await apiFetch(`/supermarket/logistics/${jobId}/send-email`, {
        method: 'POST'
      });
      setEmailSuccess('Email assigned and sent securely to transporter!');
      setTimeout(() => setEmailSuccess(''), 5000);
    } catch (err: any) {
      setEmailErrorStatus(err.message || 'Failed to send automated email.');
      setTimeout(() => setEmailErrorStatus(''), 7000);
    }
  };

  const orderLabel = (o: Order) => `${o.id.slice(0,8).toUpperCase()} — ${o.batch.crop} (${o.quantity}kg)`;

  const transportJobs = orders.flatMap(o => 
    (o.jobs || []).filter(j => j.type === 'TRANSPORT').map(j => ({ ...j, order: o }))
  );
  
  const filteredJobs = transportJobs.filter(j => {
    if (filterStatus === 'All') return true;
    return j.order.status === filterStatus;
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto pb-10 lg:pb-20 relative">
      
      {/* Toast Notification (Success) */}
      {emailSuccess && (
        <div className="fixed bottom-10 right-10 z-50 bg-gray-900 border border-gray-800 text-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 animate-fade-in-up">
          <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div>
            <div className="font-bold text-sm">Transporter Notified</div>
            <div className="text-xs text-gray-400">{emailSuccess}</div>
          </div>
        </div>
      )}

      {/* Toast Notification (Error) */}
      {emailErrorStatus && (
        <div className="fixed bottom-10 right-10 z-50 bg-gray-900 border border-gray-800 text-white shadow-2xl rounded-2xl px-6 py-4 flex flex-col gap-1 max-w-sm animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">error</span>
            </div>
            <div className="font-bold text-sm">Email Dispatch Failed</div>
          </div>
          <div className="text-[10px] text-gray-400 font-mono mt-1 w-full line-clamp-3">
             {emailErrorStatus}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 text-primary-900">Logistics Control Tower</h1>
        <p className="text-sm sm:text-lg text-gray-500 font-medium max-w-2xl">
          Assign jobs to transporters and manage secure deployment channels.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-gray-900">Initializing secure link protocol...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10">

          {/* ── TRANSPORT GENERATOR ── */}
          <div className="xl:col-span-1 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-2xl shadow-gray-200/40 relative overflow-hidden flex flex-col h-fit md:sticky top-6">
            <div className="hidden sm:flex absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-bl-[100px] items-start justify-end p-6 -z-0">
              <span className="material-symbols-outlined text-5xl text-blue-200">local_shipping</span>
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              <h2 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 sm:hidden">local_shipping</span>
                Assign Transporter
              </h2>
              <p className="text-gray-500 text-sm mb-6 sm:pr-12 leading-relaxed font-semibold">
                Generate and dispatch secure link to driver.
              </p>

              {tError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-xs font-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {tError}
                </div>
              )}

              <form onSubmit={generateTransport} className="space-y-4 flex-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Order Target</label>
                  <select 
                    required 
                    value={tOrderId} 
                    onChange={e => handleOrderChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all"
                  >
                    {orders.filter(o => ['PENDING', 'IN_TRANSIT'].includes(o.status)).length === 0 ? (
                      <option value="">No Processable Orders</option>
                    ) : (
                      orders.filter(o => ['PENDING', 'IN_TRANSIT'].includes(o.status)).map(o => (
                        <option key={o.id} value={o.id}>{orderLabel(o)}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transporter / Member</label>
                  <select
                    required
                    value={savedTransporters.find(t => t.name === driverName)?.id || ''}
                    onChange={e => handleTransporterSelect(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="" disabled>Select a transporter</option>
                    {savedTransporters.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {savedTransporters.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-bold ml-1">No transporters saved. Add them in the Transporters section first.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination Warehouse</label>
                  <select 
                    required 
                    value={targetWH} 
                    onChange={e => setTargetWH(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="">Select Target WH</option>
                    {savedWarehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name} ({wh.location})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Email</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="driver@email.com" 
                      value={driverEmail} 
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder-gray-400 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vehicle</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="MH12AB" 
                      value={vehicle} 
                      onChange={e => setVehicle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder-gray-400 uppercase transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={tGenerating || !tOrderId}
                  className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 text-white font-black text-sm rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {tGenerating ? 'progress_activity' : 'send'}
                  </span>
                  {tGenerating ? 'Dispatching...' : 'Dispatch Hub Link'}
                </button>
              </form>
            </div>
          </div>

          {/* ── ACTIVE LINKS LIST ── */}
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/20 overflow-hidden flex flex-col h-fit">
            <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:row gap-4 justify-between items-start sm:items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Active Deployments</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{transportJobs.length} Links Active</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 <select 
                   value={filterStatus}
                   onChange={e => setFilterStatus(e.target.value)}
                   className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2 font-black text-[10px] uppercase outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                 >
                   <option value="All">All Jobs</option>
                   <option value="PENDING">Pending Pickup</option>
                   <option value="IN_TRANSIT">In Transit</option>
                   <option value="DELIVERED">Delivered</option>
                 </select>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[350px]">
              {filteredJobs.length === 0 ? (
                <div className="py-28 text-center bg-gray-50/30 h-full flex flex-col items-center justify-center">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                     <span className="material-symbols-outlined text-gray-200 text-[40px]">link_off</span>
                   </div>
                   <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No Active Deployments</p>
                   <p className="text-gray-300 text-xs mt-2 font-bold max-w-[200px] text-center">Assign a driver to initialize the logistics chain.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-400 text-[9px] uppercase tracking-[0.2em] font-black">
                      <th className="p-5 pl-8 border-b border-gray-100">Manifest Reference</th>
                      <th className="p-5 border-b border-gray-100 hidden sm:table-cell">Details</th>
                      <th className="p-5 pr-8 border-b border-gray-100 text-right w-1/3">Channel Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold">
                    {filteredJobs.map(job => (
                      <tr key={job.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="p-5 pl-8 align-top">
                           <div className="font-extrabold text-gray-900 text-xs mb-2 flex items-center gap-2">
                             <span className="text-blue-500 text-lg">#</span>
                             {job.order.id.slice(0,8).toUpperCase()}
                           </div>
                           <div className={`inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full border shadow-sm ${
                              job.order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              job.order.status === 'IN_TRANSIT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                           }`}>
                             {job.order.status.replace('_', ' ')}
                           </div>
                        </td>
                        <td className="p-5 align-top hidden sm:table-cell" colSpan={editingJobId === job.id ? 2 : 1}>
                           {editingJobId === job.id ? (
                              <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-xl shadow-blue-900/5 mb-2 -ml-2 -mr-8">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-blue-500">edit_square</span> Edit Transporter
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                  <input 
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Driver Name" 
                                    value={editForm.driver_name} 
                                    onChange={e => setEditForm({ ...editForm, driver_name: e.target.value })} 
                                  />
                                  <input 
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                                    placeholder="Vehicle Number" 
                                    value={editForm.vehicle_number} 
                                    onChange={e => setEditForm({ ...editForm, vehicle_number: e.target.value })} 
                                  />
                                  <input 
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none sm:col-span-2" 
                                    placeholder="Driver Email" 
                                    type="email"
                                    value={editForm.driver_email} 
                                    onChange={e => setEditForm({ ...editForm, driver_email: e.target.value })} 
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button onClick={clearEdit} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                                  <button onClick={handleUpdateJob} disabled={editLoading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md">
                                    {editLoading ? 'Saving...' : 'Save Details'}
                                  </button>
                                </div>
                              </div>
                           ) : (
                              <div className="flex flex-col">
                                <div className="font-black text-xs text-gray-900 mb-1.5">{job.details?.driver_name || 'Assigned Driver'}</div>
                                <div className="flex flex-col gap-1">
                                  <div className="text-[10px] text-gray-500 font-mono font-bold flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px] text-gray-400">local_shipping</span>
                                    {job.details?.vehicle_number || 'TRK-XXXX'}
                                  </div>
                                  <div className="text-[10px] text-blue-600 font-black flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">mail</span>
                                    {job.details?.driver_email || 'NO_RECORD'}
                                  </div>
                                </div>
                              </div>
                           )}
                        </td>
                        {editingJobId !== job.id && (
                          <td className="p-5 pr-8 align-top">
                             <div className="flex items-center justify-end gap-2">
                                <a 
                                  href={job.type === 'TRANSPORT'
                                    ? `${window.location.origin}/delivery/${job.token}`
                                    : `${window.location.origin}/warehouse/${job.token}`}
                                  target="_blank" 
                                  rel="noreferrer" 
                                  title="View QR Link"
                                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 hover:rotate-6 transition-all shadow-sm group"
                                >
                                  <span className="material-symbols-outlined text-[18px] group-hover:scale-110">qr_code_scanner</span>
                                </a>
                                <button 
                                  onClick={() => handleSendEmail(job.id)}
                                  title="Send Email via AgroChain"
                                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:-rotate-6 transition-all shadow-sm group"
                                >
                                  <span className="material-symbols-outlined text-[18px] group-hover:scale-110">send</span>
                                </button>
                                <button 
                                  onClick={() => startEditing(job)} 
                                  title="Edit Assignment"
                                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-[18px]">tune</span>
                                </button>
                                <button 
                                  onClick={() => handleDeleteJob(job.id)} 
                                  title="Revoke / Delete Link"
                                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                             </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
