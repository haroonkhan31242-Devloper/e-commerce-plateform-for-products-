import { initialCustomerProfile } from '../data/initialCustomers.ts';
import { initialOrders } from '../data/initialOrders.ts';
import { STORE_COUNTRY } from '../data/storeSettings.ts';
import { CustomerProfile, DeliveryInfo, Order, Product, StoreSettings } from '../types/index.ts';

const MIGRATION_FLAG = 'aura_pkr_migrated';

// The rate the old currency selector used, kept here only to carry saved USD amounts over
const USD_TO_PKR = 278;
const toPkr = (usd: number) => Math.round(usd * USD_TO_PKR);

const DEMO_ORDER_TEXT: [string, string][] = [
  ['WIRE-US-9988231', 'WIRE-9988231'],
  ['FDX-994827103US', 'TCS-994827103'],
  ['FedEx Priority Overnight', 'TCS Overnight'],
  ['UPS-1Z9999999999999999', 'LCS-9999999999'],
  ['UPS Express', 'Leopards Express'],
];

const migrateDelivery = (delivery: DeliveryInfo): DeliveryInfo => ({
  ...delivery,
  country: STORE_COUNTRY,
  shippingCost: toPkr(delivery.shippingCost),
});

const migrateProduct = (product: Product): Product => ({
  ...product,
  regularPrice: toPkr(product.regularPrice),
  salePrice: product.salePrice === undefined ? undefined : toPkr(product.salePrice),
  variations: product.variations.map((variation) => ({
    ...variation,
    options: variation.options.map((option) => ({
      ...option,
      priceAdjustment: option.priceAdjustment === undefined ? undefined : toPkr(option.priceAdjustment),
    })),
  })),
});

const migrateOrder = (order: Order): Order => {
  const demoOrder = initialOrders.find((demo) => demo.id === order.id);

  return {
    ...order,
    customer: demoOrder ? { ...order.customer, phone: demoOrder.customer.phone } : order.customer,
    delivery: demoOrder?.delivery ?? migrateDelivery(order.delivery),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: toPkr(item.unitPrice),
      totalPrice: toPkr(item.totalPrice),
    })),
    subtotal: toPkr(order.subtotal),
    discountAmount: toPkr(order.discountAmount),
    shippingCharge: toPkr(order.shippingCharge),
    grandTotal: toPkr(order.grandTotal),
  };
};

const migrateSettings = ({ currency: _currency, ...settings }: StoreSettings & { currency?: string }): StoreSettings => ({
  ...settings,
  freeShippingThreshold: toPkr(settings.freeShippingThreshold),
  standardShippingFee: toPkr(settings.standardShippingFee),
  expressShippingFee: toPkr(settings.expressShippingFee),
  announcementText: settings.announcementText.replace('all global orders', 'all orders'),
});

const migrateCustomer = (customer: CustomerProfile | null): CustomerProfile | null => {
  if (!customer) return null;
  const isDemoCustomer = customer.id === initialCustomerProfile.id;

  return {
    ...customer,
    phone: isDemoCustomer ? initialCustomerProfile.phone : customer.phone,
    savedAddresses: isDemoCustomer
      ? initialCustomerProfile.savedAddresses
      : customer.savedAddresses.map(migrateDelivery),
    totalSpent: toPkr(customer.totalSpent),
  };
};

const readJson = <T>(key: string): T | null => {
  const saved = localStorage.getItem(key);
  return saved ? (JSON.parse(saved) as T) : null;
};

// Browsers that visited while the store priced in USD hold those amounts in saved store data.
// Saved cart lines need no change: they re-read their prices from the catalog on load.
export const migrateStoredToPkr = () => {
  try {
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    const updates: Record<string, unknown> = {};
    const products = readJson<Product[]>('aura_products');
    const orders = readJson<Order[]>('aura_orders');
    const settings = readJson<StoreSettings>('aura_settings');
    const customer = readJson<CustomerProfile>('aura_customer');

    if (products) updates.aura_products = products.map(migrateProduct);
    if (orders) updates.aura_orders = orders.map(migrateOrder);
    if (settings) updates.aura_settings = migrateSettings(settings);
    if (customer) updates.aura_customer = migrateCustomer(customer);

    // Everything is converted before anything is written, so a failure cannot convert twice
    for (const [key, value] of Object.entries(updates)) {
      const json = JSON.stringify(value);
      const text = key === 'aura_orders'
        ? DEMO_ORDER_TEXT.reduce((result, [from, to]) => result.split(from).join(to), json)
        : json;
      localStorage.setItem(key, text);
    }

    localStorage.removeItem('aura_currency');
    localStorage.setItem(MIGRATION_FLAG, 'true');
  } catch (error) {
    console.warn('Could not convert saved store data to PKR', error);
  }
};
