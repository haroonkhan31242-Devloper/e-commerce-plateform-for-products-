import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Coupon } from '../../types/index.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { Modal } from '../common/Overlay.tsx';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit?: Coupon | null;
}

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  couponToEdit,
}) => {
  const { coupons, addCoupon, updateCoupon, showToast, baseCurrency } = useStore();

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(50);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [maxUsage, setMaxUsage] = useState('');

  useEffect(() => {
    if (couponToEdit) {
      setCode(couponToEdit.code);
      setType(couponToEdit.type);
      setValue(couponToEdit.value);
      setMinOrderAmount(couponToEdit.minOrderAmount);
      setExpiryDate(couponToEdit.expiryDate);
      setDescription(couponToEdit.description);
      setIsActive(couponToEdit.isActive);
      setMaxUsage(couponToEdit.maxUsage?.toString() ?? '');
    } else {
      setCode('');
      setType('percentage');
      setValue(20);
      setMinOrderAmount(100);
      setExpiryDate('2027-12-31');
      setDescription('');
      setIsActive(true);
      setMaxUsage('');
    }
  }, [couponToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('error', 'Coupon code is required.');
      return;
    }
    const normalizedCode = code.trim().toUpperCase();
    if (coupons.some((c) => c.code === normalizedCode && c.id !== couponToEdit?.id)) {
      showToast('error', 'A coupon with this code already exists.');
      return;
    }
    if (value <= 0 || (type === 'percentage' && value > 100)) {
      showToast('error', type === 'percentage' ? 'Enter a percentage between 1 and 100.' : 'Enter a discount above zero.');
      return;
    }
    if (minOrderAmount < 0) {
      showToast('error', 'Minimum order cannot be negative.');
      return;
    }

    const payload = {
      code: normalizedCode,
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount),
      expiryDate,
      description: description.trim() || `${value}${type === 'percentage' ? '%' : ` ${baseCurrency}`} discount`,
      isActive,
      maxUsage: maxUsage ? Number(maxUsage) : undefined,
    };

    if (couponToEdit) {
      updateCoupon(couponToEdit.id, payload);
    } else {
      addCoupon(payload);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} label={couponToEdit ? 'Edit coupon' : 'Create coupon'} className="max-w-md max-h-[92dvh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif text-lg font-bold text-neutral-900">
              {couponToEdit ? 'Edit Promotional Coupon' : 'Create New Coupon'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 text-neutral-600 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label htmlFor="coupon-form-modal-field-1" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Coupon Code *
            </label>
            <input
              id="coupon-form-modal-field-1"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. STEROSEVIP25"
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono uppercase tracking-wider focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="coupon-form-modal-field-2" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Discount Type
              </label>
              <select
                id="coupon-form-modal-field-2"
                value={type}
                onChange={(e) => setType(e.target.value as Coupon['type'])}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ({baseCurrency})</option>
              </select>
            </div>

            <div>
              <label htmlFor="coupon-form-modal-field-3" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Discount Amount {type === 'percentage' ? '(%)' : `(${baseCurrency})`}
              </label>
              <input
                id="coupon-form-modal-field-3"
                type="number"
                required
                min="1"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="coupon-form-modal-field-4" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Min. Order Amount ({baseCurrency})
              </label>
              <input
                id="coupon-form-modal-field-4"
                type="number"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
              />
            </div>

            <div>
              <label htmlFor="coupon-form-modal-field-5" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Expiry Date
              </label>
              <input
                id="coupon-form-modal-field-5"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label htmlFor="coupon-form-modal-field-6" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Public Description
            </label>
            <input
              id="coupon-form-modal-field-6"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20% off your order"
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 font-medium text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900"
              />
              <span>Active and redeemable by customers</span>
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800"
            >
              {couponToEdit ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
    </Modal>
  );
};
