import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  AdminTab,
  AppView,
  Product,
  Category,
  Order,
  StoreSettings,
  CartItem,
  CartItemVariationChoice,
  CustomerProfile,
  DeliveryInfo,
  OrderStatus,
  PaymentStatus,
  Review,
  ToastType,
} from '../types/index.ts';
import { initialCategories } from '../data/initialCategories.ts';
import { createDemoCustomerProfile, initialCustomerProfile } from '../data/initialCustomers.ts';
import { initialProducts } from '../data/initialProducts.ts';
import { initialOrders } from '../data/initialOrders.ts';
import { initialStoreSettings } from '../data/storeSettings.ts';
import { usePersistedState } from '../hooks/usePersistedState.ts';
import { useToastActions } from './ToastContext.tsx';
import { canHaveParcelLabel, createParcelLabel } from '../utils/parcelLabel.ts';
import { formatMoney } from '../services/currencyService.ts';
import { loginAdmin } from '../services/storeApi.ts';
import { appendTimelineEvent, calculateShipping } from '../utils/orders.ts';
import {
  calculateAverageRating,
  changeStock,
  getAvailableStock,
  getUnitPrice,
} from '../utils/product.ts';

interface StoreContextType {
  // Navigation & Views
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (sub: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  saleOnly: boolean;
  setSaleOnly: (saleOnly: boolean) => void;
  navigateToProduct: (productId: string) => void;
  navigateToCategory: (categorySlug: string, subcategory?: string) => void;
  browseAllProducts: () => void;
  browseOffers: () => void;
  searchProducts: (query: string) => void;
  trackOrder: (orderId: string) => void;

  // Data
  products: Product[];
  categories: Category[];
  orders: Order[];
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;

  // Cart & Wishlist
  cart: CartItem[];
  wishlist: string[];
  addToCart: (
    product: Product,
    quantity: number,
    variations?: CartItemVariationChoice[],
    options?: { openDrawer?: boolean }
  ) => boolean;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Modals & Drawers
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isWishlistDrawerOpen: boolean;
  setIsWishlistDrawerOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  // Pricing
  formatPrice: (amount: number) => string;
  cartSubtotal: number;
  cartShipping: number;
  cartGrandTotal: number;
  cartItemCount: number;
  getShippingCost: (option: DeliveryInfo['shippingOption']) => number;

  // Orders
  lastPlacedOrder: Order | null;
  trackingOrderId: string | null;
  placeOrder: (orderPayload: Omit<Order, 'id' | 'orderNumber' | 'date' | 'timeline' | 'orderStatus'>) => Order;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string, courierName?: string, trackingNumber?: string) => void;
  updatePaymentStatus: (orderId: string, newStatus: PaymentStatus) => void;
  submitBankTransferReference: (orderId: string, reference: string) => void;
  generateParcelLabel: (orderId: string) => void;
  recordParcelLabelPrint: (orderId: string) => void;
  scannedParcelId: string | null;
  setScannedParcelId: (parcelId: string | null) => void;

  // Product CRUD (Admin)
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'rating' | 'reviewCount'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, delta: number) => void;

  // Category CRUD (Admin)
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => boolean;


  // Reviews CRUD
  addProductReview: (productId: string, review: Omit<Review, 'id' | 'date' | 'isApproved'>) => void;
  moderateReview: (productId: string, reviewId: string, isApproved: boolean) => void;
  deleteReview: (productId: string, reviewId: string) => void;

  // Authentication states
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  adminLogout: () => void;
  customerUser: CustomerProfile | null;
  customerLogin: (email: string, name?: string) => void;
  customerLogout: () => void;
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;

  // Toast
  showToast: (type: ToastType, text: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToastActions();

  // Navigation
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saleOnly, setSaleOnly] = useState(false);

  // Primary Data
  const [products, setProducts] = usePersistedState<Product[]>('aura_products', initialProducts, () =>
    showToast('error', 'Browser storage is full. Recent product changes will be lost on refresh.')
  );
  const [categories, setCategories] = usePersistedState<Category[]>('aura_categories', initialCategories, () =>
    showToast('error', 'Browser storage is full. Recent category changes will be lost on refresh.')
  );
  const [orders, setOrders] = usePersistedState<Order[]>('aura_orders', initialOrders);
  const [storeSettings, setStoreSettings] = usePersistedState<StoreSettings>('aura_settings', initialStoreSettings);

  // Cart & Wishlist
  const [cart, setCart] = usePersistedState<CartItem[]>('aura_cart', []);
  const [wishlist, setWishlist] = usePersistedState<string[]>('aura_wishlist', ['prod-ladies-1', 'prod-jewel-1']);

  // UI state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);


  // Authentication
  const [scannedParcelId, setScannedParcelId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aura_admin_logged') === 'true';
  });
  const [customerUser, setCustomerUser] = usePersistedState<CustomerProfile | null>(
    'aura_customer',
    initialCustomerProfile
  );

  const [lastPlacedOrderId, setLastPlacedOrderId] = usePersistedState<string | null>('aura_last_order', null);
  const lastPlacedOrder = orders.find((o) => o.id === lastPlacedOrderId) ?? null;
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);


  // Cart lines follow catalog edits: price and stock changes apply, deleted products drop out
  useEffect(() => {
    setCart((prev) => {
      const next = prev.flatMap((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return [];
        return [{ ...item, product, unitPrice: getUnitPrice(product, item.selectedVariations) }];
      });
      const isUnchanged = next.every(
        (item, i) => item.product === prev[i]?.product && item.unitPrice === prev[i]?.unitPrice
      );
      return isUnchanged && next.length === prev.length ? prev : next;
    });
  }, [products, setCart]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const getShippingCost = (option: DeliveryInfo['shippingOption']) =>
    calculateShipping(cartSubtotal, option, storeSettings);

  const cartShipping = getShippingCost('standard');

  const cartGrandTotal = useMemo(() => {
    const total = cartSubtotal + cartShipping;
    return Math.max(0, total);
  }, [cartSubtotal, cartShipping]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Wishlist Actions
  const toggleWishlist = (productId: string) => {
    const exists = wishlist.includes(productId);
    setWishlist((prev) => (exists ? prev.filter((id) => id !== productId) : [...prev, productId]));
    showToast(exists ? 'info' : 'success', exists ? 'Removed from your wishlist.' : 'Added to your wishlist.');
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Cart Actions
  const addToCart = (
    product: Product,
    quantity = 1,
    variations: CartItemVariationChoice[] = [],
    { openDrawer = true }: { openDrawer?: boolean } = {}
  ) => {
    // Generate unique ID based on product and chosen variation values
    const varKey = variations.map((v) => `${v.variationName}:${v.chosenLabel}`).sort().join('|');
    const cartItemId = `${product.id}_${varKey}`;

    const existing = cart.find((item) => item.id === cartItemId);
    const newQty = (existing?.quantity ?? 0) + quantity;
    const productQtyInCart = cart
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    const available = getAvailableStock(product, variations);

    if (newQty > available || productQtyInCart + quantity > product.stock) {
      showToast('error', `Sorry, only ${Math.min(available, product.stock)} available.`);
      return false;
    }

    setCart((prevCart) =>
      existing
        ? prevCart.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
        : [
            ...prevCart,
            {
              id: cartItemId,
              productId: product.id,
              product,
              selectedVariations: variations,
              quantity: newQty,
              unitPrice: getUnitPrice(product, variations),
            },
          ]
    );

    if (openDrawer) {
      setIsCartDrawerOpen(true);
    } else {
      showToast('success', `Added "${product.name}" to your bag.`);
    }
    return true;
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const item = cart.find((i) => i.id === cartItemId);
    if (!item) return;

    const otherLinesQty = cart
      .filter((i) => i.productId === item.productId && i.id !== cartItemId)
      .reduce((sum, i) => sum + i.quantity, 0);
    const limit = Math.min(
      getAvailableStock(item.product, item.selectedVariations),
      item.product.stock - otherLinesQty
    );

    if (newQty > limit) {
      showToast('error', `Only ${limit} available.`);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i)));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('info', 'Item removed from shopping cart.');
  };

  // Navigation helpers
  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
  };

  const showProducts = (categorySlug: string | null, subcategory: string | null, query: string, sale: boolean) => {
    setSelectedCategorySlug(categorySlug);
    setSelectedSubcategory(subcategory);
    setSearchQuery(query);
    setSaleOnly(sale);
    setCurrentView('products');
  };

  const navigateToCategory = (categorySlug: string, subcategory?: string) =>
    showProducts(categorySlug, subcategory || null, '', false);
  const browseAllProducts = () => showProducts(null, null, '', false);
  const browseOffers = () => showProducts(null, null, '', true);
  const searchProducts = (query: string) => showProducts(null, null, query.trim(), false);

  const trackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setCurrentView('order-tracking');
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  // Order Placement
  const placeOrder = (payload: Omit<Order, 'id' | 'orderNumber' | 'date' | 'timeline' | 'orderStatus'>): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-2026-${randomSuffix}`;
    const newOrder: Order = {
      ...payload,
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      orderStatus: 'Pending Confirmation',
      timeline: [
        {
          status: 'Pending Confirmation',
          timestamp: new Date().toISOString(),
          note: payload.paymentMethod === 'bank_transfer'
            ? `Order registered with Wire Reference: ${payload.bankTransferReference || 'Pending Submission'}. Awaiting Admin Review.`
            : payload.paymentMethod === 'cod'
            ? 'Order placed under Cash on Delivery (COD). Awaiting Admin Confirmation.'
            : 'Order placed with online payment authorization. Awaiting Admin Review.',
          actor: 'customer',
        },
      ],
    };

    // Decrement stock for every line item, including the chosen options
    setProducts((prev) =>
      prev.map((prod) =>
        payload.items
          .filter((item) => item.productId === prod.id)
          .reduce((next, item) => changeStock(next, item.selectedVariations, -item.quantity), prod)
      )
    );

    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrderId(newOrder.id);
    setCart([]);
    setCurrentView('order-confirmation');
    showToast('success', `Order ${orderNumber} placed successfully!`);
    return newOrder;
  };

  const updateOrderById = (orderId: string, update: (order: Order) => Order) => {
    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? update(ord) : ord)));
  };

  // A rejected or cancelled order returns its units to inventory
  const restockOrder = (order: Order) => {
    setProducts((prev) =>
      prev.map((prod) =>
        order.items
          .filter((item) => item.productId === prod.id)
          .reduce((next, item) => changeStock(next, item.selectedVariations, item.quantity), prod)
      )
    );
  };

  const restockOrderOnce = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order && order.orderStatus !== 'Rejected' && order.orderStatus !== 'Cancelled') {
      restockOrder(order);
    }
  };

  // Admin Order Acceptance & Rejection
  const acceptOrder = (orderId: string) => {
    updateOrderById(orderId, (ord) => ({
      ...appendTimelineEvent(ord, {
        status: 'Accepted',
        note: 'Order approved by Administrator. Moving into Processing & Fulfillment.',
        actor: 'admin',
      }),
      orderStatus: 'Accepted',
    }));
    showToast('success', 'Order accepted and forwarded to fulfillment!');
  };

  const rejectOrder = (orderId: string, reason: string) => {
    restockOrderOnce(orderId);
    updateOrderById(orderId, (ord) => ({
      ...appendTimelineEvent(ord, {
        status: 'Rejected',
        note: `Order rejected by Administrator. Reason: ${reason}`,
        actor: 'admin',
      }),
      orderStatus: 'Rejected',
      rejectionReason: reason,
    }));
    showToast('info', 'Order has been rejected.');
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    courierName?: string,
    trackingNumber?: string
  ) => {
    if (newStatus === 'Cancelled') restockOrderOnce(orderId);
    updateOrderById(orderId, (ord) => ({
      ...appendTimelineEvent(ord, {
        status: newStatus,
        note: note || `Order status updated to ${newStatus}.`,
        actor: 'admin',
      }),
      orderStatus: newStatus,
      courierName: courierName || ord.courierName,
      trackingNumber: trackingNumber || ord.trackingNumber,
    }));
    showToast('success', `Order status changed to "${newStatus}"`);
  };

  // A label belongs to an order for good: reprints reuse it, so its QR code never changes
  const generateParcelLabel = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !canHaveParcelLabel(order)) {
      showToast('error', 'Accept this order before generating its parcel label.');
      return;
    }
    if (order.parcelLabel) {
      showToast('info', 'This order already has a parcel label.');
      return;
    }

    const takenIds = new Set(orders.flatMap((o) => (o.parcelLabel ? [o.parcelLabel.parcelId] : [])));
    const label = createParcelLabel(takenIds);
    updateOrderById(orderId, (ord) => (ord.parcelLabel ? ord : { ...ord, parcelLabel: label }));
    showToast('success', `Parcel label ${label.parcelId} generated.`);
  };

  const recordParcelLabelPrint = (orderId: string) => {
    updateOrderById(orderId, (ord) =>
      ord.parcelLabel ? { ...ord, parcelLabel: { ...ord.parcelLabel, printCount: ord.parcelLabel.printCount + 1 } } : ord
    );
  };

  const updatePaymentStatus = (orderId: string, newStatus: PaymentStatus) => {
    updateOrderById(orderId, (ord) => ({ ...ord, paymentStatus: newStatus }));
    showToast('success', `Payment status updated to "${newStatus}"`);
  };

  const submitBankTransferReference = (orderId: string, reference: string) => {
    updateOrderById(orderId, (ord) => ({
      ...appendTimelineEvent(ord, {
        status: ord.orderStatus,
        note: `Customer submitted payment reference: ${reference}`,
        actor: 'customer',
      }),
      bankTransferReference: reference,
      paymentStatus: 'Awaiting Verification',
    }));
    showToast('success', 'Bank transfer reference submitted for administrator verification.');
  };

  const updateProductById = (productId: string, update: (product: Product) => Product) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? update(p) : p)));
  };

  // Product CRUD
  const addProduct = (newProdData: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'rating' | 'reviewCount'>): Product => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      reviews: [],
      rating: 5.0,
      reviewCount: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast('success', `Product "${newProduct.name}" created successfully!`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    updateProductById(id, (p) => ({ ...p, ...updates }));
    showToast('success', 'Product updated successfully.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setWishlist((prev) => prev.filter((productId) => productId !== id));
    showToast('info', 'Product removed from catalog.');
  };

  const adjustStock = (productId: string, delta: number) => {
    updateProductById(productId, (p) => ({ ...p, stock: Math.max(0, p.stock + delta) }));
    showToast('success', 'Inventory adjusted.');
  };

  // Category CRUD
  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast('success', `Category "${newCat.name}" added to store navigation!`);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (updates.name) {
      setProducts((prev) =>
        prev.map((p) => (p.categoryId === id ? { ...p, categoryName: updates.name as string } : p))
      );
    }
    showToast('success', 'Category updated successfully.');
  };

  const deleteCategory = (id: string) => {
    const productCount = products.filter((p) => p.categoryId === id).length;
    if (productCount > 0) {
      showToast('error', `Move or delete the ${productCount} product(s) in this category first.`);
      return false;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Category removed.');
    return true;
  };

  // Reviews Moderation
  const withReviews = (product: Product, reviews: Review[]): Product => ({
    ...product,
    reviews,
    rating: calculateAverageRating(reviews),
    reviewCount: reviews.length,
  });

  const addProductReview = (productId: string, review: Omit<Review, 'id' | 'date' | 'isApproved'>) => {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isApproved: true, // auto-approved for instant demo visibility, admin can moderate
    };
    updateProductById(productId, (p) => withReviews(p, [newRev, ...p.reviews]));
    showToast('success', 'Thank you! Your verified review has been published.');
  };

  const moderateReview = (productId: string, reviewId: string, isApproved: boolean) => {
    updateProductById(productId, (p) => ({
      ...p,
      reviews: p.reviews.map((r) => (r.id === reviewId ? { ...r, isApproved } : r)),
    }));
    showToast('success', `Review ${isApproved ? 'approved' : 'hidden'}.`);
  };

  const deleteReview = (productId: string, reviewId: string) => {
    updateProductById(productId, (p) => withReviews(p, p.reviews.filter((r) => r.id !== reviewId)));
    showToast('info', 'Review deleted.');
  };

  // Auth
  const adminLogin = async (email: string, pass: string) => {
    const isValid = await loginAdmin(email, pass);
    if (!isValid) {
      showToast('error', 'Incorrect email or password.');
      return false;
    }
    setIsAdminAuthenticated(true);
    localStorage.setItem('aura_admin_logged', 'true');
    showToast('success', 'Welcome back, Administrator.');
    return true;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('aura_admin_logged');
    setCurrentView('home');
    showToast('info', 'Admin logged out.');
  };

  const customerLogin = (email: string, name?: string) => {
    const profile = createDemoCustomerProfile(email, name);
    setCustomerUser(profile);
    showToast('success', `Signed in as ${profile.name}`);
  };

  const customerLogout = () => {
    setCustomerUser(null);
    showToast('info', 'You have been signed out.');
  };

  const updateCustomerProfile = (updates: Partial<CustomerProfile>) => {
    setCustomerUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        adminTab,
        setAdminTab,
        selectedProductId,
        setSelectedProductId,
        selectedCategorySlug,
        setSelectedCategorySlug,
        selectedSubcategory,
        setSelectedSubcategory,
        searchQuery,
        setSearchQuery,
        saleOnly,
        setSaleOnly,
        navigateToProduct,
        navigateToCategory,
        browseAllProducts,
        browseOffers,
        searchProducts,
        trackOrder,
        products,
        categories,
        orders,
        storeSettings,
        setStoreSettings,
        cart,
        wishlist,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        toggleWishlist,
        isInWishlist,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isWishlistDrawerOpen,
        setIsWishlistDrawerOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        formatPrice: formatMoney,
        cartSubtotal,
        cartShipping,
        cartGrandTotal,
        cartItemCount,
        getShippingCost,
        lastPlacedOrder,
        trackingOrderId,
        placeOrder,
        acceptOrder,
        rejectOrder,
        updateOrderStatus,
        updatePaymentStatus,
        submitBankTransferReference,
        generateParcelLabel,
        recordParcelLabelPrint,
        scannedParcelId,
        setScannedParcelId,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCategory,
        updateCategory,
        deleteCategory,
        addProductReview,
        moderateReview,
        deleteReview,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        customerUser,
        customerLogin,
        customerLogout,
        updateCustomerProfile,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
