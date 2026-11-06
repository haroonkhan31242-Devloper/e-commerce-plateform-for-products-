import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { EmptyState } from '../../../components/common/EmptyState.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { getCustomerDirectory } from '../../../utils/orders.ts';

export const CustomersTab: React.FC = () => {
  const { orders, formatPrice } = useStore();
  const customers = useMemo(() => getCustomerDirectory(orders), [orders]);

  return (
    <AdminPanel
      title="Customers"
      description="Every customer who has placed an order, with contact details and lifetime spend."
    >
      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" aria-hidden="true" />}
          title="No customers yet"
          description="Customers appear here after their first order."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {customers.map((cust) => (
            <div key={cust.email} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-amber-400 font-bold flex items-center justify-center font-serif shrink-0">
                  {cust.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-neutral-900 truncate">{cust.name}</h3>
                  <p className="text-neutral-600 truncate">{cust.location}</p>
                </div>
              </div>

              <div className="space-y-1 text-neutral-600 pt-2 border-t border-neutral-200">
                <p className="break-words">{cust.email}</p>
                <p>{cust.phone}</p>
                <div className="flex justify-between pt-2 text-neutral-900 font-bold">
                  <span>Orders: {cust.ordersCount}</span>
                  <span>Lifetime: {formatPrice(cust.spent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
};
