import { StoreSettings } from '../types/index.ts';

// The store sells to Pakistan only
export const STORE_COUNTRY = 'Pakistan';

export const initialStoreSettings: StoreSettings = {
  storeName: 'STEROSE',
  storeTagline: 'Couture Fashion, Clinical Healthcare, Clean Beauty & Fine Jewelry',
  storeLogoUrl: '',
  contactEmail: 'concierge@sterose.store',
  contactPhone: '+1 (800) 829-2872',
  address: '750 Fifth Avenue, Suite 1800, New York, NY 10019',
  freeShippingThreshold: 41700,
  standardShippingFee: 0,
  expressShippingFee: 4170,
  bankDetails: {
    bankName: 'JPMorgan Chase Manhattan Private Bank',
    accountTitle: 'STEROSE Commercial Holdings LLC',
    accountNumber: '9984-7712-4091',
    iban: 'US33CHAS998477124091',
    swiftCode: 'CHASUS33XXX',
    instructions: 'Please transfer the exact invoice grand total within 48 hours. Enter your Order Number as the transfer memo / reference, then enter your Wire Reference Code in the order tracking or payment portal.',
  },
  announcementText: 'Complimentary Express Shipping on all orders over {freeShipping} | Use code STEROSE20 for 20% off',
  isAnnouncementActive: true,
};
