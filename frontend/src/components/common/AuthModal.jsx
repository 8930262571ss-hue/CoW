import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ mode = 'login', onClose, onSwitchMode }) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1B1B1B] border border-[#C9A667]/40 rounded-tailored-lg p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)] velvet-texture">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#e6e2db]/50 hover:text-[#C9A667] transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-[#C9A667]/10 mb-3 border border-[#C9A667]/30">
            <span className="material-symbols-outlined text-[#C9A667] text-2xl">lock</span>
          </div>
          <h2 className="font-serif text-2xl text-[#C9A667] font-bold">
            {mode === 'login' ? 'Welcome Back' : 'Join The Sanctuary'}
          </h2>
          <p className="text-xs text-[#e6e2db]/60 mt-1 font-sans">
            {mode === 'login'
              ? 'Access your saved journeys and exclusive preferences'
              : 'Create your private guest account in moments'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-[#6E1F2B]/30 border border-[#ffb2b7]/30 text-xs text-[#ffb2b7]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-widest text-[#C9A667] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#141310] border border-[#C9A667]/30 rounded-lg px-4 py-2.5 text-sm text-[#e6e2db] placeholder-[#e6e2db]/30 focus:outline-none focus:border-[#C9A667]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-widest text-[#C9A667] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#141310] border border-[#C9A667]/30 rounded-lg px-4 py-2.5 text-sm text-[#e6e2db] placeholder-[#e6e2db]/30 focus:outline-none focus:border-[#C9A667]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-sans uppercase tracking-widest text-[#C9A667] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guest@cafeonwheels.com"
              className="w-full bg-[#141310] border border-[#C9A667]/30 rounded-lg px-4 py-2.5 text-sm text-[#e6e2db] placeholder-[#e6e2db]/30 focus:outline-none focus:border-[#C9A667]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans uppercase tracking-widest text-[#C9A667] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#141310] border border-[#C9A667]/30 rounded-lg px-4 py-2.5 text-sm text-[#e6e2db] placeholder-[#e6e2db]/30 focus:outline-none focus:border-[#C9A667]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase py-3 rounded-full soft-glow hover:opacity-90 transition-all mt-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-[10px] text-center tracking-wider uppercase text-[#e6e2db]/50 mb-2">
            Instant Demo Logins
          </p>
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              onClick={() => fillQuickAccount('customer@cafeonwheels.com', 'customer123')}
              className="text-[11px] px-3 py-1 bg-[#141310] border border-[#C9A667]/40 rounded-full text-[#C9A667] hover:bg-[#C9A667]/10"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@cafeonwheels.com', 'admin123')}
              className="text-[11px] px-3 py-1 bg-[#6E1F2B]/40 border border-[#ffb2b7]/40 rounded-full text-[#ffb2b7] hover:bg-[#6E1F2B]/70"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="text-center mt-5 text-xs text-[#e6e2db]/60">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('register')}
                className="text-[#C9A667] underline underline-offset-4 hover:text-[#E6D2AA]"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-[#C9A667] underline underline-offset-4 hover:text-[#E6D2AA]"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
