import React from 'react';
import { Edit2, Plus, Power, Trash2 } from 'lucide-react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { StatusBadge } from '../../../components/common/StatusBadge.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { useConfirmDialog } from '../../../components/common/ConfirmDialog.tsx';
import { ActionMenu } from '../../../components/common/ActionMenu.tsx';
import { Coupon } from '../../../types/index.ts';

interface CouponsTabProps {
  onEditCoupon: (coupon: Coupon | null) => void;
}

export const CouponsTab: React.FC<CouponsTabProps> = ({ onEditCoupon }) => {
  const { coupons, deleteCoupon, updateCoupon, formatPrice } = useStore();
  const { confirm, dialog } = useConfirmDialog();

  return (
    <AdminPanel
      title="Coupons"
      description="Manage percentage and fixed-amount coupon codes for seasonal campaigns."
      actions={
        <button
          onClick={() => onEditCoupon(null)}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 text-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-base break-all font-bold text-neutral-900 tracking-wider">
                  {c.code}
                </span>
                <StatusBadge status={c.isActive ? 'active' : 'draft'} size="sm" />
              </div>

              <p className="text-neutral-600 mt-2 font-medium">{c.description}</p>

              <div className="space-y-1 text-neutral-500 mt-3 pt-3 border-t border-neutral-200/60">
                <p>Discount: <strong className="text-neutral-900">{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</strong></p>
                <p>Min Order: <strong className="text-neutral-900">{formatPrice(c.minOrderAmount)}</strong></p>
                <p>Valid Through: <strong className="text-neutral-900 font-mono">{c.expiryDate}</strong></p>
                <p>Redeemed: <strong className="text-neutral-900">{c.usageCount}{c.maxUsage ? ` of ${c.maxUsage}` : ''} times</strong></p>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-end gap-1">
              <button
                onClick={() => onEditCoupon(c)}
                aria-label={`Edit coupon ${c.code}`}
                title="Edit coupon"
                className="inline-flex items-center justify-center w-9 h-9 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <ActionMenu
                label={`More actions for coupon ${c.code}`}
                items={[
                  {
                    label: c.isActive ? 'Deactivate coupon' : 'Activate coupon',
                    icon: <Power className="w-3.5 h-3.5" aria-hidden="true" />,
                    onSelect: () => updateCoupon(c.id, { isActive: !c.isActive }),
                  },
                  {
                    label: 'Delete coupon',
                    icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />,
                    destructive: true,
                    onSelect: () =>
                      confirm({
                        title: 'Delete this coupon?',
                        message: `Customers will no longer be able to use ${c.code}.`,
                        confirmLabel: 'Delete Coupon',
                        onConfirm: () => deleteCoupon(c.id),
                      }),
                  },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
      {dialog}
    </AdminPanel>
  );
};
