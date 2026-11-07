import React from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { sizedImage } from '../../utils/images.ts';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { QuantityStepper } from '../../components/common/QuantityStepper.tsx';
import { getAvailableStock } from '../../utils/product.ts';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartShipping,
    cartGrandTotal,
    formatPrice,
    storeSettings,
    setCurrentView,
    browseAllProducts,
    navigateToProduct,
  } = useStore();

  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <EmptyState
          icon={<ShoppingBag className="w-7 h-7" aria-hidden="true" />}
          title="Your bag is empty"
          description="Explore our silk garments, healthcare essentials, clean cosmetics, and fine jewelry."
          action={
            <button
              onClick={browseAllProducts}
              className="px-8 py-3.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 inline-flex items-center gap-2"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      <div className="border-b border-neutral-200 pb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Shopping Bag</h1>
          <p className="text-sm text-neutral-600 mt-1">Review your items, then continue to checkout.</p>
        </div>
        <button
          onClick={browseAllProducts}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 py-1"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-amber-800 shrink-0" aria-hidden="true" />
          <span className="text-sm text-amber-950 font-medium">
            {remainingForFreeShipping > 0
              ? `Add ${formatPrice(remainingForFreeShipping)} more for free shipping`
              : 'Your order qualifies for free shipping'}
          </span>
        </div>
        <div className="w-full sm:w-48 bg-amber-200/80 h-1.5 rounded-full overflow-hidden shrink-0">
          <div
            className="bg-amber-700 h-full w-full rounded-full origin-left transition-transform duration-500"
            style={{ transform: `scaleX(${progressToFreeShipping / 100})` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <m.div
                key={item.id}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.14 } }}
                className="p-4 sm:p-5 flex gap-4"
              >
                <button
                  onClick={() => navigateToProduct(item.productId)}
                  aria-label={`View ${item.product.name}`}
                  className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-neutral-100 overflow-hidden shrink-0"
                >
                  <img
                    src={sizedImage(item.product.thumbnail || item.product.images[0], 200)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      {item.product.categoryName}
                    </p>
                    <button
                      onClick={() => navigateToProduct(item.productId)}
                      className="font-serif text-base font-semibold text-neutral-900 text-left hover:text-amber-800"
                    >
                      {item.product.name}
                    </button>
                    {item.selectedVariations.length > 0 && (
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {item.selectedVariations.map((v) => `${v.variationName}: ${v.chosenLabel}`).join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-neutral-600 mt-0.5">{formatPrice(item.unitPrice)} each</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-x-3 gap-y-1">
                    <QuantityStepper
                      size="sm"
                      label={`Quantity of ${item.product.name}`}
                      value={item.quantity}
                      min={0}
                      max={getAvailableStock(item.product, item.selectedVariations)}
                      onChange={(qty) => updateCartQuantity(item.id, qty)}
                    />
                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                      <span className="text-sm font-bold text-neutral-900 min-w-16 text-right whitespace-nowrap">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.product.name}`}
                        className="p-2 text-neutral-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 space-y-5 lg:sticky lg:top-32">
          <h2 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Order Summary
          </h2>

          <dl className="space-y-2.5 text-sm text-neutral-600">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-neutral-900">{formatPrice(cartSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Estimated shipping</dt>
              <dd className="font-semibold text-neutral-900">
                {cartShipping === 0 ? 'Free' : formatPrice(cartShipping)}
              </dd>
            </div>
            <div className="flex justify-between text-lg font-bold text-neutral-900 pt-3 border-t border-neutral-200">
              <dt>Estimated total</dt>
              <dd>{formatPrice(cartGrandTotal)}</dd>
            </div>
          </dl>

          <button
            onClick={() => setCurrentView('checkout')}
            className="w-full py-4 bg-neutral-900 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 group"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>

          <p className="flex items-center justify-center gap-2 text-xs text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-neutral-500" aria-hidden="true" />
            <span>Every order is reviewed before dispatch</span>
          </p>
        </div>
      </div>
    </div>
  );
};
