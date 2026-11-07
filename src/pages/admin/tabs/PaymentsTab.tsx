import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { StatusBadge } from '../../../components/common/StatusBadge.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { Order } from '../../../types/index.ts';
import { isRevenueOrder, needsRefund, PAYMENT_METHOD_LABELS } from '../../../utils/orders.ts';

interface PaymentsTabProps {
  onInspectOrder: (order: Order) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ onInspectOrder }) => {
  const { orders, formatPrice } = useStore();

  return (
    <AdminPanel
      title="Payments"
      description="Review payment references and confirm received payments."
    >
      <div className="overflow-x-auto">
        <table className="data-table w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
              <th className="py-2.5">Order</th>
              <th className="py-2.5">Customer</th>
              <th className="py-2.5">Method</th>
              <th className="py-2.5">Reference</th>
              <th className="py-2.5">Amount</th>
              <th className="py-2.5">Status</th>
              <th className="py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-neutral-50/70 transition-colors">
                <td data-label="" className="py-3 font-mono font-bold text-neutral-900 whitespace-nowrap">{ord.orderNumber}</td>
                <td data-label="Customer" className="py-3">{ord.customer.name}</td>
                <td data-label="Method" className="py-3">{PAYMENT_METHOD_LABELS[ord.paymentMethod]}</td>
                <td data-label="Reference" className="py-3 font-mono text-neutral-800">
                  {ord.bankTransferReference || (
                    <span className="text-neutral-500 italic">N/A</span>
                  )}
                </td>
                <td data-label="Amount" className="py-3 font-bold text-neutral-900">
                  {formatPrice(ord.grandTotal)}
                </td>
                <td data-label="Status" className="py-3">
                  <StatusBadge status={ord.paymentStatus} size="sm" />
                </td>
                <td data-label="" className="py-3 text-right">
                  {needsRefund(ord) || (isRevenueOrder(ord) && ord.paymentStatus !== 'Paid' && ord.paymentStatus !== 'Refunded') ? (
                    <button
                      onClick={() => onInspectOrder(ord)}
                      className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold"
                    >
                      Review
                    </button>
                  ) : ord.paymentStatus === 'Paid' ? (
                    <span className="text-emerald-800 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="text-neutral-500">No action needed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPanel>
  );
};
