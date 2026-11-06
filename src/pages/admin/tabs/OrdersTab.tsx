import React from 'react';
import { AdminPanel, AdminSearchInput } from '../../../components/admin/AdminPanel.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { StatusBadge } from '../../../components/common/StatusBadge.tsx';
import { OrderRowActions } from '../../../components/admin/OrderRowActions.tsx';
import { Order } from '../../../types/index.ts';
import { PAYMENT_METHOD_LABELS } from '../../../utils/orders.ts';

const ORDER_STATUS_FILTERS = ['All', 'Pending Confirmation', 'Accepted', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Rejected', 'Cancelled'];

interface OrdersTabProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onInspectOrder: (order: Order) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onInspectOrder,
}) => {
  const { orders, formatPrice } = useStore();

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== 'All' && ord.orderStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = ord.orderNumber.toLowerCase().includes(q);
      const matchCust = ord.customer.name.toLowerCase().includes(q) || ord.customer.email.toLowerCase().includes(q);
      const matchRef = ord.bankTransferReference?.toLowerCase().includes(q);
      return matchNum || matchCust || matchRef;
    }
    return true;
  });

  return (
    <AdminPanel
      title="Orders"
      description="Accept or reject orders, confirm payments, and manage delivery."
      actions={
        <AdminSearchInput
          className="w-full sm:w-72"
          placeholder="Search order, customer, or reference..."
          value={searchQuery}
          onChange={onSearchQueryChange}
        />
      }
    >
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        {ORDER_STATUS_FILTERS.map((st) => (
          <button
            key={st}
            onClick={() => onStatusFilterChange(st)}
            className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Full Orders Table */}
      <div className="overflow-x-auto">
        <table className="data-table w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
              <th className="py-2.5">Order</th>
              <th className="py-2.5">Customer</th>
              <th className="py-2.5">Amount</th>
              <th className="py-2.5">Payment</th>
              <th className="py-2.5">Status</th>
              <th className="py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-500">
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="align-top hover:bg-neutral-50/70 transition-colors">
                  <td data-label="" className="py-3.5">
                    <div>
                      <p className="flex items-center min-h-6 font-mono font-bold text-neutral-900 whitespace-nowrap">{ord.orderNumber}</p>
                      <p className="text-[11px] text-neutral-500">{new Date(ord.date).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td data-label="Customer" className="py-3.5">
                    <div>
                      <p className="flex items-center min-h-6 font-semibold text-neutral-900">{ord.customer.name}</p>
                      <p className="text-[11px] text-neutral-500">{ord.customer.phone}</p>
                    </div>
                  </td>
                  <td data-label="Amount" className="py-3.5">
                    <div>
                      <p className="flex items-center min-h-6 justify-end md:justify-start font-bold text-neutral-900 whitespace-nowrap">
                        {formatPrice(ord.grandTotal)}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </td>
                  <td data-label="Payment" className="py-3.5">
                    <div>
                      <div className="flex items-center min-h-6 justify-end md:justify-start">
                        <StatusBadge status={ord.paymentStatus} size="sm" />
                      </div>
                      <p className="text-[11px] text-neutral-500">{PAYMENT_METHOD_LABELS[ord.paymentMethod]}</p>
                    </div>
                  </td>
                  <td data-label="Status" className="py-3.5">
                    <div className="flex items-center min-h-6">
                      <StatusBadge status={ord.orderStatus} size="sm" />
                    </div>
                  </td>
                  <td data-label="" className="py-3.5 text-right">
                    <div className="md:-mt-1.5">
                      <OrderRowActions order={ord} onInspectOrder={onInspectOrder} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminPanel>
  );
};
