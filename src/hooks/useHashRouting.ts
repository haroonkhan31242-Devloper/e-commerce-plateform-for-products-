import { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { AdminTab, AppView } from '../types/index.ts';

const STATIC_ROUTES: Record<string, AppView> = {
  cart: 'cart',
  checkout: 'checkout',
  'order-confirmation': 'order-confirmation',
  track: 'order-tracking',
  account: 'account',
};

const ADMIN_TABS: AdminTab[] = [
  'overview',
  'orders',
  'products',
  'categories',
  'hero-slider',
  'inventory',
  'customers',
  'payments',
  'shipping',
  'reviews',
  'settings',
];

const VIEW_PATHS: Partial<Record<AppView, string>> = {
  cart: 'cart',
  checkout: 'checkout',
  'order-confirmation': 'order-confirmation',
  'order-tracking': 'track',
  account: 'account',
};

// Keeps the store's view state and the URL hash in step, so the browser's back and
// forward buttons, refreshes and shared links all work without a routing library.
export const useHashRouting = () => {
  const {
    currentView,
    adminTab,
    selectedProductId,
    selectedCategorySlug,
    selectedSubcategory,
    searchQuery,
    saleOnly,
    setCurrentView,
    setAdminTab,
    setSelectedProductId,
    setSelectedCategorySlug,
    setSelectedSubcategory,
    setSearchQuery,
    setSaleOnly,
    setScannedParcelId,
  } = useStore();

  const hasAppliedInitialRoute = useRef(false);

  const buildHash = () => {
    if (currentView === 'product-detail' && selectedProductId) return `#/product/${selectedProductId}`;
    if (currentView === 'admin') return `#/admin/${adminTab}`;
    if (currentView === 'products') {
      const parts = ['products', selectedCategorySlug, selectedSubcategory].filter(Boolean);
      const filters = [
        searchQuery && `q=${encodeURIComponent(searchQuery)}`,
        saleOnly && 'sale=1',
      ].filter(Boolean);
      const path = parts.map((part) => encodeURIComponent(part as string)).join('/');
      return `#/${path}${filters.length > 0 ? `?${filters.join('&')}` : ''}`;
    }
    const path = VIEW_PATHS[currentView];
    return path ? `#/${path}` : '#/';
  };

  const applyHash = () => {
    const [path, queryString] = window.location.hash.replace(/^#\/?/, '').split('?');
    const [section, first, second] = path.split('/').map(decodeURIComponent);

    if (section === 'product' && first) {
      setSelectedProductId(first);
      setCurrentView('product-detail');
    } else if (section === 'products') {
      setSelectedCategorySlug(first || null);
      setSelectedSubcategory(second || null);
      const filters = new URLSearchParams(queryString);
      setSearchQuery(filters.get('q') ?? '');
      setSaleOnly(filters.get('sale') === '1');
      setCurrentView('products');
    } else if (section === 'admin') {
      if (first && ADMIN_TABS.includes(first as AdminTab)) {
        setAdminTab(first as AdminTab);
      } else if (first) {
        setAdminTab('overview');
        window.history.replaceState(null, '', '#/admin/overview');
      }
      if (first === 'orders' && second) setScannedParcelId(second);
      setCurrentView('admin');
    } else {
      setCurrentView(STATIC_ROUTES[section] ?? 'home');
    }
  };

  useEffect(() => {
    applyHash();
    window.addEventListener('popstate', applyHash);
    return () => window.removeEventListener('popstate', applyHash);
    // The setters are recreated with the store but always write to the same state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasAppliedInitialRoute.current) {
      hasAppliedInitialRoute.current = true;
      return;
    }
    const hash = buildHash();
    if (hash !== (window.location.hash || '#/')) {
      window.history.pushState(null, '', hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, adminTab, selectedProductId, selectedCategorySlug, selectedSubcategory, searchQuery, saleOnly]);
};
