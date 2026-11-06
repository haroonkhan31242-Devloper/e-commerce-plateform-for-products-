import React, { useEffect, useRef, useState } from 'react';
import { m } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import { CurrencySelector } from './CurrencySelector.tsx';

const CountBadge: React.FC<{ count: number; className: string }> = ({ count, className }) => (
  <m.span
    key={count}
    initial={{ scale: 0.6 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
    className={`rounded-full flex items-center justify-center font-bold ${className}`}
  >
    {count}
  </m.span>
);

export const Navbar: React.FC = () => {
  const {
    cartItemCount,
    wishlist,
    setIsCartDrawerOpen,
    setIsWishlistDrawerOpen,
    setCurrentView,
    searchQuery,
    browseAllProducts,
    browseOffers,
    searchProducts,
    formatPrice,
    customerUser,
    customerLogout,
    storeSettings,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!isUserDropdownOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setIsUserDropdownOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserDropdownOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserDropdownOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts(localSearch);
    setIsMobileMenuOpen(false);
  };

  const closeMenusAnd = (action: () => void) => () => {
    action();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const announcementText = storeSettings.announcementText.replace(
    '{freeShipping}',
    formatPrice(storeSettings.freeShippingThreshold)
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      {/* Utility Bar */}
      <div className="bg-neutral-900 text-neutral-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {storeSettings.isAnnouncementActive && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                <span className="font-medium tracking-wide truncate" title={announcementText}>
                  {announcementText}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <CurrencySelector />

            <button
              onClick={() => setCurrentView('admin')}
              className="hidden sm:flex items-center gap-1.5 py-1 font-semibold text-neutral-200 hover:text-white"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          <div className="flex items-center gap-1 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <button
              onClick={closeMenusAnd(() => setCurrentView('home'))}
              className="flex items-center gap-2 sm:gap-3 select-none group min-w-0"
              aria-label="STEROSE home"
            >
              <BrandLogo className="h-9 sm:h-11" />
              <span className="flex flex-col items-start min-w-0">
                <span className="font-serif text-lg min-[380px]:text-xl sm:text-3xl md:text-2xl lg:text-3xl font-bold tracking-wider sm:tracking-widest text-neutral-900 group-hover:text-amber-800 whitespace-nowrap">
                  STEROSE
                </span>
                <span className="text-[9px] min-[380px]:text-[10px] sm:text-xs leading-none tracking-wide sm:tracking-widest text-brand-gold uppercase font-semibold whitespace-nowrap">
                  Your World Store
                </span>
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-lg mx-4 relative"
          >
            <div className="relative w-full">
              <label htmlFor="desktop-search" className="sr-only">
                Search products
              </label>
              <input
                id="desktop-search"
                type="search"
                placeholder="Search dresses, jewelry, skincare..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-300 bg-neutral-50 text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-3 shrink-0">
            {/* Customer User Account */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1.5 p-2 text-neutral-700 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
                aria-label="Account menu"
                aria-expanded={isUserDropdownOpen}
              >
                <User className="w-5 h-5" aria-hidden="true" />
                <span className="hidden xl:inline-block text-xs font-medium">
                  {customerUser ? customerUser.name.split(' ')[0] : 'Sign In'}
                </span>
                <ChevronDown
                  className={`hidden sm:block w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                    isUserDropdownOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    {customerUser ? (
                      <>
                        <p className="text-xs text-neutral-600">Signed in as</p>
                        <p className="text-sm font-semibold text-neutral-900 truncate">{customerUser.name}</p>
                        <p className="text-xs text-neutral-600 truncate">{customerUser.email}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-neutral-600">Welcome to STEROSE</p>
                        <p className="text-sm font-medium text-neutral-900">Sign in to manage orders</p>
                      </>
                    )}
                  </div>

                  <button
                    onClick={closeMenusAnd(() => setCurrentView('account'))}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <span>{customerUser ? 'My Account & Orders' : 'Sign In'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                  </button>

                  <button
                    onClick={closeMenusAnd(() => setCurrentView('order-tracking'))}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <span>Track an Order</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                  </button>

                  {customerUser && (
                    <button
                      onClick={closeMenusAnd(customerLogout)}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 border-t border-neutral-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistDrawerOpen(true)}
              className="relative p-2 text-neutral-700 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
              aria-label={`Wishlist, ${wishlist.length} items`}
            >
              <Heart className="w-5 h-5" aria-hidden="true" />
              {wishlist.length > 0 && (
                <CountBadge
                  count={wishlist.length}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-amber-500 text-neutral-950 text-xs"
                />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-2 p-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-full sm:px-3.5 sm:py-2"
              aria-label={`Shopping bag, ${cartItemCount} items`}
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline-block text-xs font-medium">Bag</span>
              {cartItemCount > 0 && (
                <CountBadge
                  count={cartItemCount}
                  className="absolute -top-1 -right-1 sm:static w-5 h-5 bg-amber-400 text-neutral-950 text-xs"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-4 max-h-[75dvh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
          <form role="search" onSubmit={handleSearchSubmit} className="relative md:hidden">
            <label htmlFor="mobile-search" className="sr-only">
              Search products
            </label>
            <input
              id="mobile-search"
              type="search"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          </form>

          <nav aria-label="Shop" className="space-y-0.5">
            <button
              onClick={closeMenusAnd(browseAllProducts)}
              className="w-full text-left px-3 py-2.5 text-sm font-semibold text-neutral-900 rounded-lg hover:bg-neutral-100"
            >
              All Products
            </button>
            <button
              onClick={closeMenusAnd(browseOffers)}
              className="w-full text-left px-3 py-2.5 text-sm font-semibold text-rose-700 rounded-lg hover:bg-rose-50"
            >
              Special Offers
            </button>

          </nav>

          <div className="pt-3 border-t border-neutral-200 space-y-0.5">
            <button
              onClick={closeMenusAnd(() => setCurrentView('order-tracking'))}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              Track an Order
            </button>
            <button
              onClick={closeMenusAnd(() => setCurrentView('account'))}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              My Account
            </button>
            <button
              onClick={closeMenusAnd(() => setCurrentView('admin'))}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" aria-hidden="true" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
