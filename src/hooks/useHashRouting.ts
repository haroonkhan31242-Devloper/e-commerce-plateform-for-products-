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
    setCurrentView,
    setAdminTab,
    setSelectedProductId,
    setSelectedCategorySlug,
    setSelectedSubcategory,
    setScannedParcelId,
  } = useStore();

  const hasAppliedInitialRoute = useRef(false);

  const buildHash = () => {
    if (currentView === 'product-detail' && selectedProductId) return `#/product/${selectedProductId}`;
    if (currentView === 'admin') return `#/admin/${adminTab}`;
    if (currentView === 'products') {
      const parts = ['products', selectedCategorySlug, selectedSubcategory].filter(Boolean);
      return `#/${parts.map((part) => encodeURIComponent(part as string)).join('/')}`;
    }
    const path = VIEW_PATHS[currentView];
    return path ? `#/${path}` : '#/';
  };

  const applyHash = () => {
    const [section, first, second] = window.location.hash
      .replace(/^#\/?/, '')
      .split('/')
      .map(decodeURIComponent);

    if (section === 'product' && first) {
      setSelectedProductId(first);
      setCurrentView('product-detail');
    } else if (section === 'products') {
      setSelectedCategorySlug(first || null);
      setSelectedSubcategory(second || null);
      setCurrentView('products');
    } else if (section === 'admin') {
      if (first) setAdminTab(first as AdminTab);
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
  }, [currentView, adminTab, selectedProductId, selectedCategorySlug, selectedSubcategory]);
};
