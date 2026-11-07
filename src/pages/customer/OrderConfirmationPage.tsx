import React from 'react';
import { CheckCircle2, Truck, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { PAYMENT_METHOD_LABELS } from '../../utils/orders.ts';

export const OrderConfirmationPage: React.FC = () => {
  const { lastPlacedOrder: order, browseAllProducts, trackOrder, formatPrice } = useStore();

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-neutral-900">No recent order found</h2>
        <button
          onClick={browseAllProducts}
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-300">
      {/* Celebratory Banner */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-10 shadow-xs text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-900">
            Order Placed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            Thank You for Your Order
          </h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            We have received your order and sent it to our team for review.
          </p>
        </div>

        {/* Order Number & Status Pill */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl">
          <span className="text-xs text-neutral-600">
            Order Reference: <strong className="font-mono text-neutral-900">{order.orderNumber}</strong>
          </span>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <StatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Order Workflow Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
        <Clock className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">What happens next</p>
          <p className="leading-relaxed">
            Your order is <strong className="font-semibold">Pending Confirmation</strong>. Our team will check stock and payment, then confirm it. You can follow every step from the tracking page.
          </p>
        </div>
      </div>

      {/* Order Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchased Items */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center justify-between">
            <span>Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span className="text-xs font-mono font-normal text-neutral-500">
              {new Date(order.date).toLocaleDateString()}
            </span>
          </h3>

          <div className="space-y-3 divide-y divide-neutral-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-14 rounded-xl object-cover bg-neutral-100 shrink-0"
                  />
                  <div>
                    <p className="font-serif font-bold text-neutral-900">{item.productName}</p>
                    <p className="text-xs text-neutral-500">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                    {item.selectedVariations.length > 0 && (
                      <p className="text-[11px] text-amber-900 font-medium">
                        {item.selectedVariations.map((v) => `${v.variationName}: ${v.chosenLabel}`).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-neutral-900">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="font-semibold">-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-neutral-900">
                {order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Grand Total</span>
              <span className="text-amber-900">{formatPrice(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              Delivery Details
            </h3>

            <div className="text-xs space-y-2 text-neutral-600">
              <div>
                <span className="text-neutral-500 block text-[11px] uppercase font-bold">Recipient:</span>
                <p className="font-semibold text-neutral-900">{order.customer.name}</p>
                <p>{order.customer.email}</p>
                <p>{order.customer.phone}</p>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-neutral-500 block text-[11px] uppercase font-bold">
                  Shipping Address:
                </span>
                <p className="font-medium text-neutral-800">
                  {order.delivery.address}, {order.delivery.city}, {order.delivery.postalCode},{' '}
                  {order.delivery.country}
                </p>
                {order.delivery.deliveryInstructions && (
                  <p className="text-xs text-neutral-500 italic mt-1">
                    Note: &quot;{order.delivery.deliveryInstructions}&quot;
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-neutral-500 block text-[11px] uppercase font-bold">
                  Payment Method:
                </span>
                <p className="font-bold text-neutral-900 uppercase">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </p>
                {order.bankTransferReference && (
                  <p className="text-xs font-mono text-neutral-600">
                    Ref: {order.bankTransferReference}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => trackOrder(order.id)}
              className="w-full py-3.5 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Track This Order</span>
            </button>

            <button
              onClick={browseAllProducts}
              className="w-full py-3 bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-xl hover:bg-neutral-50 transition-colors text-center"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
