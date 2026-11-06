import React from 'react';
import { AnimatePresence, m } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastActions, useToastState } from '../../context/ToastContext.tsx';

const TOAST_STYLES = {
  success: 'bg-emerald-950 text-emerald-100 border-emerald-800',
  error: 'bg-rose-950 text-rose-100 border-rose-800',
  info: 'bg-neutral-900 text-neutral-100 border-neutral-700',
};

const TOAST_ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />,
  error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />,
  info: <Info className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />,
};

export const Toast: React.FC = () => {
  const toast = useToastState();
  const { dismissToast } = useToastActions();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:right-6 z-[60] sm:w-96 pointer-events-none"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <m.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${
              TOAST_STYLES[toast.type]
            }`}
          >
            {TOAST_ICONS[toast.type]}
            <p className="flex-1 text-sm leading-snug font-medium">{toast.text}</p>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Dismiss notification"
              className="p-0.5 opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
