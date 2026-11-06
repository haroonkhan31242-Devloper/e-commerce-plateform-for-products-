import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types/index.ts';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | 'active' | 'draft' | 'archived';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let badgeColor = 'bg-neutral-100 text-neutral-800 border-neutral-300';

  switch (status) {
    case 'Pending Confirmation':
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'Accepted':
      badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
      break;
    case 'Processing':
      badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      break;
    case 'Shipped':
      badgeColor = 'bg-purple-50 text-purple-800 border-purple-200';
      break;
    case 'Out for Delivery':
      badgeColor = 'bg-sky-50 text-sky-800 border-sky-200';
      break;
    case 'Delivered':
    case 'Paid':
    case 'active':
      badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'Rejected':
    case 'Cancelled':
    case 'Failed':
      badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
    case 'Awaiting Verification':
      badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
      break;
    case 'Refunded':
    case 'draft':
      badgeColor = 'bg-neutral-100 text-neutral-600 border-neutral-300';
      break;
    default:
      badgeColor = 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${badgeColor} ${sizeClasses} capitalize tracking-wide select-none whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      <span>{status}</span>
    </span>
  );
};
