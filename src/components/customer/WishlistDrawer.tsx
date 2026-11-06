import React from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { sizedImage } from '../../utils/images.ts';
import { Drawer } from '../common/Overlay.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { getEffectivePrice, isOnSale } from '../../utils/product.ts';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistDrawerOpen,
    setIsWishlistDrawerOpen,
    wishlist,
    toggleWishlist,
    products,
    formatPrice,
    addToCart,
    openQuickView,
    navigateToProduct,
    browseAllProducts,
  } = useStore();

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const closeDrawerAnd = (action: () => void) => () => {
    setIsWishlistDrawerOpen(false);
    action();
  };

  return (
    <Drawer isOpen={isWishlistDrawerOpen} onClose={() => setIsWishlistDrawerOpen(false)} label="Wishlist">
      {/* Header */}
      <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-600 fill-rose-600" aria-hidden="true" />
          <h2 className="font-serif text-lg font-bold text-neutral-900">Your Wishlist</h2>
          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-full">
            {wishlistProducts.length}
          </span>
        </div>

        <button
          onClick={() => setIsWishlistDrawerOpen(false)}
          aria-label="Close wishlist"
          className="p-2 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Wishlist Items List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {wishlistProducts.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-7 h-7" aria-hidden="true" />}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here for later."
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
            {wishlistProducts.map((product) => {
              const isSoldOut = product.stock <= 0;
              return (
                <m.div
                  key={product.id}
                  exit={{ opacity: 0, x: 24, transition: { duration: 0.14 } }}
                  className="flex gap-3 p-3 border border-neutral-200 rounded-2xl"
                >
                  <button
                    onClick={closeDrawerAnd(() => navigateToProduct(product.id))}
                    aria-label={`View ${product.name}`}
                    className="w-20 h-24 rounded-xl bg-neutral-100 overflow-hidden shrink-0"
                  >
                    <img
                      src={sizedImage(product.thumbnail || product.images[0], 200)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center"
                    />
                  </button>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs uppercase font-bold tracking-wide text-amber-800">
                          {product.categoryName}
                        </span>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={`Remove ${product.name} from wishlist`}
                          className="text-neutral-500 hover:text-rose-700 p-1.5 -mt-1 -mr-1"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        onClick={closeDrawerAnd(() => navigateToProduct(product.id))}
                        className="font-serif text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 text-left hover:text-amber-800"
                      >
                        {product.name}
                      </button>

                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="text-sm font-bold text-neutral-900">
                          {formatPrice(getEffectivePrice(product))}
                        </span>
                        {isOnSale(product) && (
                          <span className="text-xs text-neutral-500 line-through">
                            {formatPrice(product.regularPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={isSoldOut}
                      onClick={() => {
                        if (product.variations.length > 0) {
                          setIsWishlistDrawerOpen(false);
                          openQuickView(product);
                        } else {
                          addToCart(product, 1, [], { openDrawer: false });
                        }
                      }}
                      className="mt-2 w-full py-2 px-3 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:bg-neutral-200 disabled:text-neutral-500 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {isSoldOut ? 'Sold Out' : product.variations.length > 0 ? 'Select Options' : 'Add to Bag'}
                      </span>
                    </button>
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {wishlistProducts.length > 0 && (
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={() => setIsWishlistDrawerOpen(false)}
            className="w-full py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </Drawer>
  );
};
