import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API } from '../../lib/api';

type Role = 'farmer' | 'buyer';
type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as Role) || 'farmer';

  const [role, setRole]           = useState<Role>(initialRole);
  const [mode, setMode]           = useState<AuthMode>('login');
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState('');

  // Form state
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [name, setName]           = useState('');
  const [location, setLocation]   = useState('');
  const [crops, setCrops]         = useState('');
  const [org, setOrg]             = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const endpoint = role === 'farmer' ? '/farmers' : '/supermarket';
  const redirectTo = role === 'farmer' ? '/farmer/dashboard' : '/market/browse';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (mode === 'forgot') { setForgotSent(true); return; }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const body: Record<string, string> = { name, email, phone: '0000000000' }
        if (role === 'farmer') { body.location = location; body.crops = crops; }
        else { body.organization = org; }

        const regRes = await fetch(`${API}${endpoint}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const regText = await regRes.text();
        let regData: Record<string, string>;
        try { regData = JSON.parse(regText); } catch { throw new Error('Backend unreachable. Is the server running?'); }
        if (!regRes.ok) throw new Error(regData.error);

        const verifyRes = await fetch(`${API}${endpoint}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: regData.user_id, otp: regData.debug_otp }),
        });
        const verifyText = await verifyRes.text();
        let verifyData: Record<string, string>;
        try { verifyData = JSON.parse(verifyText); } catch { throw new Error('Backend unreachable. Is the server running?'); }
        if (!verifyRes.ok) throw new Error(verifyData.error);

        localStorage.setItem('token', verifyData.token);
        localStorage.setItem('user', JSON.stringify(verifyData.user));
      } else {
        const res = await fetch(`${API}${endpoint}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const text = await res.text();
        let data: Record<string, string>;
        try { data = JSON.parse(text); } catch { throw new Error('Backend unreachable. Is the server running?'); }
        if (!res.ok) throw new Error(data.error);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate(redirectTo);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col sm:flex-row font-sans">

      {/* LEFT PANEL */}
      <div className="hidden sm:flex sm:w-1/2 bg-primary-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-[-150px] left-[-150px] w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-primary-400 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 cursor-pointer" onClick={onBack}>
          <span className="text-3xl">🌿</span>
          <span className="text-2xl font-bold tracking-tight">AgroChain</span>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20">
            <span className="text-sm font-semibold tracking-wide">🌾 Trust Infrastructure</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Farm to Shelf,<br />
            <span className="text-primary-200">Guaranteed.</span>
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            Join the platform connecting farmers directly to supermarkets with escrow payments and true traceability.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 flex items-center gap-5 shadow-2xl max-w-sm">
          <div className="bg-white/20 p-4 rounded-full text-2xl">🔒</div>
          <div>
            <div className="font-bold text-white text-lg">Escrow Locked</div>
            <div className="text-primary-100">Payments secured before transit</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white">
        <div className="sm:hidden flex items-center gap-2 mb-10 cursor-pointer" onClick={onBack}>
          <span className="text-2xl">🌿</span>
          <span className="text-xl font-bold text-primary-600">AgroChain</span>
        </div>

        <div className="max-w-md w-full mx-auto">

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <>
              <button onClick={() => { setMode('login'); setForgotSent(false); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
                ← Back to login
              </button>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Reset password</h2>
              <p className="text-gray-500 mb-8">Enter your email and we'll send you a reset link.</p>

              {forgotSent ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4 text-sm font-medium">
                  ✅ Reset link sent to <span className="font-bold">{email}</span>. Check your inbox.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                      placeholder="you@example.com" />
                  </div>
                  <button type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    Send Reset Link
                  </button>
                </form>
              )}
            </>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
                <p className="text-gray-500">Enter your credentials to access your dashboard.</p>
              </div>

              {apiError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">{apiError}</div>}

              {/* Role toggle */}
              <div className="flex p-1 bg-gray-100 rounded-xl mb-7">
                <button type="button"
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'farmer' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setRole('farmer')}>
                  🌾 I'm a Farmer
                </button>
                <button type="button"
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'buyer' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setRole('buyer')}>
                  🛒 I'm a Buyer
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="you@example.com" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <button type="button" onClick={() => setMode('forgot')}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold">
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  {loading ? 'Logging in…' : 'Login'}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')}
                  className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors ml-1">
                  Sign up
                </button>
              </p>
            </>
          )}

          {/* ── SIGN UP ── */}
          {mode === 'signup' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Create an account</h2>
                <p className="text-gray-500">Start trading securely with AgroChain today.</p>
              </div>

              {apiError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">{apiError}</div>}

              {/* Role toggle */}
              <div className="flex p-1 bg-gray-100 rounded-xl mb-7">                <button type="button"
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'farmer' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setRole('farmer')}>
                  🌾 I'm a Farmer
                </button>
                <button type="button"
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'buyer' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setRole('buyer')}>
                  🛒 I'm a Buyer
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="John Doe" />
                </div>

                {role === 'farmer' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                      <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder="State, City" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Crop(s)</label>
                      <input type="text" required value={crops} onChange={e => setCrops(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder="Tomatoes, Wheat" />
                    </div>
                  </div>
                )}

                {role === 'buyer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization / Supermarket</label>
                    <input type="text" required value={org} onChange={e => setOrg(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                      placeholder="FreshMart Ltd" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="you@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                      placeholder="Min. 8 characters" minLength={8} />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold">
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}
                  className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors ml-1">
                  Log in
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
