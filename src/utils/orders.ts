import {
  Coupon,
  DeliveryInfo,
  Order,
  OrderStatus,
  PaymentMethod,
  StoreSettings,
  TimelineEvent,
} from '../types/index.ts';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  cod: 'Cash on Delivery',
  online_card: 'Card',
};

export const FINAL_ORDER_STATUSES: OrderStatus[] = ['Delivered', 'Rejected', 'Cancelled'];

export const appendTimelineEvent = (
  order: Order,
  event: Omit<TimelineEvent, 'timestamp'>
): Order => ({
  ...order,
  timeline: [...order.timeline, { ...event, timestamp: new Date().toISOString() }],
});

// One rule for delivery cost, shared by the cart, checkout and order records.
// Orders at or above the free-shipping threshold ship free on either speed.
export const calculateShipping = (
  subtotal: number,
  option: DeliveryInfo['shippingOption'],
  settings: StoreSettings,
  coupon: Coupon | null
): number => {
  if (subtotal === 0) return 0;
  if (coupon?.code === 'FREESHIP' || subtotal >= settings.freeShippingThreshold) return 0;
  return option === 'express' ? settings.expressShippingFee : settings.standardShippingFee;
};

export const isRevenueOrder = (order: Order) =>
  order.orderStatus !== 'Rejected' && order.orderStatus !== 'Cancelled';

export const getCustomerDirectory = (orders: Order[]) => {
  const customers = new Map<
    string,
    { name: string; email: string; phone: string; location: string; ordersCount: number; spent: number }
  >();

  for (const order of orders) {
    const key = order.customer.email.toLowerCase();
    const existing = customers.get(key);
    const spent = isRevenueOrder(order) ? order.grandTotal : 0;

    if (existing) {
      existing.ordersCount += 1;
      existing.spent += spent;
    } else {
      customers.set(key, {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        location: `${order.delivery.city}, ${order.delivery.country}`,
        ordersCount: 1,
        spent,
      });
    }
  }

  return [...customers.values()].sort((a, b) => b.spent - a.spent);
};

// Revenue for each of the last seven days, oldest first
export const getDailyRevenue = (orders: Order[], now = new Date()) =>
  Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    const amount = orders
      .filter((o) => isRevenueOrder(o) && new Date(o.date).toDateString() === day.toDateString())
      .reduce((sum, o) => sum + o.grandTotal, 0);
    return { label: day.toLocaleDateString(undefined, { weekday: 'short' }), amount };
  });
