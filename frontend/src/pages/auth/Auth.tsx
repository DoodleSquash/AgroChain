import React, { useState } from 'react';

type Role = 'farmer' | 'buyer';
type AuthMode = 'login' | 'signup' | 'otp';

export default function Auth({ onBack }: { onBack: () => void }) {
  const [role, setRole] = useState<Role>('farmer');
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [crops, setCrops] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // limit to 1 char
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Focus next input (basic implementation)
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'otp') {
      setMode('otp'); // Simulate sending OTP
    } else {
      // Complete OTP Verification
      alert(`Verified ${role} successfully!`);
      // You would typically call an onLoginSuccess prop here
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col sm:flex-row font-sans">
      
      {/* LEFT PANEL / VISUALS - Hidden on very small screens */}
      <div className="hidden sm:flex sm:w-1/2 bg-primary-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Blobs for Visual flair */}
        <div className="absolute top-[-150px] left-[-150px] w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-50 mix-blend-multiply border-none pointer-events-none"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-primary-400 rounded-full blur-3xl opacity-50 mix-blend-multiply border-none pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3 cursor-pointer" onClick={onBack}>
          <span className="text-3xl">🌿</span>
          <span className="text-2xl font-bold tracking-tight">AgroChain</span>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20">
            <span className="text-sm font-semibold tracking-wide">🌾 Trust Infrastructure</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Farm to Shelf, <br />
            <span className="text-primary-200">Guaranteed.</span>
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            Join the platform connecting farmers directly to supermarkets with escrow payments and true traceability.
          </p>
        </div>

        {/* Floating Mockup Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 flex items-center gap-5 shadow-2xl max-w-sm">
          <div className="bg-white/20 p-4 rounded-full text-2xl">🔒</div>
          <div>
            <div className="font-bold text-white text-lg">Escrow Locked</div>
            <div className="text-primary-100">Payments secured before transit</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL / FORM */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white relative">
        <div className="sm:hidden flex items-center gap-2 mb-10 cursor-pointer" onClick={onBack}>
          <span className="text-2xl">🌿</span>
          <span className="text-xl font-bold text-primary-600">AgroChain</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          {mode !== 'otp' && (
            <div className="mb-10 text-center sm:text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-gray-500">
                {mode === 'login' 
                  ? 'Enter your details to access your dashboard.' 
                  : 'Start trading securely with AgroChain today.'}
              </p>
            </div>
          )}

          {mode === 'otp' && (
            <div className="mb-10 text-center sm:text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Verify Email</h2>
              <p className="text-gray-500">We sent a 4-digit code to <span className="font-semibold text-gray-800">{email}</span></p>
            </div>
          )}

          {/* Toggle Role (Farmer / Buyer) - Only if not entering OTP */}
          {mode !== 'otp' && mode === 'signup' && (
            <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'farmer' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setRole('farmer')}
              >
                🌾 I'm a Farmer
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'buyer' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setRole('buyer')}
              >
                🛒 I'm a Buyer
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {mode === 'otp' ? (
              <div className="flex justify-center sm:justify-start gap-4 mb-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    required
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-14 h-16 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    maxLength={1}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* NAME & EXTRA FIELDS FOR SIGNUP */}
                {mode === 'signup' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400" 
                        placeholder="John Doe" 
                      />
                    </div>

                    {role === 'farmer' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                          <input 
                            type="text" 
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400" 
                            placeholder="State, City" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Crop(s)</label>
                          <input 
                            type="text" 
                            required
                            value={crops}
                            onChange={(e) => setCrops(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400" 
                            placeholder="Tomatoes, Wheat" 
                          />
                        </div>
                      </div>
                    )}
                    {role === 'buyer' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization / Supermarket</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400" 
                          placeholder="FreshMart Ltd" 
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ALWAYS SHOW EMAIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400" 
                    placeholder="you@example.com" 
                  />
                </div>
              </>
            )}

            <button 
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {mode === 'otp' ? 'Verify OTP & Continue' : (mode === 'signup' ? 'Send OTP' : 'Login with OTP')}
            </button>
          </form>

          {/* TOGGLE LOGIN/SIGNUP */}
          {mode !== 'otp' && (
            <p className="mt-8 text-center text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors ml-1 inline-block"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          )}

          {mode === 'otp' && (
            <p className="mt-8 text-center text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button type="button" className="font-semibold text-primary-600 hover:underline">Resend</button>
              <br/>
              <button type="button" onClick={() => setMode('login')} className="mt-4 text-gray-500 hover:text-gray-700 text-sm hover:underline">Back to Login</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
