import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';

export const BankTransferDetails: React.FC = () => {
  const { storeSettings } = useStore();
  const { bankName, accountTitle, accountNumber, iban, swiftCode, instructions } = storeSettings.bankDetails;

  const rows = [
    ['Bank', bankName],
    ['Account Title', accountTitle],
    ['Account Number', accountNumber],
    ['IBAN', iban],
    ['SWIFT', swiftCode],
  ].filter(([, value]) => value.trim());

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg break-words">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span className="text-neutral-500 block font-sans">{label}:</span>
            <span className="font-bold text-neutral-900">{value}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500 leading-relaxed">{instructions}</p>
    </>
  );
};
