import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ShieldCheck, UserCog } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';

type LoginRole = 'admin' | 'staff';

const inputClasses =
  'w-full min-h-11 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/30 transition-colors';
const labelClasses = 'block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1';

export const AdminLoginScreen: React.FC = () => {
  const { setCurrentView, showToast } = useStore();
  const { adminLogin, staffLogin } = useAdminAuth();

  const [role, setRole] = useState<LoginRole>('admin');
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchRole = (next: LoginRole) => {
    if (next === role) return;
    setRole(next);
    setIdentifier('');
    setLoginPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (role === 'admin') await adminLogin(identifier, loginPassword);
      else await staffLogin(identifier, loginPassword);
    } catch (error) {
      console.error('Admin sign-in failed', error);
      showToast('error', 'Sign-in failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: { id: LoginRole; label: string; icon: React.ReactNode }[] = [
    { id: 'admin', label: 'Main Admin', icon: <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'staff', label: 'Staff', icon: <UserCog className="w-3.5 h-3.5" aria-hidden="true" /> },
  ];

  return (
    <div className="min-h-dvh bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <BrandLogo className="h-18" />
          <h1 className="font-serif text-2xl font-bold tracking-wider text-white">STEROSE ADMIN</h1>
          <p className="text-xs text-neutral-400">Store management portal</p>
        </div>

        <div role="radiogroup" aria-label="Sign in as" className="grid grid-cols-2 gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
          {roles.map((option) => {
            const isActive = role === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => switchRole(option.id)}
                className={`min-h-10 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-login-identifier" className={labelClasses}>
              {role === 'admin' ? 'Admin Email Address' : 'Staff Username'}
            </label>
            <input
              id="admin-login-identifier"
              key={role}
              type={role === 'admin' ? 'email' : 'text'}
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={`${inputClasses} font-mono`}
            />
          </div>

          <div>
            <label htmlFor="admin-login-password" className={labelClasses}>
              Password
            </label>
            <div className="relative">
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`${inputClasses} pr-12 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-neutral-400 hover:text-amber-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl disabled:opacity-70 flex items-center justify-center gap-2 transition"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{isSubmitting ? 'Signing In...' : role === 'admin' ? 'Sign In' : 'Sign In as Staff'}</span>
          </button>
        </form>

        {role === 'admin' ? (
          // Demo credentials, to be removed with the real authentication phase
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-xs text-neutral-400 space-y-1">
            <p className="font-bold text-neutral-300">Demo access</p>
            <p>Email: <code className="text-amber-400">admin@sterose.store</code></p>
            <p>Password: <code className="text-amber-400">admin123</code></p>
          </div>
        ) : (
          <p className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-xs text-neutral-400">
            Staff accounts are created by the store’s Main Admin. Ask them for your username and password.
          </p>
        )}

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
