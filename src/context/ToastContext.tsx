import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ToastState, ToastType } from '../types/index.ts';

interface ToastActions {
  showToast: (type: ToastType, text: string) => void;
  dismissToast: (id: number) => void;
}

const ToastActionsContext = createContext<ToastActions | undefined>(undefined);
const ToastStateContext = createContext<ToastState | null>(null);

// Toast state lives apart from the store so a notification only re-renders the toast itself
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  // One message shows at a time: a repeat extends it, anything else replaces it
  const showToast = useCallback((type: ToastType, text: string) => {
    const id = ++nextId.current;
    setToast((current) =>
      current?.type === type && current.text === text
        ? { ...current, repeat: current.repeat + 1 }
        : { id, type, text, repeat: 0 }
    );
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToast((current) => (current?.id === id ? null : current));
  }, []);
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
