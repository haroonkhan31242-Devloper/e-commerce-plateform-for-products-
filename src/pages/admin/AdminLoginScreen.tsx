import React, { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const AdminLoginScreen: React.FC = () => {
  const { adminLogin, setCurrentView, showToast } = useStore();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminLogin(loginEmail, loginPassword);
    } catch (error) {
      console.error('Admin sign-in failed', error);
      showToast('error', 'Sign-in failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-neutral-950 mx-auto flex items-center justify-center font-bold font-serif text-2xl shadow-lg">
            S
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wider text-white">
            STEROSE ADMIN
          </h1>
          <p className="text-xs text-neutral-400">
            Store management portal
          </p>
        </div>

        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-login-screen-field-1" className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Admin Email Address
            </label>
            <input
              id="admin-login-screen-field-1"
              type="email"
              required
              autoComplete="username"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-amber-400 hover:underline"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo credentials, to be removed with the real authentication phase */}
        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-xs text-neutral-400 space-y-1">
          <p className="font-bold text-neutral-300">Demo access</p>
          <p>Email: <code className="text-amber-400">admin@sterose.store</code></p>
          <p>Password: <code className="text-amber-400">admin123</code></p>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            ← Back to store
          </button>
        </div>
      </div>
    </div>
  );
};
