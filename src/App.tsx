import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { useHashRouting } from './hooks/useHashRouting.ts';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { Toast } from './components/common/Toast.tsx';
import { CartDrawer } from './components/customer/CartDrawer.tsx';
import { WishlistDrawer } from './components/customer/WishlistDrawer.tsx';
import { ProductQuickViewModal } from './components/customer/ProductQuickViewModal.tsx';

// Customer Pages
import { HomePage } from './pages/customer/HomePage.tsx';
import { ProductsListingPage } from './pages/customer/ProductsListingPage.tsx';
import { ProductDetailPage } from './pages/customer/ProductDetailPage.tsx';
import { CartPage } from './pages/customer/CartPage.tsx';

// Loaded on demand: shoppers reach these later in the journey, if at all
const CheckoutPage = lazy(() =>
  import('./pages/customer/CheckoutPage.tsx').then((module) => ({ default: module.CheckoutPage }))
);
const OrderConfirmationPage = lazy(() =>
  import('./pages/customer/OrderConfirmationPage.tsx').then((module) => ({ default: module.OrderConfirmationPage }))
);
const OrderTrackingPage = lazy(() =>
  import('./pages/customer/OrderTrackingPage.tsx').then((module) => ({ default: module.OrderTrackingPage }))
);
const CustomerAccountPage = lazy(() =>
  import('./pages/customer/CustomerAccountPage.tsx').then((module) => ({ default: module.CustomerAccountPage }))
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard.tsx').then((module) => ({ default: module.AdminDashboard }))
);

const loadMotionFeatures = () => import('./motionFeatures.ts').then((module) => module.default);

const AdminLoader: React.FC = () => (
  <div role="status" className="min-h-dvh flex items-center justify-center bg-neutral-950 text-amber-400">
    <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
    <span className="sr-only">Loading admin portal</span>
  </div>
);

const PageLoader: React.FC = () => (
  <div role="status" className="min-h-[50dvh] flex items-center justify-center text-neutral-500">
    <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
    <span className="sr-only">Loading page</span>
  </div>
);

const AppContent: React.FC = () => {
  const { currentView, selectedProductId } = useStore();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  useHashRouting();

  // Each view starts at the top, and screen readers land on the new content
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [currentView, selectedProductId]);

  if (currentView === 'admin') {
    return (
      <>
        <Suspense fallback={<AdminLoader />}>
          <AdminDashboard />
        </Suspense>
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col justify-between bg-neutral-50 selection:bg-amber-100 selection:text-amber-900">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 focus:outline-none">
        <div
          key={currentView === 'product-detail' ? `product-${selectedProductId}` : currentView}
          className="animate-in fade-in slide-in-from-bottom-2"
        >
          {currentView === 'home' && <HomePage />}
          {currentView === 'products' && <ProductsListingPage />}
          {currentView === 'product-detail' && <ProductDetailPage />}
          {currentView === 'cart' && <CartPage />}
          <Suspense fallback={<PageLoader />}>
            {currentView === 'checkout' && <CheckoutPage />}
            {currentView === 'order-confirmation' && <OrderConfirmationPage />}
            {currentView === 'order-tracking' && <OrderTrackingPage />}
            {currentView === 'account' && <CustomerAccountPage />}
          </Suspense>
        </div>
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <WishlistDrawer />
      <ProductQuickViewModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </ToastProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
