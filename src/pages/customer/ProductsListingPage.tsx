import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, X, Search, Filter, ArrowUpDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { ProductCard } from '../../components/customer/ProductCard.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { getEffectivePrice, isOnSale } from '../../utils/product.ts';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'discount';

export const ProductsListingPage: React.FC = () => {
  const {
    products,
    categories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    selectedSubcategory,
    setSelectedSubcategory,
    searchQuery,
    setSearchQuery,
    saleOnly: onSaleOnly,
    setSaleOnly: setOnSaleOnly,
    formatPrice,
  } = useStore();

  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const activeCategories = categories.filter((c) => c.isActive);
  const activeProducts = useMemo(() => products.filter((p) => p.status === 'active'), [products]);

  // The price slider spans the catalog, so no product is hidden by default
  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(0, ...activeProducts.map(getEffectivePrice)) / 10) * 10,
    [activeProducts]
  );
  const priceLimit = maxPrice ?? priceCeiling;

  // Current category object
  const currentCategory = activeCategories.find((c) => c.slug === selectedCategorySlug);

  // Available subcategories
  const availableSubcategories = currentCategory ? currentCategory.subcategories : [];

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((prod) => {
      // Category filter
      if (selectedCategorySlug && currentCategory) {
        if (prod.categoryId !== currentCategory.id) return false;
      }

      // Subcategory filter
      if (selectedSubcategory) {
        if (prod.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) return false;
      }

      // In stock filter
      if (inStockOnly && prod.stock <= 0) {
        return false;
      }

      // On sale filter
      if (onSaleOnly && !isOnSale(prod)) {
        return false;
      }

      // Price filter
      const effectivePrice = getEffectivePrice(prod);
      if (effectivePrice > priceLimit) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = prod.name.toLowerCase().includes(query);
        const matchCat = prod.categoryName.toLowerCase().includes(query);
        const matchSub = prod.subcategory.toLowerCase().includes(query);
        const matchDesc = prod.description.toLowerCase().includes(query);
        const matchTags = prod.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchCat && !matchSub && !matchDesc && !matchTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const priceA = getEffectivePrice(a);
      const priceB = getEffectivePrice(b);

      switch (sortOption) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'discount': {
          const discA = a.salePrice ? a.regularPrice - a.salePrice : 0;
          const discB = b.salePrice ? b.regularPrice - b.salePrice : 0;
          return discB - discA;
        }
        case 'featured':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [
    activeProducts,
    selectedCategorySlug,
    currentCategory,
    selectedSubcategory,
    inStockOnly,
    onSaleOnly,
    priceLimit,
    searchQuery,
    sortOption,
  ]);

  const resetAllFilters = () => {
    setSelectedCategorySlug(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMaxPrice(null);
    setSortOption('featured');
  };

  const hasActiveFilters =
    Boolean(selectedCategorySlug) ||
    Boolean(selectedSubcategory) ||
    Boolean(searchQuery) ||
    inStockOnly ||
    onSaleOnly ||
    priceLimit < priceCeiling;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="text-xs text-neutral-600 mb-1 flex flex-wrap items-center gap-1 [&_button]:py-1">
            <button
              onClick={() => {
                setSelectedCategorySlug(null);
                setSelectedSubcategory(null);
              }}
              className="hover:text-neutral-900"
            >
              All Products
            </button>
            {currentCategory && (
              <>
                <span>/</span>
                <span className="text-neutral-700 font-medium">{currentCategory.name}</span>
              </>
            )}
            {selectedSubcategory && (
              <>
                <span>/</span>
                <span className="text-amber-900 font-bold">{selectedSubcategory}</span>
              </>
            )}
          </nav>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            {currentCategory ? currentCategory.name : onSaleOnly ? 'Special Offers' : 'All Products'}
          </h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-xl">
            {currentCategory
              ? currentCategory.description
              : 'Healthcare, fashion, baby essentials, beauty, and jewelry, all in one place.'}
          </p>
        </div>

        {/* Search query tag & Reset button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}

          {/* Sort selector */}
          <label className="flex items-center gap-2 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
            <span className="sr-only">Sort products</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent focus:outline-none text-neutral-800 !text-xs"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
              <option value="discount">Biggest Discounts</option>
            </select>
          </label>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            aria-expanded={isMobileFiltersOpen}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Subcategory Pills (Horizontal bar for quick selection) */}
      {availableSubcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedSubcategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              !selectedSubcategory
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All {currentCategory?.name}
          </button>
          {availableSubcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? null : sub)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubcategory === sub
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Active Search Term Banner */}
      {searchQuery && (
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-700" />
            <span>
              Results for <strong className="font-bold">&quot;{searchQuery}&quot;</strong> ({filteredProducts.length})
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-amber-700 hover:text-amber-950 font-bold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear search</span>
          </button>
        </div>
      )}

      {/* Grid Layout with Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-[15rem_1fr] lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`space-y-6 ${
            isMobileFiltersOpen ? 'block' : 'hidden md:block'
          } p-5 bg-white rounded-2xl border border-neutral-200 h-fit md:sticky md:top-44 md:max-h-[calc(100dvh-12rem)] md:overflow-y-auto`}
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-700" />
              <span>Filter Products</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="py-1 text-xs text-neutral-500 hover:text-rose-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Department Categories */}
          <div>
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2.5">
              Categories
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategorySlug(null);
                  setSelectedSubcategory(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                  !selectedCategorySlug
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[11px] opacity-70">{activeProducts.length}</span>
              </button>

              {activeCategories.map((c) => {
                const count = activeProducts.filter((p) => p.categoryId === c.id).length;
                const isSelected = selectedCategorySlug === c.slug;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategorySlug(c.slug);
                      setSelectedSubcategory(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[11px] opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              <span>Max Price</span>
              <span className="text-amber-900 font-mono">{formatPrice(priceLimit)}</span>
            </div>
            <input
              type="range"
              aria-label="Maximum price"
              min="0"
              max={priceCeiling}
              step="10"
              value={priceLimit}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-neutral-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
              <span>{formatPrice(0)}</span>
              <span>{formatPrice(priceCeiling)}</span>
            </div>
          </div>

          {/* Checkbox Toggles */}
          <div className="pt-4 border-t border-neutral-100 space-y-3">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Availability & Deals
            </h4>

            <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>In stock only</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span>On sale</span>
            </label>
          </div>
        </aside>

        {/* Products Grid Area */}
        <div className="lg:col-span-3 min-w-0">
          <div className="flex items-center justify-between mb-4 text-xs text-neutral-500">
            <span aria-live="polite">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200">
              <EmptyState
                icon={<Search className="w-7 h-7" aria-hidden="true" />}
                title="No products match your filters"
                description="Try a wider price range, a different category, or a new search."
                action={
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800"
                  >
                    Clear Filters
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
