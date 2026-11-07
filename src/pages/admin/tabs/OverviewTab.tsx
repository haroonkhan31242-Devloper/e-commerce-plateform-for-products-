import React from 'react';
import { AlertTriangle, ArrowUpRight, Clock, ShoppingBag, TrendingUp } from 'lucide-react';
import { useStore } from '../../../context/StoreContext.tsx';
import { StatusBadge } from '../../../components/common/StatusBadge.tsx';
import { OrderRowActions } from '../../../components/admin/OrderRowActions.tsx';
import { Order } from '../../../types/index.ts';
import { getDailyRevenue, isRevenueOrder, PAYMENT_METHOD_LABELS } from '../../../utils/orders.ts';

// Full rupee amounts are too wide for the daily bars on a phone
const compactAmount = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 });

interface OverviewTabProps {
  onInspectOrder: (order: Order) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onInspectOrder }) => {
  const { orders, products, categories, setAdminTab, formatPrice } = useStore();

  const totalRevenue = orders.filter(isRevenueOrder).reduce((sum, ord) => sum + ord.grandTotal, 0);
  const dailyRevenue = getDailyRevenue(orders);
  const peakDailyRevenue = Math.max(...dailyRevenue.map((day) => day.amount), 1);
  const lastSevenDaysRevenue = dailyRevenue.reduce((sum, day) => sum + day.amount, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending Confirmation').length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-neutral-900">
            {formatPrice(totalRevenue)}
          </h3>
          <p className="text-xs text-emerald-700 font-medium">Excludes rejected and cancelled</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-neutral-600" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-neutral-900">
            {totalOrdersCount}
          </h3>
          <p className="text-xs text-neutral-500">Across all categories</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-amber-900">
            {pendingOrdersCount}
          </h3>
          <p className="text-xs text-amber-700 font-semibold">Requires manual review</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">Inventory Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-rose-800">
            {lowStockCount}
          </h3>
          <p className="text-xs text-rose-600 font-medium">Items low or out of stock</p>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-serif text-sm font-bold text-neutral-900">
              Revenue, Last 7 Days (PKR)
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {formatPrice(lastSevenDaysRevenue)}
            </span>
          </div>

          <div role="img" aria-label={`Daily revenue. ${dailyRevenue.map((d) => `${d.label}: ${formatPrice(d.amount)}`).join(', ')}`} className="flex justify-between gap-2 sm:gap-4 px-1">
                {dailyRevenue.map((bar) => (
                  <div key={bar.label} className="flex-1 min-w-0 flex flex-col items-center gap-2 group">
                    <span className="text-xs font-bold text-neutral-600 whitespace-nowrap">
                      {bar.amount > 0 ? compactAmount.format(bar.amount) : '-'}
                    </span>
                    <div className="h-36 w-full flex items-end">
                      <div
                        className="w-full bg-neutral-900 group-hover:bg-amber-500 rounded-t-lg transition-colors duration-200"
                        style={{ height: `${Math.max((bar.amount / peakDailyRevenue) * 100, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-neutral-600">{bar.label}</span>
                  </div>
                ))}
              </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Products by Category
          </h3>
          <div className="space-y-3 text-xs">
            {categories.slice(0, 5).map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              const pct = Math.round((count / (products.length || 1)) * 100);
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-neutral-700 font-medium">
                    <span>{cat.name}</span>
                    <span>{count} items ({pct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Action Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-neutral-900">
              Recent Orders
            </h3>
            <p className="text-xs text-neutral-500">
              Open an order to verify payment or update its status.
            </p>
          </div>
          <button
            onClick={() => setAdminTab('orders')}
            className="py-1.5 text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5">Order</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Total</th>
                <th className="py-2.5">Payment</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="align-top hover:bg-neutral-50/70 transition-colors">
                  <td data-label="" className="py-3">
                    <div>
                      <p className="flex items-center min-h-6 font-mono font-bold text-neutral-900 whitespace-nowrap">{ord.orderNumber}</p>
                      <p className="text-[11px] text-neutral-500">{new Date(ord.date).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td data-label="Customer" className="py-3">
                    <div>
                      <p className="flex items-center min-h-6 font-semibold text-neutral-800">{ord.customer.name}</p>
                      <p className="text-[11px] text-neutral-500">{ord.customer.phone}</p>
                    </div>
                  </td>
                  <td data-label="Total" className="py-3">
                    <div>
                      <p className="flex items-center min-h-6 justify-end md:justify-start font-bold text-neutral-900 whitespace-nowrap">
                        {formatPrice(ord.grandTotal)}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </td>
                  <td data-label="Payment" className="py-3">
                    <div>
                      <div className="flex items-center min-h-6 justify-end md:justify-start">
                        <StatusBadge status={ord.paymentStatus} size="sm" />
                      </div>
                      <p className="text-[11px] text-neutral-500">{PAYMENT_METHOD_LABELS[ord.paymentMethod]}</p>
                    </div>
                  </td>
                  <td data-label="Status" className="py-3">
                    <div className="flex items-center min-h-6">
                      <StatusBadge status={ord.orderStatus} size="sm" />
                    </div>
                  </td>
                  <td data-label="" className="py-3 text-right">
                    <div className="md:-mt-1.5">
                      <OrderRowActions order={ord} onInspectOrder={onInspectOrder} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
