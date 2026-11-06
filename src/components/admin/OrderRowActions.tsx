import React from 'react';
import { Check, Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Order } from '../../types/index.ts';

interface OrderRowActionsProps {
  order: Order;
  onInspectOrder: (order: Order) => void;
}

export const OrderRowActions: React.FC<OrderRowActionsProps> = ({ order, onInspectOrder }) => {
  const { acceptOrder } = useStore();

  return (
    <div className="inline-flex items-center gap-1">
      {order.orderStatus === 'Pending Confirmation' && (
        <button
          onClick={() => acceptOrder(order.id)}
          className="inline-flex items-center gap-1 px-2.5 py-2 bg-neutral-900 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
        >
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Accept</span>
        </button>
      )}
      <button
        onClick={() => onInspectOrder(order)}
        aria-label={`Open order ${order.orderNumber}`}
        title="Open order"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};
