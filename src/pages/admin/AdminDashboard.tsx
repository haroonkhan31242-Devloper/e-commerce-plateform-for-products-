import React, { useEffect, useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { AdminSidebar } from '../../components/admin/AdminSidebar.tsx';
import { ProductFormModal } from '../../components/admin/ProductFormModal.tsx';
import { CategoryFormModal } from '../../components/admin/CategoryFormModal.tsx';
import { OrderDetailModal } from '../../components/admin/OrderDetailModal.tsx';
import { Product, Category, Order } from '../../types/index.ts';
import { AdminLoginScreen } from './AdminLoginScreen.tsx';
import { OverviewTab } from './tabs/OverviewTab.tsx';
import { OrdersTab } from './tabs/OrdersTab.tsx';
import { ProductsTab } from './tabs/ProductsTab.tsx';
import { CategoriesTab } from './tabs/CategoriesTab.tsx';
import { InventoryTab } from './tabs/InventoryTab.tsx';
import { CustomersTab } from './tabs/CustomersTab.tsx';
import { PaymentsTab } from './tabs/PaymentsTab.tsx';
import { ReviewsTab } from './tabs/ReviewsTab.tsx';
import { ShippingTab } from './tabs/ShippingTab.tsx';
import { SettingsTab } from './tabs/SettingsTab.tsx';

export const AdminDashboard: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    isAdminAuthenticated,
    orders,
    storeSettings,
    scannedParcelId,
    setScannedParcelId,
    showToast,
  } = useStore();

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [orderIdToInspect, setOrderIdToInspect] = useState<string | null>(null);


  // Tab state kept here so filters and unsaved forms survive switching tabs
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [settingsForm, setSettingsForm] = useState(storeSettings);

  // A scanned parcel QR code opens its order once the admin is signed in
  useEffect(() => {
    if (!isAdminAuthenticated || !scannedParcelId) return;
    const scannedOrder = orders.find((o) => o.parcelLabel?.parcelId === scannedParcelId);
    if (scannedOrder) setOrderIdToInspect(scannedOrder.id);
    else showToast('error', `No order was found for parcel ${scannedParcelId}.`);
    setScannedParcelId(null);
    // The setters are recreated with the store but always write to the same state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminAuthenticated, scannedParcelId]);

  if (!isAdminAuthenticated) {
    return <AdminLoginScreen />;
  }

  // Resolved from live state so the modal reflects updates made while it is open
  const orderToInspect = orders.find((o) => o.id === orderIdToInspect) ?? null;

  const openProductModal = (product: Product | null) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const openCategoryModal = (category: Category | null) => {
    setCategoryToEdit(category);
    setIsCategoryModalOpen(true);
  };

  const inspectOrder = (order: Order) => setOrderIdToInspect(order.id);

  return (
    <div className="min-h-dvh bg-neutral-100 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={adminTab}
        setActiveTab={setAdminTab}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden p-2 -ml-2 text-neutral-600 rounded-lg hover:bg-neutral-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandLogo className="h-9 lg:hidden" />
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 capitalize">
                {adminTab.replace('-', ' ')}
              </h1>
              <p className="text-xs text-neutral-500 hidden sm:block">
                STEROSE store management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Add Product Button */}
            <button
              onClick={() => openProductModal(null)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main key={adminTab} className="p-3 sm:p-8 space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-2">
          {adminTab === 'overview' && <OverviewTab onInspectOrder={inspectOrder} />}
          {adminTab === 'orders' && (
            <OrdersTab
              statusFilter={orderStatusFilter}
              onStatusFilterChange={setOrderStatusFilter}
              searchQuery={orderSearchQuery}
              onSearchQueryChange={setOrderSearchQuery}
              onInspectOrder={inspectOrder}
            />
          )}
          {adminTab === 'products' && (
            <ProductsTab
              searchQuery={productSearchQuery}
              onSearchQueryChange={setProductSearchQuery}
              onEditProduct={openProductModal}
            />
          )}
          {adminTab === 'categories' && <CategoriesTab onEditCategory={openCategoryModal} />}
          {adminTab === 'inventory' && <InventoryTab onEditProduct={openProductModal} />}
          {adminTab === 'customers' && <CustomersTab />}
          {adminTab === 'payments' && <PaymentsTab onInspectOrder={inspectOrder} />}
          {adminTab === 'reviews' && <ReviewsTab />}
          {adminTab === 'shipping' && (
            <ShippingTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} />
          )}
          {adminTab === 'settings' && (
            <SettingsTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} />
          )}
        </main>
      </div>

      {/* Admin Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />

      <OrderDetailModal
        order={orderToInspect}
        onClose={() => setOrderIdToInspect(null)}
      />
    </div>
  );
};
