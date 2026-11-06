import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Overlay.tsx';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

// Returns a `confirm` function plus the dialog element to render alongside the caller's markup
export const useConfirmDialog = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const confirm = (next: ConfirmOptions) => {
    setOptions(next);
    setIsOpen(true);
  };

  const dialog = (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      label={options?.title ?? 'Confirm action'}
      className="max-w-sm"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2 rounded-full bg-rose-50 text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-bold text-neutral-900">{options?.title}</h2>
            <p className="text-sm text-neutral-600 mt-1">{options?.message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              options?.onConfirm();
              setIsOpen(false);
            }}
            className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl"
          >
            {options?.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );

  return { confirm, dialog };
};
