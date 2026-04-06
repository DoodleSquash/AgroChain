import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

interface UserProfile {
  id: string;
  name: string;
  role: 'FARMER' | 'BUYER';
  email: string;
  phone: string | null;
  is_verified: boolean;
  created_at: string;
  profile: {
    location: string | null;
    bio: string | null;
    profile_picture: string | null;
    farmer_type?: string | null;
    rating?: number;
    review_count?: number;
    company_name?: string | null;
    purchasing_prefs?: string | null;
  } | null;
  batches: {
    id: string;
    crop: string;
    category: string;
    quantity: number;
    price_per_unit: number;
    images: { image_url: string }[];
  }[];
  sellerOrders?: {
    id: string;
    total_amount: number;
    quantity: number;
    created_at: string;
    buyer: { name: string };
    batch: { crop: string };
  }[];
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'history'>('listings');
  const [newReview, setNewReview] = useState('');
  
  const [connections, setConnections] = useState<any[]>([]);
  const [showConnectionsPopup, setShowConnectionsPopup] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<UserProfile>(`/public/profile/${id}`);
        setUser(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    const fetchConnectionsList = async () => {
      try {
        const data = await apiFetch<any[]>(`/chat/connections/${id}`);
        setConnections(data);
      } catch (e) {
        console.error(e);
      }
    };
    if (id) {
       fetchProfile();
       fetchConnectionsList();
    }
  }, [id]);

  const isConnecting = () => connections.some(c => c.id === currentUser.id);

  const handleConnect = async () => {
    if (!id || !currentUser.id) return;
    try {
      setConnecting(true);
      await apiFetch('/chat/connect', { method: 'POST', body: JSON.stringify({ targetId: id }) });
      // Re-fetch connections
      const data = await apiFetch<any[]>(`/chat/connections/${id}`);
      setConnections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  };

  const handleMessageClick = () => {
    if (!id) return;
    const isCurrentUserFarmer = currentUser.role === 'FARMER';
    navigate(`/${isCurrentUserFarmer ? 'farmer' : 'market'}/chats?userId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-sm w-full">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">person_off</span>
          <h2 className="text-lg font-bold text-gray-900">Profile Not Found</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">{error || 'This user does not exist or has been removed.'}</p>
          <button onClick={() => navigate(-1)} className="bg-gray-100 text-gray-800 font-bold px-6 py-2.5 rounded-full text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  const isFarmer = user.role === 'FARMER';

  return (
    <div className="min-h-svh bg-zinc-50 text-[#191c1e] pb-24 relative" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Subtle organic background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83v58.34h-58.34l-.83-.83L0 54.627v-58.34h58.34l.83.83z\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />
      {/* Header Cover & Nav */}
      <div className="h-48 bg-gradient-to-br from-green-600 via-primary-700 to-blue-800 relative overflow-hidden">
        {/* Soft abstract shapes in background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-300 opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/20 cursor-pointer shadow-sm z-10"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-6 lg:px-8 -mt-20 relative z-10">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 relative isolation-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            
            <div className="relative cursor-pointer group shrink-0 z-20 -mt-16 md:-mt-20" onClick={() => setShowConnectionsPopup(true)}>
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] overflow-hidden border-[6px] border-white shadow-md bg-white">
                {user.profile?.profile_picture ? (
                  <img src={user.profile.profile_picture} alt={user.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-5xl font-bold group-hover:opacity-90 transition-opacity">
                    {user.name[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1 group-hover:bg-blue-700 transition-colors">
                 <span className="material-symbols-outlined text-[14px]">diversity_3</span>
                 {connections.length}
              </div>
            </div>

            <div className="flex-1 pt-2 md:pt-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{user.name}</h1>
                {user.is_verified && (
                  <span className="material-symbols-outlined text-[#006b2c] mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-500 font-medium">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">work</span> {isFarmer ? (user.profile?.farmer_type || 'Farmer') : (user.profile?.company_name || 'Buyer')}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {user.profile?.location || 'Location Unknown'}</span>
                {isFarmer && <span className="flex items-center gap-1 text-amber-500"><span className="material-symbols-outlined text-[16px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {user.profile?.rating || 0} ({user.profile?.review_count || 0} reviews)</span>}
              </div>
            </div>

            {id !== currentUser.id && (
              <div className="flex gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                 <button onClick={handleMessageClick} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-700 text-white font-bold px-6 py-3 rounded-full hover:bg-blue-800 transition-colors cursor-pointer border-none shadow-[0_4px_12px_rgba(0,81,213,0.3)]">
                   <span className="material-symbols-outlined text-[20px]">chat</span>
                   Message
                 </button>
                 <button onClick={handleConnect} disabled={connecting} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 text-gray-800 font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors cursor-pointer border-none disabled:opacity-70">
                   {connecting ? <span className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"/> : (
                     <>
                       <span className="material-symbols-outlined text-[20px]">{isConnecting() ? 'how_to_reg' : 'person_add'}</span>
                       {isConnecting() ? 'Connected' : 'Connect'}
                     </>
                   )}
                 </button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                 {user.profile?.bio || user.profile?.purchasing_prefs || "No bio provided."}
              </p>
            </div>
            
            <div className="flex-1 md:max-w-xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f7f9fb] flex items-center justify-center text-gray-400 shrink-0">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 break-all">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f7f9fb] flex items-center justify-center text-gray-400 shrink-0">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Component */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-8">
          {isFarmer && (
            <button 
              onClick={() => setActiveTab('listings')}
              className={`pb-4 px-2 text-[15px] font-bold transition-all relative ${activeTab === 'listings' ? 'text-blue-700' : 'text-gray-400 hover:text-gray-700'} bg-transparent border-none cursor-pointer`}
            >
              Active Listings ({user.batches.length})
              {activeTab === 'listings' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-700 rounded-t-full" />}
            </button>
          )}
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-2 text-[15px] font-bold transition-all relative ${activeTab === 'history' ? 'text-blue-700' : 'text-gray-400 hover:text-gray-700'} bg-transparent border-none cursor-pointer`}
          >
            Order History
            {activeTab === 'history' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-700 rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-2 text-[15px] font-bold transition-all relative ${activeTab === 'reviews' ? 'text-blue-700' : 'text-gray-400 hover:text-gray-700'} bg-transparent border-none cursor-pointer`}
          >
            Reviews ({user.profile?.review_count || 0})
            {activeTab === 'reviews' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-700 rounded-t-full" />}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'listings' && isFarmer && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

            {user.batches.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">inventory_2</span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Listings</h3>
                <p className="text-[13px] text-gray-500">This farmer currently doesn't have any produce listed for sale.</p>
              </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {user.batches.map(batch => {
                   const cropLower = batch.crop.toLowerCase();
                   const imgSrc = batch.images?.[0]?.image_url ||
                     (cropLower.includes('tomato') ? '/product_tomatoes.png' :
                      cropLower.includes('tulsi') || cropLower.includes('spinach') || cropLower.includes('herb') || cropLower.includes('leaf') || cropLower.includes('leaves') ? '/product_tulsi.png' :
                      cropLower.includes('milk') || cropLower.includes('dairy') ? '/product_milk.png' :
                      cropLower.includes('berry') || cropLower.includes('berr') || cropLower.includes('mango') || cropLower.includes('fruit') ? '/product_berries.png' :
                      '/product_tomatoes.png');

                   return (
                     <div key={batch.id} className="group bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                       <div className="h-36 relative overflow-hidden bg-gray-100">
                         <img src={imgSrc} alt={batch.crop} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                         <div className="absolute bottom-3 left-3 bg-[#006b2c] text-white text-xs font-extrabold px-3 py-1 rounded-full">
                           ₹{batch.price_per_unit} / unit
                         </div>
                       </div>
                       <div className="p-4 flex flex-col flex-1">
                         <div className="flex justify-between items-start gap-2 mb-3">
                           <h4 className="font-extrabold text-[#191c1e] text-base leading-tight">{batch.crop}</h4>
                           <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{batch.category}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-auto mb-4">
                           <span className="material-symbols-outlined text-[14px]">scale</span> {batch.quantity} kg available
                         </div>
                         <button 
                            onClick={() => navigate(`/market/batch/${batch.id}`)}
                            className="w-full bg-surface-container/50 border border-gray-200 text-gray-800 font-bold text-[12px] py-2 rounded-xl hover:bg-gray-100 transition-colors border-none"
                         >
                           View Details
                         </button>
                       </div>
                     </div>
                   );
                 })}
               </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {user.sellerOrders && user.sellerOrders.length > 0 ? (
               <div className="space-y-4">
                 <h3 className="font-extrabold text-gray-900 mb-4 text-base">Completed Sales ({user.sellerOrders.length})</h3>
                 {user.sellerOrders.map(order => (
                   <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                         <span className="material-symbols-outlined">inventory_2</span>
                       </div>
                       <div>
                         <h4 className="font-bold text-gray-900 text-sm">Sold {order.quantity}kg of {order.batch.crop}</h4>
                         <p className="text-xs text-gray-500 font-medium">To {order.buyer.name} • {new Date(order.created_at).toLocaleDateString()}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="font-extrabold text-[#006b2c]">₹{order.total_amount.toLocaleString('en-IN')}</span>
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px]">history</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  No Completed Orders Yet
                </h3>
                <p className="text-[13px] text-gray-500 max-w-sm mx-auto">
                  {user.name} hasn't completed any tracked orders through AgroChain yet. Check back later!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
               {(user.profile?.review_count || 0) === 0 && (
                 <div className="bg-white p-10 rounded-[24px] border border-gray-100 shadow-sm text-center">
                   <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">rate_review</span>
                   <p className="text-sm font-semibold text-gray-900">No reviews yet.</p>
                   <p className="text-[13px] text-gray-500 mt-1">Be the first to leave a review after completing a transaction!</p>
                 </div>
               )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm sticky top-24">
                <h3 className="font-extrabold text-gray-900 mb-4 text-base">Leave a Review</h3>
                <div className="flex items-center gap-1 text-gray-300 mb-4 cursor-pointer">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-2xl hover:text-amber-400">★</span>)}
                </div>
                <textarea 
                  value={newReview}
                  onChange={e => setNewReview(e.target.value)}
                  placeholder="Share your experience working with this user..."
                  className="w-full bg-[#f7f9fb] border border-gray-100 rounded-xl p-3 text-sm min-h-[100px] outline-none focus:border-blue-500 focus:bg-white transition-all resize-none mb-4"
                />
                <button className="w-full bg-blue-700 text-white font-bold py-3 rounded-full hover:bg-blue-800 transition-colors shadow-sm cursor-pointer border-none text-[13px]">
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Connections Popup */}
      {showConnectionsPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConnectionsPopup(false)} />
          <div className="bg-white rounded-[24px] w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col z-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#f7f9fb]">
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">diversity_3</span>
                Connections ({connections.length})
              </h3>
              <button onClick={() => setShowConnectionsPopup(false)} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {connections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">group_off</span>
                  <p className="text-sm font-medium">No connections yet</p>
                </div>
              ) : (
                connections.map(c => {
                  const isMutual = currentUser.id === c.id; // basic definition for demo
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors cursor-pointer" onClick={() => {
                        setShowConnectionsPopup(false);
                        navigate(`/profile/${c.id}`);
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center border border-gray-100 shrink-0">
                           {c.profile?.profile_picture ? (
                             <img src={c.profile.profile_picture} alt={c.name} className="w-full h-full object-cover" />
                           ) : (
                             <span className="font-bold text-primary-700">{c.name.charAt(0)}</span>
                           )}
                        </div>
                        <div>
                          <h4 className="font-bold text-[14px] text-gray-900 leading-none mb-1">{c.name}</h4>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{c.role}</span>
                        </div>
                      </div>
                      {isMutual && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">You</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
