import { Order, OrderStatus, ParcelLabel, StoreSettings } from '../types/index.ts';
import { formatMoney } from '../services/currencyService.ts';
import { PAYMENT_METHOD_LABELS } from './orders.ts';

const LABEL_READY_STATUSES: OrderStatus[] = ['Accepted', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

// No 0/O or 1/I/L, so a reference can be read aloud or retyped from a printed label
const PARCEL_ID_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
const PARCEL_ID_LENGTH = 10;

export const canHaveParcelLabel = (order: Order) => LABEL_READY_STATUSES.includes(order.orderStatus);

const randomParcelId = () => {
  const values = crypto.getRandomValues(new Uint32Array(PARCEL_ID_LENGTH));
  const suffix = Array.from(values, (value) => PARCEL_ID_ALPHABET[value % PARCEL_ID_ALPHABET.length]).join('');
  return `STP-${suffix}`;
};

// The QR code only carries this random reference, never customer details. It is stored
// with the order so every reprint shows the same code.
export const createParcelLabel = (takenIds: Set<string>): ParcelLabel => {
  let parcelId = randomParcelId();
  while (takenIds.has(parcelId)) parcelId = randomParcelId();

  return {
    parcelId,
    qrValue: `${window.location.origin}/#/admin/orders/${parcelId}`,
    generatedAt: new Date().toISOString(),
    printCount: 0,
  };
};

const clean = (value: unknown) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return /^(undefined|null)$/i.test(text) ? '' : text;
};

export const getMissingLabelDetails = (order: Order) =>
  [
    ['customer name', order.customer?.name],
    ['phone number', order.customer?.phone],
    ['delivery address', order.delivery?.address],
    ['city', order.delivery?.city],
  ]
    .filter(([, value]) => !clean(value))
    .map(([field]) => field as string);

export interface ParcelLabelContent {
  storeName: string;
  orderNumber: string;
  orderDate: string;
  recipientName: string;
  recipientPhone: string;
  addressLines: string[];
  items: { quantity: number; name: string }[];
  totalQuantity: number;
  paymentMethod: string;
  totalLabel: string;
  total: string;
  collectionTitle: string;
  collectionDetail: string;
  parcelId: string;
  qrValue: string;
}

const getCollection = (order: Order, total: string) => {
  if (order.paymentStatus === 'Paid') return { title: 'PAID', detail: 'Do not collect payment' };
  if (order.paymentMethod === 'cod') return { title: 'CASH ON DELIVERY', detail: `Collect ${total}` };
  return { title: 'PAYMENT PENDING', detail: 'Do not collect on delivery' };
};

// Built from the live order each time, so a reprint carries any corrected details.
export const getLabelContent = (order: Order, label: ParcelLabel, settings: StoreSettings): ParcelLabelContent => {
  const total = formatMoney(order.grandTotal);
  const collection = getCollection(order, total);
  const date = new Date(order.date);
  const cityLine = [clean(order.delivery?.city), clean(order.delivery?.postalCode)].filter(Boolean).join(' ');

  return {
    storeName: clean(settings.storeName) || 'STEROSE',
    orderNumber: clean(order.orderNumber),
    orderDate: Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    recipientName: clean(order.customer?.name),
    recipientPhone: clean(order.customer?.phone),
    addressLines: [clean(order.delivery?.address), cityLine, clean(order.delivery?.country)].filter(Boolean),
    items: order.items.map((item) => ({ quantity: item.quantity, name: clean(item.productName) })),
    totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
    paymentMethod: PAYMENT_METHOD_LABELS[order.paymentMethod] ?? '',
    totalLabel: order.paymentStatus === 'Paid' ? 'ORDER TOTAL' : 'TOTAL PAYABLE',
    total,
    collectionTitle: collection.title,
    collectionDetail: collection.detail,
    parcelId: label.parcelId,
    qrValue: label.qrValue,
  };
};
