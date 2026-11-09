import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { GOOGLE_SIGN_IN_ENABLED, GoogleSignInUnavailableError, startGoogleSignIn } from '../../services/googleAuth.ts';

// The four-colour "G" mark, drawn to Google's published geometry
const GoogleMark: React.FC = () => (
  <svg viewBox="0 0 48 48" className="w-[18px] h-[18px] shrink-0" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

interface GoogleSignInButtonProps {
  label?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ label = 'Continue with Google' }) => {
  const { showToast } = useStore();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (!GOOGLE_SIGN_IN_ENABLED) {
      // Say so plainly rather than imitating a sign-in that does not happen
      showToast('info', new GoogleSignInUnavailableError().message);
      return;
    }
    setIsPending(true);
    try {
      await startGoogleSignIn();
      // When the provider is connected: start the customer session from the verified profile here
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="w-full min-h-11 px-4 py-2.5 flex items-center justify-center gap-3 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-800 shadow-xs hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm active:scale-[0.99] disabled:opacity-70 transition-[background-color,border-color,box-shadow,transform] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
    >
      {isPending ? <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" /> : <GoogleMark />}
      <span>{label}</span>
    </button>
  );
};
