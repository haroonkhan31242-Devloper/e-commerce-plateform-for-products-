import React, { useEffect, useRef, useState } from 'react';
import { X, ShoppingBag, ArrowRight, Heart, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { CartItemVariationChoice, Product } from '../../types/index.ts';
import {
  getAvailableStock,
  getDefaultVariationChoices,
  getUnitPrice,
  isOnSale,
} from '../../utils/product.ts';
import { Modal } from '../common/Overlay.tsx';
import { QuantityStepper } from '../common/QuantityStepper.tsx';
import { StarRating } from '../common/StarRating.tsx';
import { VariationSelector } from './VariationSelector.tsx';

export const ProductQuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    closeQuickView,
    formatPrice,
    addToCart,
    navigateToProduct,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  // Keeps the last product on screen while the closing animation plays
  const lastProduct = useRef<Product | null>(null);
  if (quickViewProduct) lastProduct.current = quickViewProduct;
  const product = lastProduct.current;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<CartItemVariationChoice[]>([]);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedVariations(getDefaultVariationChoices(quickViewProduct));
      setQuantity(1);
      setActiveImageIndex(0);
    }
  }, [quickViewProduct]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const hasDiscount = isOnSale(product);
  const available = getAvailableStock(product, selectedVariations);
  const isOutOfStock = available <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    closeQuickView();
    addToCart(product, quantity, selectedVariations);
  };

  return (
    <Modal
      isOpen={!!quickViewProduct}
      onClose={closeQuickView}
      label={product.name}
      className="max-w-3xl max-h-[92dvh] overflow-y-auto"
    >
      <button
        onClick={closeQuickView}
        aria-label="Close quick view"
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-neutral-100 text-neutral-700 shadow-sm"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Images Gallery */}
        <div className="p-4 sm:p-6 bg-neutral-50 border-b md:border-b-0 md:border-r border-neutral-200">
          <div className="aspect-4/5 md:aspect-square rounded-2xl overflow-hidden bg-white border border-neutral-200 mb-3">
            <img loading="lazy" decoding="async"
              key={activeImageIndex}
              src={product.images[activeImageIndex] || product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover object-center animate-in fade-in"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Show image ${idx + 1}`}
                  aria-current={activeImageIndex === idx}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                    activeImageIndex === idx ? 'border-neutral-900' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider pr-8">
              {product.categoryName}
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
              {product.name}
            </h2>

            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} emptyClassName="text-neutral-300" />
              <span className="text-xs font-semibold text-neutral-700">{product.rating}</span>
              <span className="text-xs text-neutral-500">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-neutral-900">
                {formatPrice(getUnitPrice(product, selectedVariations))}
              </span>
              {hasDiscount && (
                <span className="text-sm text-neutral-500 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              )}
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">{product.description}</p>

            <VariationSelector product={product} selected={selectedVariations} onChange={setSelectedVariations} />

            <div className="text-xs">
              {isOutOfStock ? (
                <span className="text-rose-700 font-bold">Currently out of stock</span>
              ) : available <= product.lowStockThreshold ? (
                <span className="text-amber-800 font-semibold">Only {available} left in stock</span>
              ) : (
                <span className="text-emerald-800 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>In stock and ready to ship</span>
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <div className="flex items-center gap-2">
              <QuantityStepper
                label="Quantity"
                value={quantity}
                max={available}
                onChange={(qty) => setQuantity(Math.max(1, qty))}
                disabled={isOutOfStock}
              />

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 min-w-0 h-11 bg-neutral-900 text-white text-xs font-semibold tracking-wider uppercase rounded-xl hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-500 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isFavorited}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border shrink-0 ${
                  isFavorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-neutral-300 text-neutral-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} aria-hidden="true" />
              </button>
            </div>

            <button
              onClick={() => {
                closeQuickView();
                navigateToProduct(product.id);
              }}
              className="w-full text-xs font-semibold text-amber-800 hover:underline flex items-center justify-center gap-1 py-1"
            >
              <span>View full details and reviews</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
