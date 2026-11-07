import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

// The Clipboard API only exists on secure pages (https or localhost), so a phone opening the
// store over the local network falls back to the older copy command
const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  } catch {
    return false;
  }
};

export const BankTransferDetails: React.FC = () => {
  const { storeSettings, showToast } = useStore();
  const { bankName, accountTitle, accountNumber, iban, swiftCode, instructions } = storeSettings.bankDetails;
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const resetTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const rows: { label: string; value: string; copyable?: boolean }[] = [
    { label: 'Bank', value: bankName },
    { label: 'Account Title', value: accountTitle },
    { label: 'Account Number', value: accountNumber, copyable: true },
    { label: 'IBAN', value: iban, copyable: true },
    { label: 'SWIFT', value: swiftCode },
  ].filter(({ value }) => value.trim());

  const handleCopy = async (label: string, value: string) => {
    if (await copyText(value.trim())) {
      setCopiedLabel(label);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopiedLabel(null), 2000);
      showToast('success', `${label} copied.`);
    } else {
      showToast('error', `Could not copy the ${label.toLowerCase()}. Please copy it manually.`);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg break-words">
        {rows.map(({ label, value, copyable }) => (
          <div key={label}>
            <span className="text-neutral-500 block font-sans">{label}:</span>
            <span className="inline-flex items-center gap-1 max-w-full">
              <span className="font-bold text-neutral-900 min-w-0 break-all">{value}</span>
              {copyable && (
                <button
                  type="button"
                  onClick={() => handleCopy(label, value)}
                  aria-label={`Copy ${label}`}
                  title={`Copy ${label}`}
                  className="shrink-0 -my-1.5 p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200"
                >
                  {copiedLabel === label ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 leading-relaxed">{instructions}</p>
    </>
  );
};
