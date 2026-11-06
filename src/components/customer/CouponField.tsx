import React, { useId, useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const CouponField: React.FC = () => {
  const { appliedCoupon, applyCoupon, removeCoupon, cartDiscount, formatPrice } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Enter a coupon code to apply it.');
      return;
    }
    const result = applyCoupon(code);
    setError(result.success ? null : result.message);
    if (result.success) setCode('');
  };

  if (appliedCoupon) {
    const couponSummary =
      appliedCoupon.code === 'FREESHIP'
        ? 'Free shipping on this order'
        : `${appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : formatPrice(appliedCoupon.value)} off this order`;

    return (
      <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
        <div className="flex items-start gap-2 min-w-0">
          <Tag className="w-4 h-4 text-emerald-700 shrink-0 mt-px" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-bold text-emerald-900">{appliedCoupon.code} applied</p>
            <p className="text-emerald-800">
              {cartDiscount > 0 || appliedCoupon.code === 'FREESHIP'
                ? couponSummary
                : `Spend ${formatPrice(appliedCoupon.minOrderAmount)} or more to use this coupon.`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={removeCoupon}
          aria-label={`Remove coupon ${appliedCoupon.code}`}
          className="p-1.5 text-neutral-600 hover:text-rose-700 shrink-0"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          placeholder="e.g. STEROSE20"
          autoComplete="off"
          value={code}
          aria-invalid={!!error}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          className="flex-1 min-w-0 px-3 py-2.5 text-xs border border-neutral-300 rounded-xl uppercase tracking-wider focus:outline-none focus:border-neutral-900 bg-white"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 shrink-0"
        >
          Apply
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-700">
          {error}
        </p>
      )}
    </form>
  );
};
