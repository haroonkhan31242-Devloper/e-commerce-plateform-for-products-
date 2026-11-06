import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  label: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  max,
  min = 1,
  label,
  size = 'md',
  disabled = false,
}) => {
  const buttonSize = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white shrink-0"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value < min}
        aria-label="Decrease quantity"
        className={`${buttonSize} flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40`}
      >
        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      <span aria-live="polite" className="min-w-7 px-1 text-center text-sm font-bold text-neutral-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={`${buttonSize} flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40`}
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};
