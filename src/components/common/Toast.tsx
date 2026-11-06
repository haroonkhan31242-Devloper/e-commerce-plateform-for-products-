import React, { useEffect } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastActions, useToastState } from '../../context/ToastContext.tsx';
import { ToastState, ToastType } from '../../types/index.ts';

const VISIBLE_MS = 1500;
const ENTER_SECONDS = 0.5;
const EXIT_SECONDS = 0.3;
const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

const TOAST_TYPES: Record<ToastType, { label: string; tile: string; icon: React.ReactNode }> = {
  success: {
    label: 'Success',
    tile: 'bg-emerald-50 text-emerald-700',
    icon: <CheckCircle2 className="w-6 h-6" aria-hidden="true" />,
  },
  error: {
    label: 'Error',
    tile: 'bg-rose-50 text-rose-700',
    icon: <XCircle className="w-6 h-6" aria-hidden="true" />,
  },
  warning: {
    label: 'Warning',
    tile: 'bg-amber-100 text-amber-700',
    icon: <AlertTriangle className="w-6 h-6" aria-hidden="true" />,
  },
  info: {
    label: 'Information',
    tile: 'bg-neutral-100 text-neutral-700',
    icon: <Info className="w-6 h-6" aria-hidden="true" />,
  },
};

const ToastCard: React.FC<{ toast: ToastState }> = ({ toast }) => {
  const { dismissToast } = useToastActions();
  const { label, tile, icon } = TOAST_TYPES[toast.type];

  // A repeat of the same message restarts the countdown; unmounting always clears it
  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast.id, toast.repeat, dismissToast]);

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: EXIT_SECONDS, ease: 'easeIn' } }}
      transition={{ duration: ENTER_SECONDS, ease: ENTER_EASE }}
      className="pointer-events-auto relative w-full max-w-sm max-h-full overflow-y-auto flex flex-col items-center gap-3 p-6 text-center bg-white rounded-2xl border border-neutral-200 shadow-xl"
    >
      <span className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${tile}`}>{icon}</span>
      <p className="text-sm leading-relaxed font-medium text-neutral-900 break-words max-w-full">
        <span className="sr-only">{label}: </span>
        {toast.text}
      </p>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </m.div>
  );
};

// The only notification surface in the app. Everything except the card itself lets
// clicks through, so the page stays usable while a message is showing.
export const Toast: React.FC = () => {
  const toast = useToastState();
  const isUrgent = toast?.type === 'error' || toast?.type === 'warning';

  return (
    <>
      <AnimatePresence>
        {toast && (
          <m.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: EXIT_SECONDS } }}
            transition={{ duration: ENTER_SECONDS }}
            className="fixed inset-0 z-[80] bg-neutral-950/15 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div
        aria-live={isUrgent ? 'assertive' : 'polite'}
        aria-atomic="true"
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
      >
        <AnimatePresence mode="wait">{toast && <ToastCard key={toast.id} toast={toast} />}</AnimatePresence>
      </div>
    </>
  );
};
