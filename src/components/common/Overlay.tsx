import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Overlays can stack (a confirmation opens above another modal); only the top one reacts to keys
const overlayStack: symbol[] = [];

const useOverlayBehavior = (
  isOpen: boolean,
  onClose: () => void,
  panelRef: React.RefObject<HTMLDivElement | null>
) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const id = Symbol('overlay');
    const previouslyFocused = document.activeElement as HTMLElement | null;
    overlayStack.push(id);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (overlayStack[overlayStack.length - 1] !== id) return;

      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      overlayStack.splice(overlayStack.indexOf(id), 1);
      if (overlayStack.length === 0) document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [isOpen, panelRef]);
};

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<OverlayProps> = ({ isOpen, onClose, label, className = '', children }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior(isOpen, onClose, panelRef);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 flex items-end sm:items-center justify-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`relative bg-white w-full rounded-t-3xl sm:rounded-3xl shadow-xl border border-neutral-200 overflow-hidden focus:outline-none ${className}`}
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.14 } }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const Drawer: React.FC<OverlayProps> = ({ isOpen, onClose, label, className = '', children }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior(isOpen, onClose, panelRef);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/60 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`relative w-full max-w-md bg-white h-dvh shadow-xl flex flex-col justify-between focus:outline-none ${className}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
