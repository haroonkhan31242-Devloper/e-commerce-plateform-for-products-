import React from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { getEffectivePrice, isOnSale, getDiscountPercent } from '../../utils/product.ts';
import { sizedImage } from '../../utils/images.ts';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    formatPrice,
    navigateToProduct,
    openQuickView,
    toggleWishlist,
    isInWishlist,
    addToCart,
  } = useStore();

  const isFavorited = isInWishlist(product.id);
  const hasDiscount = isOnSale(product);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const hoverImage = product.images.find((img) => img !== product.thumbnail);

  const handleQuickAdd = () => {
    if (isOutOfStock) return;
    // If the product has variations (like size/color/shade), open the quick view so customer chooses
    if (product.variations.length > 0) {
      openQuickView(product);
    } else {
      addToCart(product, 1);
    }
  };

  return (
    <article className="group relative bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 overflow-hidden hover:shadow-lg transition duration-300 flex flex-col">
      {/* Top Image Canvas */}
      <div className="relative aspect-4/5 w-full bg-neutral-100 overflow-hidden">
        <img
          src={sizedImage(product.thumbnail || product.images[0], 480)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        {hoverImage && (
          <img
            src={sizedImage(hoverImage, 480)}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2.5 py-0.5 bg-rose-700 text-white font-bold text-xs tracking-wide rounded-full">
              Save {getDiscountPercent(product)}%
            </span>
          )}
          {product.isBestSeller && !hasDiscount && (
            <span className="px-2.5 py-0.5 bg-amber-400 text-neutral-950 font-bold text-xs tracking-wide rounded-full">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2.5 py-0.5 bg-neutral-900 text-white font-semibold text-xs tracking-wide rounded-full">
              New
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-100 font-semibold text-xs rounded-full">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-full">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={isFavorited ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isFavorited}
          className={`absolute top-2 right-2 p-2.5 rounded-full z-20 shadow-sm ${
            isFavorited ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-neutral-700 hover:text-rose-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} aria-hidden="true" />
        </button>

        {/* Quick view rises in on hover or keyboard focus; touch users reach it through the bag button */}
        <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition duration-200 hidden [@media(hover:hover)]:block">
          <button
            onClick={() => openQuickView(product)}
            className="w-full py-2.5 bg-white/95 hover:bg-white text-neutral-900 text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-700" aria-hidden="true" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium tracking-wide uppercase text-amber-800 truncate">
              {product.subcategory || product.categoryName}
            </span>

            <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>{product.rating}</span>
              <span className="text-neutral-500 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-serif font-semibold text-neutral-900 text-base leading-snug line-clamp-2">
            {/* The stretched link makes the whole card clickable with one keyboard stop */}
            <button
              onClick={() => navigateToProduct(product.id)}
              className="text-left group-hover:text-amber-800 after:absolute after:inset-0 after:z-10"
            >
              {product.name}
            </button>
          </h3>

          <p className="hidden sm:block text-sm text-neutral-600 mt-1 line-clamp-1">{product.shortDescription}</p>
        </div>

        <div className="pt-3 border-t border-neutral-100 mt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-lg font-bold text-neutral-900">{formatPrice(getEffectivePrice(product))}</span>
            {hasDiscount && (
              <span className="text-xs text-neutral-500 line-through">{formatPrice(product.regularPrice)}</span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            aria-label={
              isOutOfStock
                ? `${product.name} is sold out`
                : product.variations.length > 0
                ? `Choose options for ${product.name}`
                : `Add ${product.name} to bag`
            }
            className="relative z-20 p-2.5 rounded-xl bg-neutral-900 text-white hover:bg-amber-600 disabled:bg-neutral-100 disabled:text-neutral-400 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
