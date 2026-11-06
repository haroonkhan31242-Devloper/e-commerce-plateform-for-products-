import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ToastState, ToastType } from '../types/index.ts';

const TOAST_DURATION_MS = 4000;

interface ToastActions {
  showToast: (type: ToastType, text: string) => void;
  dismissToast: () => void;
}

const ToastActionsContext = createContext<ToastActions | undefined>(undefined);
const ToastStateContext = createContext<ToastState | null>(null);

// Toast state lives apart from the store so a notification only re-renders the toast itself
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((type: ToastType, text: string) => {
    const id = ++nextId.current;
    setToast({ id, type, text });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, TOAST_DURATION_MS);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);
  const actions = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastActionsContext.Provider value={actions}>
      <ToastStateContext.Provider value={toast}>{children}</ToastStateContext.Provider>
    </ToastActionsContext.Provider>
  );
};

export const useToastActions = () => {
  const context = useContext(ToastActionsContext);
  if (!context) {
    throw new Error('useToastActions must be used within a ToastProvider');
  }
  return context;
};

export const useToastState = () => useContext(ToastStateContext);
