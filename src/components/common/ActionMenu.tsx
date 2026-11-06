import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
}

interface ActionMenuProps {
  label: string;
  items: ActionMenuItem[];
}

const VIEWPORT_MARGIN = 8;

// Three-dot menu for secondary actions. It renders in a portal so that scrolling
// containers and table cells cannot clip it.
export const ActionMenu: React.FC<ActionMenuProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const fitsBelow = trigger.bottom + menu.height + VIEWPORT_MARGIN < window.innerHeight;

    setPosition({
      top: fitsBelow ? trigger.bottom + 4 : Math.max(VIEWPORT_MARGIN, trigger.top - menu.height - 4),
      left: Math.max(VIEWPORT_MARGIN, trigger.right - menu.width),
    });
    menuRef.current.querySelector('button')?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const dismiss = () => setIsOpen(false);
    const handlePointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        dismiss();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const buttons = [...(menuRef.current?.querySelectorAll('button') ?? [])];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 shrink-0"
      >
        <MoreVertical className="w-4 h-4" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            onKeyDown={handleKeyDown}
            style={position}
            className="fixed z-[70] min-w-44 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 animate-in fade-in"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  item.onSelect();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-medium ${
                  item.destructive ? 'text-rose-700 hover:bg-rose-50' : 'text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};
