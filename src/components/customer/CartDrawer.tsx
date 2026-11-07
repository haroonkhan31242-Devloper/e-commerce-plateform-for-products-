import React from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { sizedImage } from '../../utils/images.ts';
import { Drawer } from '../common/Overlay.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { QuantityStepper } from '../common/QuantityStepper.tsx';
import { getAvailableStock } from '../../utils/product.ts';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    cartItemCount,
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

  const closeDrawerAnd = (action: () => void) => () => {
    setIsCartDrawerOpen(false);
    action();
  };

  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <Drawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} label="Shopping bag">
      {/* Header */}
      <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-neutral-900" aria-hidden="true" />
          <h2 className="font-serif text-lg font-bold text-neutral-900">Shopping Bag</h2>
          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-full">
            {cartItemCount}
          </span>
        </div>

        <button
          onClick={() => setIsCartDrawerOpen(false)}
          aria-label="Close shopping bag"
          className="p-2 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {cart.length > 0 && (
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
          <p className="text-xs text-amber-950 font-medium mb-1.5">
            {remainingForFreeShipping > 0
              ? `Add ${formatPrice(remainingForFreeShipping)} more for free shipping`
              : 'Your order qualifies for free shipping'}
          </p>
          <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full w-full rounded-full origin-left transition-transform duration-500"
              style={{ transform: `scaleX(${progressToFreeShipping / 100})` }}
            />
          </div>
        </div>
      )}

      {/* Cart Item List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {cart.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-7 h-7" aria-hidden="true" />}
            title="Your bag is empty"
            description="Explore our collections across fashion, healthcare, beauty, and fine jewelry."
            action={
              <button
                onClick={closeDrawerAnd(browseAllProducts)}
                className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800"
              >
                Browse Collections
              </button>
            }
          />
        ) : (
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.14 } }}
                transition={{ duration: 0.22 }}
                className="flex gap-3 p-3 border border-neutral-200 rounded-2xl"
              >
                <button
                  onClick={closeDrawerAnd(() => navigateToProduct(item.productId))}
                  aria-label={`View ${item.product.name}`}
                  className="w-20 h-24 rounded-xl bg-neutral-100 overflow-hidden shrink-0"
                >
                  <img
                    src={sizedImage(item.product.thumbnail || item.product.images[0], 200)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </button>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={closeDrawerAnd(() => navigateToProduct(item.productId))}
                        className="font-serif text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 text-left hover:text-amber-800"
                      >
                        {item.product.name}
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-neutral-500 hover:text-rose-700 p-1.5 -mt-1 -mr-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {item.selectedVariations.length > 0 && (
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {item.selectedVariations.map((v) => v.chosenLabel).join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <QuantityStepper
                      size="sm"
                      label={`Quantity of ${item.product.name}`}
                      value={item.quantity}
                      min={0}
                      max={getAvailableStock(item.product, item.selectedVariations)}
                      onChange={(qty) => updateCartQuantity(item.id, qty)}
                    />
                    <div className="text-right">
                      <span className="text-sm font-bold text-neutral-900">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-xs text-neutral-500">{formatPrice(item.unitPrice)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer & Checkout Area */}
      {cart.length > 0 && (
        <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <dl className="space-y-1.5 text-sm text-neutral-600">
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
            <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-200">
              <dt>Estimated total</dt>
              <dd>{formatPrice(cartGrandTotal)}</dd>
            </div>
          </dl>

          <button
            onClick={closeDrawerAnd(() => setCurrentView('checkout'))}
            className="w-full py-3.5 bg-neutral-900 text-white font-semibold text-xs tracking-wider uppercase rounded-xl hover:bg-amber-600 flex items-center justify-center gap-2 group"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>

          <button
            onClick={closeDrawerAnd(() => setCurrentView('cart'))}
            className="w-full text-center text-xs font-medium text-neutral-600 hover:text-neutral-900 py-1"
          >
            View Full Bag
          </button>
        </div>
      )}
    </Drawer>
  );
};
