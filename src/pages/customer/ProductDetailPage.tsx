import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ArrowRight,
  Lock,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { CartItemVariationChoice } from '../../types/index.ts';
import { ProductCard } from '../../components/customer/ProductCard.tsx';
import {
  getAvailableStock,
  getDefaultVariationChoices,
  getDiscountPercent,
  getUnitPrice,
  isOnSale,
} from '../../utils/product.ts';
import { Modal } from '../../components/common/Overlay.tsx';
import { QuantityStepper } from '../../components/common/QuantityStepper.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { VariationSelector } from '../../components/customer/VariationSelector.tsx';
import { StarRating } from '../../components/common/StarRating.tsx';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    orders,
    customerUser,
    storeSettings,
    browseAllProducts,
    navigateToCategory,
    categories,
    selectedProductId,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCurrentView,
    addProductReview,
    showToast,
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId && p.status === 'active');

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<CartItemVariationChoice[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Review Form state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedVariations(getDefaultVariationChoices(product));
      setQuantity(1);
      setActiveImageIndex(0);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <EmptyState
          icon={<Search className="w-7 h-7" aria-hidden="true" />}
          title="This product is unavailable"
          description="It may have been removed or is no longer on sale."
          action={
            <button
              onClick={browseAllProducts}
              className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800"
            >
              Browse All Products
            </button>
          }
        />
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const hasDiscount = isOnSale(product);
  const available = getAvailableStock(product, selectedVariations);
  const isOutOfStock = available <= 0;
  const isLowStock = available > 0 && available <= product.lowStockThreshold;
  const category = categories.find((c) => c.id === product.categoryId);
  const hasPurchased =
    !!customerUser &&
    orders.some(
      (o) =>
        o.customer.email.toLowerCase() === customerUser.email.toLowerCase() &&
        o.items.some((item) => item.productId === product.id)
    );

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariations);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (addToCart(product, quantity, selectedVariations, { openDrawer: false })) {
      setCurrentView('checkout');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      showToast('error', 'Please fill in your name and review comment.');
      return;
    }

    addProductReview(product.id, {
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      verifiedPurchase: hasPurchased,
    });

    setIsReviewModalOpen(false);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.status === 'active')
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 text-xs text-neutral-600 [&_button]:py-1">
        <button onClick={() => setCurrentView('home')} className="hover:text-neutral-900">
          Home
        </button>
        <span aria-hidden="true">/</span>
        <button onClick={browseAllProducts} className="hover:text-neutral-900">
          All Products
        </button>
        <span aria-hidden="true">/</span>
        {category ? (
          <button onClick={() => navigateToCategory(category.slug)} className="hover:text-neutral-900">
            {product.categoryName}
          </button>
        ) : (
          <span>{product.categoryName}</span>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-neutral-900 font-semibold">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4 lg:sticky lg:top-32">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white border border-neutral-200/80 shadow-xs relative group">
            <img
              key={activeImageIndex}
              src={product.images[activeImageIndex] || product.thumbnail}
              alt={product.name}
              fetchPriority="high"
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 animate-in fade-in"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md">
                On Sale
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Show image ${idx + 1} of ${product.images.length}`}
                  aria-current={activeImageIndex === idx}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-neutral-900'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
              <span className="font-semibold text-amber-900 uppercase tracking-wider">
                {product.subcategory}
              </span>
              <span className="font-mono text-xs">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Review Summary */}
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.rating} />
              <span className="text-xs font-bold text-neutral-800">{product.rating}</span>
              <span className="text-xs text-neutral-500 font-normal">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-4 py-3 border-y border-neutral-100">
            <span className="text-3xl sm:text-4xl font-bold text-neutral-900">
              {formatPrice(getUnitPrice(product, selectedVariations))}
            </span>
            {hasDiscount && (
              <span className="text-lg text-neutral-500 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 rounded-full">
                Save {getDiscountPercent(product)}%
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-700 leading-relaxed">
            {product.description}
          </p>

          {product.variations.length > 0 && (
            <VariationSelector product={product} selected={selectedVariations} onChange={setSelectedVariations} />
          )}

          {/* Stock Indicator */}
          <div className="text-xs">
            {isOutOfStock ? (
              <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold rounded-full">
                Currently out of stock
              </span>
            ) : isLowStock ? (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-full border border-amber-300">
                Only {available} left in stock
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>In stock and ready to ship</span>
              </span>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <QuantityStepper
                label="Quantity"
                value={Math.min(quantity, Math.max(available, 1))}
                max={available}
                onChange={(qty) => setQuantity(Math.max(1, qty))}
                disabled={isOutOfStock}
              />

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 min-w-0 h-11 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-500 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="truncate">{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isFavorited}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border shrink-0 ${
                  isFavorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-neutral-300 text-neutral-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-100 text-sm text-neutral-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Free shipping over {formatPrice(storeSettings.freeShippingThreshold)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
              <span>30-day easy exchanges</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Authenticity guaranteed</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Bank transfer, cash on delivery, or card</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-8 space-y-6">
        <h3 className="font-serif text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">
          Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b border-neutral-100"
            >
              <span className="font-bold text-neutral-700 uppercase tracking-wide">{key}</span>
              <span className="text-neutral-600 text-right font-medium max-w-xs">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              Customer Reviews
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={product.rating} />
              <span className="text-xs font-bold text-neutral-900">{product.rating} out of 5</span>
              <span className="text-xs text-neutral-500">({product.reviews.length} reviews)</span>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews.filter((r) => r.isApproved).length === 0 ? (
            <p className="text-xs text-neutral-500 italic">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : (
            product.reviews
              .filter((r) => r.isApproved)
              .map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xs font-bold text-neutral-900">
                        {rev.author}
                      </span>
                      {rev.verifiedPurchase && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 font-mono">{rev.date}</span>
                  </div>

                  <StarRating rating={rev.rating} sizeClassName="w-3.5 h-3.5" />

                  <p className="text-sm text-neutral-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-neutral-900">
              You May Also Like
            </h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        label={`Write a review for ${product.name}`}
        className="max-w-md p-6 space-y-4"
      >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="font-serif text-base font-bold text-neutral-900">
                Write a Review for {product.name}
              </h4>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                aria-label="Close review form"
                className="p-1.5 text-neutral-600 hover:text-neutral-900"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label htmlFor="product-detail-page-field-1" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  id="product-detail-page-field-1"
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <p className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Rating</p>
                <div role="radiogroup" aria-label="Rating" className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={newReviewRating === star}
                      aria-label={`${star} out of 5 stars`}
                      onClick={() => setNewReviewRating(star)}
                      className="p-1.5"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="product-detail-page-field-2" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Your Review & Comments
                </label>
                <textarea
                  id="product-detail-page-field-2"
                  rows={4}
                  required
                  placeholder="Share details on texture, fit, accuracy, craftsmanship, or efficacy..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full p-3 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 shadow-sm"
                >
                  Submit Review
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
};
