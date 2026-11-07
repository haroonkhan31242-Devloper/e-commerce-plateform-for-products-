export type AppView =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'order-tracking'
  | 'account'
  | 'admin';

export type AdminTab =
  | 'overview'
  | 'orders'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'customers'
  | 'payments'
  | 'coupons'
  | 'shipping'
  | 'reviews'
  | 'settings';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  id: number;
  type: ToastType;
  text: string;
  repeat: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  iconName: string;
  subcategories: string[];
  displayOrder: number;
  isActive: boolean;
  featured?: boolean;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Size", "Color", "Shade", "Pack Size"
  options: {
    label: string;
    value: string;
    colorHex?: string;
    stock: number;
    priceAdjustment?: number;
  }[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  isApproved: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  regularPrice: number;
  salePrice?: number;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  thumbnail: string;
  description: string;
  shortDescription: string;
  specifications: Record<string, string>;
  variations: ProductVariation[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  status: 'active' | 'draft' | 'archived';
  tags: string[];
  createdAt: string;
}

export interface CartItemVariationChoice {
  variationName: string;
  chosenLabel: string;
  colorHex?: string;
}

export interface CartItem {
  id: string; // generated unique key for product + variations
  productId: string;
  product: Product;
  selectedVariations: CartItemVariationChoice[];
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 
  | 'Pending Confirmation'
  | 'Accepted'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Rejected'
  | 'Cancelled';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'online_card';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'Awaiting Verification';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  isGuest: boolean;
}

export interface DeliveryInfo {
  country: string;
  city: string;
  address: string;
  postalCode: string;
  deliveryInstructions?: string;
  shippingOption: 'standard' | 'express';
  shippingCost: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariations: CartItemVariationChoice[];
}

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note: string;
  actor: 'customer' | 'admin' | 'system';
}

// STEROSE's own parcel reference. A courier's number belongs in Order.trackingNumber.
export interface ParcelLabel {
  parcelId: string;
  qrValue: string;
  generatedAt: string;
  printCount: number;
}

export interface Order {
  id: string; // e.g. "ORD-2026-8941"
  orderNumber: string;
  date: string;
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  appliedCouponCode?: string;
  shippingCharge: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  bankTransferReference?: string;
  rejectionReason?: string;
  trackingNumber?: string;
  courierName?: string;
  parcelLabel?: ParcelLabel;
  timeline: TimelineEvent[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 20 for 20% or 500 for Rs 500
  minOrderAmount: number;
  expiryDate: string;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
  description: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeLogoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
    instructions: string;
  };
  announcementText: string;
  isAnnouncementActive: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  savedAddresses: DeliveryInfo[];
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}
